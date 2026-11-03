import React,{useEffect,useRef,useState} from 'react';
import {View,Linking} from 'react-native';
import {Txt} from '@/components/ui/Txt';
import {Button} from '@/components/ui/Button';
import {Colors} from '@/constants/colors';
import {useLanguage} from '@/context/LanguageContext';
import {SHOP_DISPLAY_NAMES,type ShopPrice} from '@/types/domain';
import {formatGrosze,refreshCatalogProduct} from '@/features/pricing/pricingApi';
import {formatPackageSize,formatPackageUnit} from '@/features/pricing/packageDisplay';
import {jobProductKey,type ReviewedJobProduct} from '@/features/pricing/jobProduct';
import {JobProductPriceCache} from '@/features/pricing/jobProductPriceCache';
import {storePriceComparisonLabel} from '@/features/pricing/priceChanges';
import type {CatalogProductRefresh} from '../../../../lib/pricing-service/src/catalog-refresh';

const cache=new JobProductPriceCache(refreshCatalogProduct);

export function JobProductPrices({product,links=[]}:{product:ReviewedJobProduct|null;links?:readonly ShopPrice[]}){
  const {language}=useLanguage(),pl=language==='pl',key=product?jobProductKey(product.identity):null;
  const [data,setData]=useState<CatalogProductRefresh|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(false),[otherLinks,setOtherLinks]=useState(false);
  const generation=useRef(0);
  const load=async(force=false)=>{
    if(!product)return;
    const request=++generation.current;setLoading(true);setError(false);setData(null);
    try{const result=await cache.read(product.identity,force);if(request===generation.current)setData(result);}
    catch{if(request===generation.current)setError(true);}
    finally{if(request===generation.current)setLoading(false);}
  };
  useEffect(()=>{setData(null);setError(false);setOtherLinks(false);setLoading(false);if(product)void load();return()=>{generation.current++;};},[key]);
  const date=(s:string)=>new Intl.DateTimeFormat(pl?'pl-PL':'en-GB',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Warsaw'}).format(new Date(s));
  const offers=key&&data&&jobProductKey(data.identity)===key?data.offers??[]:[];
  return <View style={{gap:8}} accessibilityLiveRegion="polite">
    {product?.example&&<Txt style={{fontSize:12,lineHeight:18,color:Colors.textSecondary}}>{pl?`Przykładowy model: ${product.name}. Dobierz narzędzie do powierzchni i używanego preparatu.`:`Example model: ${product.name}. Choose a tool suitable for the surface and coating.`}</Txt>}
    {loading&&<Txt style={{fontSize:13,color:Colors.textSecondary}}>{pl?'Sprawdzam ceny w sklepach…':'Checking store prices…'}</Txt>}
    {offers.length>0&&<>
      <Txt w="semibold" style={{fontSize:12,color:Colors.textSecondary}}>{pl?'Ceny brutto — bez dostawy':'Prices include VAT — delivery excluded'}</Txt>
      {offers.map(offer=>{
        const pack=`${formatPackageSize(offer.packageSize,language)} ${formatPackageUnit(offer.unit)}`;
        const change=storePriceComparisonLabel(offer.deltaGrosze,language);
        return <View key={offer.offerId} style={{gap:6,padding:12,borderRadius:12,borderWidth:1,borderColor:Colors.border,backgroundColor:Colors.surface}}>
          <Txt w="semibold" style={{fontSize:13}}>{offer.store}</Txt>
          <Txt w="bold" style={{fontSize:19,color:Colors.text}}>{formatGrosze(offer.priceGrosze)} / {pack}</Txt>
          <Txt style={{fontSize:13,color:offer.deltaGrosze?offer.deltaGrosze>0?Colors.text:Colors.primaryDark:Colors.textSecondary}}>{change}{offer.deltaGrosze ? ` / ${pack}` : ''}</Txt>
          {offer.previous&&<Txt style={{fontSize:11,lineHeight:17,color:Colors.textMuted}}>{pl?'Poprzednio w tym sklepie':'Previously at this store'}: {formatGrosze(offer.previous.priceGrosze)} / {pack} · {date(offer.previous.checkedAt)}</Txt>}
          <Txt style={{fontSize:11,color:Colors.textMuted}}>{pl?'Sprawdzono':'Checked'}: {date(offer.checkedAt)} ({pl?'Warszawa':'Warsaw'})</Txt>
          <Button size="sm" variant="outline" label={pl?`Kup w ${offer.store}`:`Buy at ${offer.store}`} onPress={()=>{void Linking.openURL(offer.sourceUrl).catch(()=>{});}}/>
        </View>;
      })}
    </>}
    {!loading&&!offers.length&&<Txt style={{fontSize:12,lineHeight:18,color:Colors.textSecondary}}>{product?(error?(pl?'Nie udało się teraz pobrać ceny. Spróbuj ponownie.':'Could not load the price. Please try again.'):(pl?'Brak potwierdzonej bieżącej ceny tego modelu.':'No confirmed current price for this model.')):(pl?'Bieżąca cena nie jest jeszcze potwierdzona.':'A current price has not been confirmed yet.')}</Txt>}
    {product&&<Button size="sm" variant="ghost" label={pl?'Odśwież ceny':'Refresh prices'} loading={loading} onPress={()=>{void load(true);}}/>}
    {data&&data.refresh.failedOfferIds.length>0&&<Txt style={{fontSize:11,lineHeight:17,color:Colors.textMuted}}>{pl?'Części ofert nie udało się potwierdzić. Lista cen może być niepełna.':'Some offers could not be confirmed. The list may be incomplete.'}</Txt>}
    {links.length>0&&<>
      <Button size="sm" variant="ghost" label={pl?(otherLinks?'Ukryj pozostałe linki':'Inne sklepy — ceny niepotwierdzone'):(otherLinks?'Hide other links':'Other stores — prices unconfirmed')} onPress={()=>setOtherLinks(value=>!value)}/>
      {otherLinks&&links.map((link,index)=><Button key={`${link.shop}-${index}`} size="sm" variant="outline" label={pl?`Otwórz kartę: ${SHOP_DISPLAY_NAMES[link.shop]}`:`Open product: ${SHOP_DISPLAY_NAMES[link.shop]}`} onPress={()=>{void Linking.openURL(link.url).catch(()=>{});}}/>)}
    </>}
  </View>;
}
