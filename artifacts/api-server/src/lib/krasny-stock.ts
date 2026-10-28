import type {RetailSource} from './retail-pages';
import {cleanHtml,htmlElements,htmlText} from './retail-microdata';

// source: https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383
// The visible stock block, unlike InStock JSON-LD, limits the available bags.
// The cart permits larger quantities only as an explicitly backordered order.
export function readKrasnyStock(html:string,source:RetailSource):number{
  if(source.id!=='krasny-goldband-25kg'||source.store!=='Krasny'||source.ean!=='5902367206383'
    ||source.packageSize!==25||source.unit!=='kg'||source.brand!=='Knauf'
    ||source.url!=='https://krasny.pl/gips-goldband-25-gips-tynkarski-goldband-25kg-id-5902367206383')throw Error('krasny_source_not_reviewed');
  const blocks=htmlElements(cleanHtml(html),(a,tag)=>tag==='div'&&a.type==='productStocks'&&a.class?.split(/\s+/).includes('one-product-stocks-info')===true);
  if(blocks.length!==1)throw Error('retailer_stock_not_confirmed');
  const warehouses=htmlElements(blocks[0],a=>a.class?.split(/\s+/).includes('one-product-stocks-info__warehouse')===true);
  const quantities=htmlElements(blocks[0],(a,tag)=>tag==='div'&&a.class==='mx-1');
  if(warehouses.length!==1||htmlText(warehouses[0])!=='Magazyn Centralny'||quantities.length!==1)throw Error('retailer_stock_not_confirmed');
  const match=htmlText(quantities[0]).match(/^(\d{1,9}) szt\.$/);
  if(!match)throw Error('retailer_stock_not_confirmed');
  const stock=Number(match[1]);
  if(stock===0)throw Error('retailer_out_of_stock');
  return stock;
}
