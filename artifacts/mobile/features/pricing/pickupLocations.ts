export interface PickupLocation {
  id: string; store: string; city: string; street: string; postalCode: string; phone: string;
  hours?: string; contactHours?: string; sourceUrl: string; checkedAt: string; collectionOnly?: boolean;
  /** Centre of the map published by the retailer; approximate, not a surveyed entrance. */
  mapCentre?: { latitude: number; longitude: number };
  /** Exact place identifier from the retailer's own embedded map. */
  mapCid?: string;
}
const checkedAt = '2026-10-26';
const seweraSource = 'https://sklep.sewera.pl/miejsca-odbioru';
// Addresses, contact and map centres reviewed directly on the official directory.
// source: https://sklep.sewera.pl/miejsca-odbioru
const sewera = [
  {id:'katowice',city:'Katowice',street:'ul. Kościuszki 326',postalCode:'40-608',phone:'+48662201190',latitude:50.21621,longitude:18.983619,mapCid:'6187941980679851954',hours:'Pn–pt 6:30–17:00, sob. 6:30–14:30'},
  {id:'chrzanow',city:'Chrzanów',street:'ul. Śląska 64a',postalCode:'32-500',phone:'+48662201064',latitude:50.14707,longitude:19.38315,mapCid:'3182546562425580444',hours:'Pn–pt 6:30–17:00, sob. 6:30–14:30'},
  {id:'dabrowa-gornicza',city:'Dąbrowa Górnicza',street:'ul. Kasprzaka 33',postalCode:'41-303',phone:'+48662201076',latitude:50.338851,longitude:19.25332,mapCid:'1303610094905064549',hours:'Pn–pt 6:30–17:00, sob. 6:30–14:30'},
  {id:'gliwice',city:'Gliwice',street:'ul. Dojazdowa 11',postalCode:'44-100',phone:'+48662201052',latitude:50.274214,longitude:18.695061,mapCid:'6217510467594825994',hours:'Pn–pt 6:30–16:00, sob. nieczynne'},
  {id:'oswiecim',city:'Oświęcim',street:'ul. Wyzwolenia 19',postalCode:'32-600',phone:'+48662201071',latitude:50.037857,longitude:19.196636,mapCid:'9939469601971790881',hours:'Pn–pt 6:30–16:00, sob. 6:30–14:30'},
  {id:'sosnowiec',city:'Sosnowiec',street:'ul. Rudna 14',postalCode:'41-214',phone:'+48323630333',latitude:50.288325,longitude:19.110187,mapCid:'11779160180593502866',hours:'Pn–pt 6:30–17:00, sob. 6:30–14:30'},
  {id:'tarnowskie-gory',city:'Tarnowskie Góry',street:'ul. Nakielska 24',postalCode:'42-600',phone:'+48323811777',latitude:50.442669,longitude:18.868043,mapCid:'8252299477358544826',hours:'Pn–pt 6:30–17:00, sob. 6:30–14:30'},
];
export const PICKUP_LOCATIONS: readonly PickupLocation[] = [
  // The shop explicitly names this address for collecting purchased goods.
  // source: https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i
  {id:'tokmet-bielsko-biala',store:'TOK-MET',city:'Bielsko-Biała',street:'ul. Bystrzańska 106A',postalCode:'43-300',phone:'+48338215731',hours:'Pn–pt 7:00–19:00, sob. 8:00–13:00',checkedAt,sourceUrl:'https://sklep.tokmet.pl/wezyk_do_baterii_stojacej_38_x_m101_l__30_cm_dluga_koncowka-2806i'},
  ...sewera.map(({latitude,longitude,...row})=>({...row,id:'sewera-'+row.id,store:'Sewera',checkedAt,sourceUrl:seweraSource,mapCentre:{latitude,longitude}})),
  // Online orders only, after readiness confirmation. The old map link on this
  // page points elsewhere, so do not assign it to the current Batorowo warehouse.
  // source: https://folnet.pl/pl/cms/odbior-osobisty-30.html
  {id:'folnet-batorowo',store:'Folnet',city:'Batorowo',street:'ul. Stefana Batorego 97',postalCode:'62-081',phone:'+48618674040',hours:'Pn–pt 7:00–20:00, sob. i niedz. nieczynne',contactHours:'BOK: pn–pt 8:00–15:00',collectionOnly:true,checkedAt,sourceUrl:'https://folnet.pl/pl/cms/odbior-osobisty-30.html'},
  // source: https://centrummatbud.pl/contact
  {id:'matbud-poznan',store:'Centrum Matbud',city:'Poznań',street:'ul. Pokrzywno 21',postalCode:'61-315',phone:'+48695643158',checkedAt,sourceUrl:'https://centrummatbud.pl/contact',mapCid:'1358162769664307638',mapCentre:{latitude:52.354658148457396,longitude:16.97852147693974}},
];
export interface PostalPlace { postalCode: string; name: string; latitude: number; longitude: number }
export const normalizePickupPostcode=(value:string):string|null=>/^\d{2}-?\d{3}$/.test(value.trim())?value.trim().replace('-','').replace(/^(\d{2})(\d{3})$/,'$1-$2'):null;
const validPoint=(value:{latitude:number;longitude:number})=>Number.isFinite(value.latitude)&&Number.isFinite(value.longitude)&&value.latitude>=49&&value.latitude<=55.5&&value.longitude>=14&&value.longitude<=24.5;
export function parsePostalPlace(value:any,postalCode:string):PostalPlace|null {
  if(!normalizePickupPostcode(postalCode)||value?.['country abbreviation']!=='PL'||value['post code']!==postalCode||!Array.isArray(value.places)||value.places.length!==1)return null;
  const row=value.places[0];if(typeof row?.['place name']!=='string'||!row['place name'].trim()||row['place name'].length>80||/[\u0000-\u001f]/.test(row['place name']))return null;
  const place={postalCode,name:row['place name'].trim(),latitude:Number(row.latitude),longitude:Number(row.longitude)};
  return validPoint(place)?place:null;
}
/** Approximate straight-line distance between published map centres, not a
 * driving route, travel cost, street-level postcode or local stock confirmation. */
