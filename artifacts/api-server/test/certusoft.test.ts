import assert from 'node:assert/strict';
import { test } from 'node:test';
import { productState, primary, carts } from './fixtures/certusoft';
import { RETAIL_SOURCES } from '../src/lib/retail-catalog';
import { parseRetailPage } from '../src/lib/retail-pages';
import { quoteCertusoft } from '../src/lib/certusoft-delivery';
import { AnonymousShop } from '../src/lib/retailer-http';
import { createRetailerQuoter, retailerDeliveryCapabilities } from '../src/lib/retailer-delivery';
import type { DeliveredStoreBasket } from '../../../lib/pricing-service/src/delivery';

const source = RETAIL_SOURCES.find(s => s.id === 'hipper-schaffner-lucy-gold')!;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const page = (state: any, dom = '') => `<script>window.__INITIAL_STATE__=${JSON.stringify(state)};(function(){var s;}());</script>${dom}`;
const productPage = () => page(productState, primary);
const basket = (count = 1): DeliveredStoreBasket => ({ store: 'HIPPER', materialsGrosze: 5799 * count, deliveryGrosze: null, deliveryMinimumGrosze: 0, totalGrosze: null, source: 'unknown', lines: [{ product: { id: source.ean, name: source.name, imageUrl: null }, unit: 'szt', packages: [{ offerId: source.id, count, packageSize: 1, lineCostGrosze: 5799 * count, unitPriceGrosze: 5799, store: 'HIPPER', url: source.url }] }] });
function fixtureFetch(count = 1, mutate?: (fixture: any, step: number) => void) {
  let cartReads = 0; const calls: { path: string; method: string }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input)), method = init?.method ?? 'GET'; calls.push({ path: url.pathname, method });
    assert.equal(url.origin, 'https://hipper.pl');
    if (method === 'GET' && url.pathname === new URL(source.url).pathname) return new Response(productPage(), { headers: { 'content-type': 'text/html' } });
    if (method === 'GET' && url.pathname === '/koszyk') {
      const step = ++cartReads, fixture = clone(carts[('count' + count + 'step' + step) as keyof typeof carts]);
      assert.ok(fixture, 'only the two reviewed cart reads are allowed'); mutate?.(fixture, step);
      return new Response(page(fixture.state, fixture.summary), { headers: { 'content-type': 'text/html' } });
    }
    assert.equal(method, 'POST'); assert.equal(url.pathname, '/csAPIServer_Hipper/invokeAction');
    assert.equal((init?.headers as Record<string, string>)['Content-Type'], 'application/json');
    const body = JSON.parse(String(init?.body));
    assert.ok(['cartAdd','csNGOnCFB2BCartHeader'].includes(body.actionIdent));
    assert.ok(!/order|nextStep|anonymousUsrCartSave|isRegulationsAccepted|RName|SName|EMail|PostalCode/.test(String(init?.body)));
    if (body.actionIdent === 'cartAdd') { assert.equal(body.row.csItemsId, 3069808860); assert.equal(body.row.csItemsUnitsId, 3069809346); assert.equal(body.row.quantityUnits, count); }
    else { assert.equal(body.onCFDataFieldIdent, 'csB2BPortalsDeliveryMethodsId'); assert.equal(body.row.csB2BPortalsDeliveryMethodsId, 2667017562); }
    return Response.json({ commands: [] });
  };
  return { fetcher, calls };
}

