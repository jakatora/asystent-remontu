import React,{useEffect,useState} from 'react';
import {Linking,View} from 'react-native';
import {Txt} from '@/components/ui/Txt';
import {Button} from '@/components/ui/Button';
import {Colors} from '@/constants/colors';
import {useLanguage} from '@/context/LanguageContext';
import {createPostalPlaceLookup,normalizePickupPostcode,pickupAddressMapUrl,pickupLocationsFor,rankPickupLocations,type PostalPlace} from '@/features/pricing/pickupLocations';

const lookupPlace=createPostalPlaceLookup();
const englishHours=(value:string)=>value.replace('Pn–sob','Mon–Sat').replace('niedz. handlowe','trading Sundays').replace(/Pn–pt|pn–pt/g,'Mon–Fri').replace('sob. i niedz. nieczynne','Sat and Sun closed').replace('sob. nieczynne','Sat closed').replace('sob.','Sat').replace('BOK:','Customer service:');
export function PickupLocationCards({store,location}:{store:string;location:string}){
  const {language}=useLanguage(),tr=(pl:string,en:string)=>language==='pl'?pl:en;
  const [lookup,setLookup]=useState<{code:string;status:'loading'|'done';place:PostalPlace|null}|null>(null),[showAll,setShowAll]=useState(false),[failed,setFailed]=useState(false);
  const code=normalizePickupPostcode(location),catalogue=pickupLocationsFor(store),canLocate=catalogue.some(row=>row.mapCentre);
  useEffect(()=>{setShowAll(false);setFailed(false);},[store,location]);
  useEffect(()=>{
    if(!code||!canLocate){setLookup(null);return;}
    const controller=new AbortController();let current=true;setLookup({code,status:'loading',place:null});
    void lookupPlace(code,controller.signal).then(place=>{if(current)setLookup({code,status:'done',place});});
    return()=>{current=false;controller.abort();};
  },[code,canLocate]);
  const place=lookup?.code===code?lookup.place:null,rows=rankPickupLocations(store,location,place);
  const open=(url:string)=>void Linking.openURL(url).catch(()=>setFailed(true));
  if(!catalogue.length)return null;
  return <View style={{gap:10}}>
    <Txt w="semibold">{tr('Potwierdzone adresy odbioru','Verified collection addresses')} ({rows.length === catalogue.length ? catalogue.length : tr(`${rows.length} z ${catalogue.length}`,`${rows.length} of ${catalogue.length}`)})</Txt>
    {code&&canLocate&&lookup?.status==='loading'&&<Txt accessibilityLiveRegion="polite" style={{color:Colors.textSecondary}}>{tr('Ustalamy miejscowość dla kodu…','Looking up the postcode town…')}</Txt>}
    {place&&<Txt style={{color:Colors.textSecondary,lineHeight:20}}>{tr(`Okolica kodu ${place.postalCode}: ${place.name}. Odległości są orientacyjne, w linii prostej od środka miejscowości; trasę sprawdź w Mapach.`,`Postcode area ${place.postalCode}: ${place.name}. Distances are approximate straight lines from the town centre; check your route in Maps.`)}</Txt>}
    {code&&canLocate&&lookup?.code===code&&lookup.status==='done'&&!place&&<Txt style={{color:Colors.textSecondary,lineHeight:20}}>{tr('Nie udało się ustalić położenia kodu. Nadal możesz sprawdzić adresy i otworzyć mapę.','The postcode location could not be found. Addresses and maps are still available.')}</Txt>}
    {(showAll?rows:rows.slice(0,3)).map(({location:row,distanceKm})=><View key={row.id} style={{padding:12,gap:7,borderWidth:1,borderColor:Colors.border,borderRadius:12,backgroundColor:Colors.surfaceAlt}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><Txt w="bold">{row.city}</Txt>{distanceKm!==null&&<Txt>{tr('około','about')} {distanceKm<1?'< 1':Math.round(distanceKm)} km</Txt>}</View>
      <Txt>{row.street}, {row.postalCode} {row.city}</Txt>
      <Txt style={{color:Colors.textSecondary}}>{row.phone.replace(/^(\+48)(\d{3})(\d{3})(\d{3})$/,'$1 $2 $3 $4')}</Txt>
      {row.contactHours&&<Txt style={{color:Colors.textSecondary,lineHeight:20}}>{tr(row.contactHours,englishHours(row.contactHours))}</Txt>}
      {row.hours&&<Txt style={{color:Colors.textSecondary,lineHeight:20}}>{tr(row.hours,englishHours(row.hours))}</Txt>}
      {row.collectionNote&&<Txt style={{lineHeight:20}}>{tr(row.collectionNote.pl,row.collectionNote.en)}</Txt>}
      <Txt style={{color:Colors.textSecondary,fontSize:13}}>{tr('Adres sprawdzony: '+row.checkedAt.split('-').reverse().join('.'),'Address checked: '+row.checkedAt)}</Txt>
      {row.collectionOnly&&<Txt style={{lineHeight:20}}>{tr('Magazyn wydaje zamówienia internetowe po potwierdzeniu gotowości. Nie prowadzi sprzedaży stacjonarnej.','This warehouse releases online orders after readiness confirmation. It does not sell on site.')}</Txt>}
      <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
        <Button variant="outline" label={tr(`Mapa: ${row.city}`,`Map: ${row.city}`)} onPress={()=>{const url=pickupAddressMapUrl(row.id);if(url)open(url);}} />
        <Button variant="outline" label={tr(`Zadzwoń: ${row.city}`,`Call: ${row.city}`)} onPress={()=>open('tel:'+row.phone)} />
      </View>
      <Button variant="outline" label={tr(`Dane punktu na stronie ${store}`,`Location details on ${store}`)} onPress={()=>open(row.sourceUrl)} />
    </View>)}
    {!rows.length&&<Txt style={{lineHeight:20}}>{tr('Nie mamy potwierdzonego punktu pasującego do tej nazwy. Spróbuj innego miasta lub otwórz oficjalną listę sklepów.','No verified location matches this name. Try another town or open the official store directory.')}</Txt>}
    {!showAll&&rows.length>3&&<Button variant="outline" label={tr(`Pokaż wszystkie punkty (${rows.length})`,`Show all locations (${rows.length})`)} onPress={()=>setShowAll(true)} />}
    {failed&&<Txt accessibilityRole="alert">{tr('Nie udało się otworzyć odnośnika. Spróbuj ponownie.','The link could not be opened. Try again.')}</Txt>}
    <Txt style={{color:Colors.textSecondary,fontSize:13,lineHeight:19}}>{tr('Przed wyjazdem potwierdź godziny, lokalną cenę, zapas i możliwość odbioru. Dojazd nie jest wliczony w koszt materiałów.','Confirm opening hours, local prices, stock and collection before travelling. Travel is excluded from material costs.')}</Txt>
    {place&&<Txt accessibilityRole="link" onPress={()=>open('https://www.geonames.org/')} style={{color:Colors.primary,fontSize:13,lineHeight:19,minHeight:44,paddingVertical:10,textDecorationLine:'underline'}}>{tr('Położenie miejscowości: GeoNames przez Zippopotam.us ↗','Town coordinates: GeoNames via Zippopotam.us ↗')}</Txt>}
  </View>;
}
