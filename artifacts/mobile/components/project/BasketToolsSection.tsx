import React from 'react';
import { Pressable, View } from 'react-native';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import type { BasketTool, BasketToolChoice } from '@/features/pricing/basketTools';
import { ProductImage } from './ProductImage';

interface Props {
  tools: readonly BasketTool[];
  choices: Readonly<Partial<Record<string, BasketToolChoice>>>;
  saving: boolean;
  onChoice: (key: string, choice: BasketToolChoice | undefined) => void;
}

export function BasketToolsSection({ tools, choices, saving, onChoice }: Props) {
  const { language } = useLanguage();
  const pl = language === 'pl';
  if (!tools.length) return null;
  return <View style={{ padding: 14, borderRadius: 14, backgroundColor: Colors.surface, gap: 12 }}>
    <Txt accessibilityRole="header" w="bold">{pl ? 'Narzędzia w koszyku' : 'Tools in the basket'}</Txt>
    <Txt style={{ color: Colors.textSecondary, lineHeight: 20 }}>
      {pl ? 'Ustal, co masz, co kupujesz i co wypożyczysz. Wycena sklepów obejmuje materiały i narzędzia wybrane do zakupu z ustalonym modelem. Koszt wypożyczenia rozliczysz osobno.' : 'Choose which tools you own, buy or rent. The store quote covers materials and tools selected for purchase with an identified model. Rental costs are separate.'}
    </Txt>
    {tools.map(tool => {
      const choice = choices[tool.key];
      const options: { value: BasketToolChoice | undefined; label: string }[] = [
        { value: 'owned', label: pl ? 'Mam' : 'Own' },
        { value: 'buy', label: pl ? 'Kupuję' : 'Buy' },
        { value: 'rent', label: pl ? 'Wypożyczam' : 'Rent' },
      ];
      if (!tool.required) options.push({ value: undefined, label: pl ? 'Pomiń' : 'Skip' });
      return <View key={tool.key} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {!!tool.product?.imageUrl && <ProductImage name={tool.name} uri={tool.product.imageUrl} size={48} />}
          <View style={{ flex: 1, gap: 4 }}>
            <Txt w="semibold">{tool.name}</Txt>
            <Txt style={{ color: Colors.textSecondary, fontSize: 13 }}>{tool.projectNames.join(' · ')}</Txt>
          </View>
        </View>
        <View accessibilityRole="radiogroup" aria-label={tool.name} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {options.map(option => {
            const checked = choice === option.value;
            return <Pressable key={option.value ?? 'skip'} accessibilityRole="radio" accessibilityLabel={option.label}
              accessibilityState={{ checked, disabled: saving }} aria-checked={checked} disabled={saving}
              onPress={() => { if (!checked) onChoice(tool.key, option.value); }}
              style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: checked ? Colors.primary : Colors.border, backgroundColor: checked ? Colors.primaryBg : Colors.surface }}>
              <Txt w={checked ? 'semibold' : 'regular'}>{option.label}</Txt>
            </Pressable>;
          })}
        </View>
        {choice === 'buy' && !tool.product?.identity.ean && <Txt style={{ color: Colors.textSecondary }}>
          {pl ? 'Zakup zapisany. Brakuje ustalonego modelu do porównania cen.' : 'Purchase saved. An exact model is needed to compare prices.'}
        </Txt>}
        {choice === 'rent' && !tool.rentable && <Txt style={{ color: Colors.textSecondary }}>
          {pl ? 'Sprawdź dostępność w wypożyczalni.' : 'Check availability with a rental provider.'}
        </Txt>}
      </View>;
    })}
  </View>;
}