test('Certusoft primary card confirms exact golden Lucy, gross price and sale of one complete handle', () => {
  const observed = parseRetailPage(productPage(), source, new Date());
  assert.equal(observed.ean, '5907467760698'); assert.equal(observed.priceGrosze, 5799); assert.match(observed.imageUrl!, /^https:\/\/hipper\.pl\/api\/attachment\/get\//);
  assert.ok(!observed.imageUrl!.includes(' '), 'photo URI is encoded for native image loading');
});

test('Certusoft refuses unrelated identity, unit, currency, prices, missing stock and primary-card changes', () => {
  const mutations: ((row: any) => void)[] = [r => r.EAN = 'other', r => r.csItemsId++, r => r.csItemsUnitsId++, r => r.appWindowIdentRoute = 'other', r => r.quantityUnits = 2, r => r.stockUnit = 'opak', r => r.isNegative = 1, r => r.qStockAv = 0, r => r.discount = 5, r => r.cUnitPrice = 1, r => r.cUnitPriceADis = 1,
    r => r.structuredData = r.structuredData.replace('PLN','EUR'), r => r.structuredData = r.structuredData.replace('InStock','OutOfStock'), r => r.structuredData = r.structuredData.replace('5907467760698','5907467760699')];
  for (const mutate of mutations) { const changed = clone(productState); mutate(changed.csAppWindowsUtils.csAppWindows.csB2BItemCard.dataSets.itemCard.rows[0]); assert.notDeepEqual(changed, productState); assert.throws(() => parseRetailPage(page(changed, primary), source, new Date())); }
  for (const [from,to] of [['57,99 zł','1,00 zł'],['66 szt','0 szt'],['Kod produktu: 5907467760698','Kod produktu: 0000000000000']]) { const changed = primary.replace(from,to); assert.notEqual(changed,primary); assert.throws(() => parseRetailPage(page(productState,changed),source,new Date())); }
  assert.throws(() => parseRetailPage(productPage(),{...source,packageSize:2},new Date()),/unit_not_confirmed/);
});

test('Certusoft quotes one courier for the whole actual basket; locker teaser is excluded', async () => {
  for (const count of [1,2]) { const {fetcher,calls} = fixtureFetch(count); const result = await quoteCertusoft(basket(count),fetcher); assert.ok('quote' in result); assert.equal(result.quote.costGrosze,1890); assert.equal(result.quote.carrier,'Kurier InPost'); assert.equal(result.quote.basis,'retailer_basket_national'); assert.equal(result.quote.destinationScope,'PL'); assert.equal(calls.length,5); assert.notEqual(result.quote.costGrosze,1790); assert.ok(!JSON.stringify(result).includes('11111111-1111-4111-8111-111111111111')); }
  assert.ok(retailerDeliveryCapabilities().automaticStores.includes('HIPPER'));
  const result = await createRetailerQuoter(fixtureFetch().fetcher)(basket(),'00-001'); assert.ok('quote' in result);
});

test('Certusoft rejects incomplete or altered cart rows and every unconfirmed payable amount', async () => {
  const mutations: ((fixture: any) => void)[] = [
    f => f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartPositions.rows[0].quantityUnits = 2,
    f => f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartPositions.rows[0].csItemsUnitsId++,
    f => f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartPositions.rows[0].cUnitPriceADis = 1,
    f => f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartPositions.rows.push(clone(f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartPositions.rows[0])),
    f => f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartHeader.rows[0].cGAmount = 1,
    f => f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartHeader.rows[0].deliveryMethodsCUnitPrice = 0,
    f => f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartHeader.rows[0].deliveryMethodsCUnitPrice = null,
    f => f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartHeader.rows[0].paymentsTypesCUnitPrice = 2.9,
    f => f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartHeader.rows[0].isReceptionPoint = 1,
    f => f.summary = f.summary.replace('76,89','57,99'),
  ];
  for (const mutate of mutations) { const before = clone(carts.count1step2), changed = clone(before); mutate(changed); assert.notDeepEqual(changed,before); await assert.rejects(quoteCertusoft(basket(),fixtureFetch(1,(f,step)=>{if(step===2)mutate(f)}).fetcher)); }
  await assert.rejects(quoteCertusoft(basket(67),fixtureFetch().fetcher),/insufficient_stock/);
  const stalePrice = basket(); stalePrice.lines[0].packages[0].unitPriceGrosze = 5798;
  await assert.rejects(quoteCertusoft(stalePrice,fixtureFetch().fetcher),/price_changed/);
  await assert.rejects(quoteCertusoft(basket(),fixtureFetch(1,(f,step)=>{if(step===1)for(const m of f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.deliveryMethods.rows)m.isCollectionInPerson=1}).fetcher),/no_home_delivery/);
  await assert.rejects(quoteCertusoft(basket(),fixtureFetch(1,(f,step)=>{if(step===1)f.state.csAppWindowsUtils.csAppWindows.csB2BCart.dataSets.csB2BCartHeader.rows[0].csPaymentsTypesId=955021230}).fetcher),/no_prepaid_payment/);
});

test('Certusoft transport cannot invoke order, save personal information or call another namespace', async () => {
  let networkCalls = 0; const client = new AnonymousShop('https://hipper.pl',async()=>{networkCalls++;throw Error('must not call')},AbortSignal.timeout(1000));
  const valid = {csAppNameSpacesG:'800DB636-13CF-4B3B-A705-06E7B2A426E9',appWindowIdent:'csB2BCart',dataSetIdent:'csB2BCartHeader',actionIdent:'csNGOnCFB2BCartHeader',onCFDataFieldIdent:'csB2BPortalsDeliveryMethodsId',sessionId:'11111111-1111-4111-8111-111111111111',row:{csDocsHeadersId:1,csB2BPortalsDeliveryMethodsId:2,csPaymentsTypesId:3},path:'/koszyk',addRequestData:{appWindowUniqIdent:'csB2BCart'}};
  for(const actionIdent of ['order','nextStep','anonymousUsrCartSave']) await assert.rejects(client.certusoftAction({...valid,actionIdent}),/invalid_cart_action/);
  await assert.rejects(client.certusoftAction({...valid,row:{...valid.row,RName:'test'}}),/invalid_cart_action/);
  await assert.rejects(client.certusoftAction({...valid,csAppNameSpacesG:'other'}),/invalid_cart_action/);
  await assert.rejects(client.certusoftAction({...valid,onCFDataFieldIdent:'isRegulationsAccepted'}),/invalid_cart_action/); assert.equal(networkCalls,0);
});
