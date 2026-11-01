import React, { useId } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { RadioCard } from '@/components/ui/RadioCard';
import { useLanguage } from '@/context/LanguageContext';
import { formatGrosze } from '@/features/pricing';
import { basketOrderCount, type BasketChoice, type ConfirmedBasketOptions } from '@/features/pricing/basketOptions';
import {formatPackageSize,formatPackageUnit} from '@/features/pricing/packageDisplay';
import {displayProductName} from '@/features/pricing/productDisplay';
export function BasketOptionsSection({ options, choice, onChange, disabled }: { options: ConfirmedBasketOptions; choice: BasketChoice; onChange: (choice: BasketChoice) => void; disabled: boolean }) {
  const { language } = useLanguage(), pl = language === 'pl', tr = (a: string, b: string) => pl ? a : b;
  const group=useId();
  const counts = (stores: number, orders: number) => tr(`Sklepy: ${stores} · zamówienia: ${orders}`, `Stores: ${stores} · orders: ${orders}`);
  if (options.alreadySingleStore&&!options.extraPackages) return <View style={{ padding: 14, gap: 6, borderRadius: 14, backgroundColor: Colors.successBg }}>
    <Txt w="semibold">{tr('Najtańszy potwierdzony wariant jest już w jednym sklepie', 'The lowest confirmed option already uses one store')}</Txt>
    <Txt>{options.lowest.stores[0].store} · {counts(1, basketOrderCount(options.lowest))}</Txt>
  </View>;
  const variants = [{ value: 'lowest' as const, basket: options.lowest, title: options.extraPackages?tr('Standardowy zestaw','Standard basket'):tr('Najniższy potwierdzony koszt', 'Lowest confirmed total') },
    ...(options.fewerStores ? [{value:'fewer_stores' as const,basket:options.fewerStores.basket,title:tr('Mniej sklepów','Fewer stores')}] : []),
    ...(options.singleStore&&!options.alreadySingleStore ? [{ value: 'single_store' as const, basket: options.singleStore, title: tr('Wszystko w jednym sklepie', 'Everything from one store') }] : []),
    ...(options.extraPackages?[{value:'extra_packages' as const,basket:options.extraPackages.basket,title:tr('Niższy koszt z dodatkowym materiałem','Lower total with extra material')}]:[])];
  return <View style={{ gap: 12 }}>
    <Txt w="semibold" style={{ fontSize: 16 }}>{tr('Wybierz sposób zakupów', 'Choose how to buy')}</Txt>
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>
    {variants.map(({ value, basket, title }) => <RadioCard key={value} label={title} value={value} group={group} checked={choice===value} disabled={disabled} onSelect={()=>onChange(value)}
      style={{ flexGrow:1,flexBasis:320,minWidth:0,minHeight: 64, padding: 16, gap: 8, borderWidth: 1, borderColor: choice === value ? Colors.primary : Colors.border, backgroundColor: choice === value ? Colors.primaryBg : Colors.surface, borderRadius: 14 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Feather name={choice === value ? 'check-circle' : 'circle'} size={22} color={choice === value ? Colors.primary : Colors.textSecondary} /><Txt w="semibold" style={{ flex: 1 }}>{title}</Txt></View>
      <Txt w="bold" style={{ fontSize: 23, color: Colors.primaryDark }}>{formatGrosze(basket.totalGrosze!)}</Txt>
      <Txt style={{ lineHeight: 21, color: Colors.textSecondary }}>{basket.stores.map(store => store.store).join(' + ')}</Txt>
      <Txt style={{ fontSize: 13, lineHeight: 20 }}>{counts(basket.stores.length, basketOrderCount(basket))}</Txt>
      {value === 'single_store' && <Txt w="semibold" style={{ lineHeight: 21 }}>{options.extraGrosze === 0 ? tr('Ta sama cena z dostawą', 'Same total including delivery') : tr('Dopłata za jeden sklep: ', 'Extra for one store: ') + formatGrosze(options.extraGrosze!)}</Txt>}
      {value==='fewer_stores'&&options.fewerStores&&<>
        <Txt w="semibold" style={{lineHeight:21}}>{options.fewerStores.extraGrosze===0?tr('Ta sama cena z dostawą','Same total including delivery'):tr('Dopłata za mniej sklepów: ','Extra for fewer stores: ')+formatGrosze(options.fewerStores.extraGrosze)}</Txt>
        <Txt style={{fontSize:13,lineHeight:20,color:Colors.textSecondary}}>{tr(`Sklepy: ${options.lowest.stores.length} → ${basket.stores.length}. Najtańszy potwierdzony wariant z mniejszą liczbą sklepów spośród sprawdzonych zestawów wielosklepowych.`,`Stores: ${options.lowest.stores.length} → ${basket.stores.length}. Lowest confirmed option using fewer stores among the checked multi-store baskets.`)}</Txt>
      </>}
      {value==='extra_packages'&&options.extraPackages&&<>
        <Txt w="semibold" style={{lineHeight:21,color:Colors.primaryDark}}>{tr('Całość tańsza o: ','Full total lower by: ')}{formatGrosze(options.extraPackages.savingGrosze)}</Txt>
        {options.extraPackages.additions.map(item=><View key={item.store+item.product.id} style={{gap:4}}>
          <Txt style={{lineHeight:21}}>{tr('Dodatkowo kupisz: ','Extra to buy: ')}{item.extraPackages} {tr('op.','packs')} × {formatPackageSize(item.packageSize,language)} {formatPackageUnit(item.unit)} — {displayProductName(item.product)}.</Txt>
          <Txt style={{fontSize:13,lineHeight:20}}>{tr(`Liczba opakowań: ${item.baselinePackages} → ${item.proposedPackages}.`,`Pack count: ${item.baselinePackages} → ${item.proposedPackages}.`)}</Txt>
        </View>)}
        <Txt style={{fontSize:13,lineHeight:20,color:Colors.textSecondary}}>{tr('Ten wariant zawiera więcej materiału niż standardowy zestaw. Wybierz go, jeśli chcesz kupić tę nadwyżkę.','This option contains more material than the standard basket. Select it if you want to buy the surplus.')}</Txt>
      </>}
    </RadioCard>)}
    </View>
    {!options.singleStore && <Txt style={{ color: Colors.textSecondary, lineHeight: 21 }}>{tr('Nie potwierdzono pełnego koszyka z dostawą w jednym sklepie. Dostępne warianty mogą obejmować kilka sklepów.', 'A complete one-store basket with delivery has not been confirmed. Available options may use several stores.')}</Txt>}
    <Txt style={{ fontSize: 13, lineHeight: 20, color: Colors.textSecondary }}>{tr('Poniższe produkty, kwoty i plan zakupów dotyczą wybranego wariantu. Jeden sklep może wymagać kilku osobnych zamówień.', 'The products, totals and shopping plan below follow your selection. One store may require several separate orders.')}</Txt>
  </View>;
}
