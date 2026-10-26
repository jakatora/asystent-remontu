import {createHash} from 'node:crypto';
import {parseRetailPage,type RetailObservation,type RetailSource} from './retail-pages';
import type {BrowserProductSnapshot} from './castorama-browser-observation';

export const BRICO_POZNAN='Bricomarché Poznań (Al. Solidarności)';
export function isBricomarcheBrowserSource(source:RetailSource):boolean{
 return source.id==='bricomarche-poznan-budmat-ud27-3m'&&source.ean==='5907738940163'&&source.store===BRICO_POZNAN&&source.browserReviewAllowed===true&&source.pickupOnly===true&&source.packageSize===3&&source.unit==='mb'&&source.url==='https://www.bricomarche.pl/ksztaltownik-sufitowy-ud30-300-cm-srebrny';
}

/** Local operator read: the branch name, native product and visible full-piece
 * price are all required. A different browser branch needs a separate source. */
export function observeBricomarcheBrowser(snapshot:BrowserProductSnapshot,source:RetailSource,now=new Date()):RetailObservation{
 const captured=Date.parse(snapshot.capturedAt),age=now.getTime()-captured;
 if(!Number.isFinite(captured)||age< -300000||age>=86400000)throw Error('browser_observation_not_current');
 if(!isBricomarcheBrowserSource(source)||snapshot.version!==1||snapshot.url!==source.url||snapshot.ean!==source.ean||snapshot.heading!==source.name||!snapshot.axState.includes('heading '+source.name+', Value: 1'))throw Error('browser_product_identity_not_confirmed');
 if(!snapshot.axState.includes('Mój sklep: '+BRICO_POZNAN+',')||!new RegExp('text W sklepie[\\s\\S]{0,150}text Dostępny[\\s\\S]{0,150}text Bricomarché Poznań \\(Al\\. Solidarności\\)').test(snapshot.axState))throw Error('browser_branch_not_confirmed');
 const parts=snapshot.axState.slice(snapshot.axState.indexOf('heading '+source.name+', Value: 1')).split(/\n\s*\d+ container description/)[0],price=parts.match(/\n\s*\d+ container (\d+) złot(?:ych|e|y) i (\d{1,2}) grosz(?:y|e)? \/ szt\./);
 if(!price||Number(price[2])>99||!Number.isSafeInteger(Number(price[1])*100+Number(price[2])))throw Error('browser_purchase_unit_not_confirmed');
 for(const fact of ['text EAN '+source.ean,'text Długość 3000 mm','text Grubość 0,5 mm','text Marka BUDMAT'])if(!snapshot.axState.includes(fact))throw Error('browser_package_not_confirmed');
 if(!/\n\s*\d+ button (?!\(disabled\))[^\n]*Dodaj do koszyka/.test(parts)||!snapshot.axState.includes('Odbiór w sklepie lub Bricomacie za 0 zł'))throw Error('browser_purchase_not_confirmed');
 const products=snapshot.schemas.flatMap(s=>{try{const p=JSON.parse(s);return p?.['@type']==='Product'?[p]:[]}catch{return[];}});
 if(products.length!==1||products[0].name!==snapshot.heading||products[0].gtin13!==source.ean||products[0].productID!=='000000001000032973'||products[0].offers?.seller?.name!=='https://www.bricomarche.pl')throw Error('browser_product_identity_not_confirmed');
 const observation=parseRetailPage('<script type="application/ld+json">'+JSON.stringify(products[0])+'</script>',source,new Date(captured));
 if(observation.priceGrosze!==Number(price[1])*100+Number(price[2]))throw Error('browser_gross_price_mismatch');
 return{...observation,verification:{method:'browser',checkedAt:new Date(captured).toISOString(),expiresAt:new Date(captured+86400000).toISOString()},evidenceSha256:createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')};
}
