import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveThumbnail} from '@/components/renovation/thumbnail-resolver';
import {finishingMaterials} from '@/features/calculator/wallFinishing';
import {substratePrimerMaterial} from '@/features/calculator/substratePrimer';
import {getProductPhoto} from '@/data/products/photos';
import {SHARED_SHOP_PRICES,SHARED_THUMBNAILS} from '@/data/prices/shared-shop-prices';

test('all five actual wall-repair material cards find their reviewed product photo without legacy shop links',()=>{
 const materials=[...finishingMaterials('wall-repair'),substratePrimerMaterial('wall-repair')];
 assert.equal(materials.length,5);
 for(const material of materials){assert(material.ean);assert.equal(material.shopPrices,undefined);const expected=getProductPhoto({ean:material.ean});assert(expected?.startsWith('https://'),material.name);assert.equal(resolveThumbnail(material),expected,material.name);}
 assert.equal(resolveThumbnail(materials[1]),'https://sklep.sewera.pl/photo/355803/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin.webp');
});

test('an exact reviewed product wins over a generic illustration and a generic local ID cannot select a different bag',()=>{
 const five=resolveThumbnail({id:'filler',ean:'5903973104414',thumbnailUrl:'https://example.org/generic.jpg'}),twenty=resolveThumbnail({id:'filler',ean:'5903973104421'});
 assert(five?.startsWith('https://'));assert(twenty?.startsWith('https://'));assert.notEqual(five,'https://example.org/generic.jpg');assert.notEqual(five,twenty);
 assert.equal(resolveThumbnail({id:'filler',shopPrices:[]}),undefined);
});

test('legacy tool illustrations still work while a known product source can use its reviewed image',()=>{
 assert.equal(resolveThumbnail({shopPrices:SHARED_SHOP_PRICES.brush50mm}),SHARED_THUMBNAILS.brush50mm);
 assert.equal(resolveThumbnail({sourceUrl:'https://sklep.sewera.pl/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin-p22044'}),'https://sklep.sewera.pl/photo/355803/tasma-spoinowa-z-wlokna-szklanego-48mm-x-20m-blue-dolphin.webp');
});