export function approximateDistanceKm(from:PostalPlace,to:PickupLocation):number|null {
  if(!to.mapCentre||!validPoint(from)||!validPoint(to.mapCentre))return null;
  const radians=(n:number)=>n*Math.PI/180,a=radians(from.latitude),b=radians(to.mapCentre.latitude);
  const h=Math.sin((b-a)/2)**2+Math.cos(a)*Math.cos(b)*Math.sin(radians(to.mapCentre.longitude-from.longitude)/2)**2;
  return 6371*2*Math.asin(Math.sqrt(Math.max(0,Math.min(1,h))));
}
export const pickupLocationsFor=(store:string)=>PICKUP_LOCATIONS.filter(row=>row.store===store);
const normalize=(value:string)=>value.toLocaleLowerCase('pl').normalize('NFD').replace(/\p{M}/gu,'').replace(/ł/g,'l').trim();
export function rankPickupLocations(store:string,location:string,place?:PostalPlace|null){
  const all=pickupLocationsFor(store),code=normalizePickupPostcode(location),query=normalize(location),current=code&&place?.postalCode===code?place:null;
  return all.filter(row=>all.length===1||code||!query||normalize(row.city+' '+row.street+' '+row.postalCode).includes(query))
    .map(row=>({location:row,distanceKm:current?approximateDistanceKm(current,row):null}))
    .sort((a,b)=>(a.distanceKm??Infinity)-(b.distanceKm??Infinity)||a.location.city.localeCompare(b.location.city,'pl'));
}
// Optional lookup only; addresses remain usable when offline or when a postcode
// cannot be located. Never send customer details/cookies or infer a missing code.
// source: https://api.zippopotam.us/
// source: https://www.geonames.org/export/zip/
export function createPostalPlaceLookup(fetchImpl:typeof fetch=fetch){
  const cache=new Map<string,{until:number;place:PostalPlace}>();
  return async(value:string,signal?:AbortSignal):Promise<PostalPlace|null>=>{
    const code=normalizePickupPostcode(value);if(!code||signal?.aborted)return null;
    const known=cache.get(code);if(known&&known.until>Date.now())return known.place;
    const controller=new AbortController(),abort=()=>controller.abort(),timer=setTimeout(abort,6000);signal?.addEventListener('abort',abort,{once:true});
    try{
      const response=await fetchImpl('https://api.zippopotam.us/PL/'+code,{signal:controller.signal,credentials:'omit',headers:{Accept:'application/json'}});
      if(!response.ok||Number(response.headers.get('content-length')??0)>20000)return null;
      const raw=await response.text();if(raw.length>20000||controller.signal.aborted)return null;
      const place=parsePostalPlace(JSON.parse(raw),code);if(!place)return null;
      if(cache.size>=64)cache.delete(cache.keys().next().value!);cache.set(code,{place,until:Date.now()+86400000});return place;
    }catch{return null;}finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  };
}
export function pickupAddressMapUrl(id:string):string|null {
  const row=PICKUP_LOCATIONS.find(item=>item.id===id);if(!row)return null;
  // The exact published place avoids stale duplicate businesses at one address.
  // source: https://sklep.sewera.pl/miejsca-odbioru
  if(row.mapCid&&/^\d{10,20}$/.test(row.mapCid))return 'https://www.google.com/maps?cid='+row.mapCid;
  return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(`${row.store} ${row.street} ${row.postalCode} ${row.city} Polska`);
}
