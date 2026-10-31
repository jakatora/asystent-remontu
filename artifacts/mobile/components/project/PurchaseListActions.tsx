import React, { useEffect, useState } from 'react';
import { Platform, Share, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/LanguageContext';
import { purchaseListText, type PurchaseListInput } from '@/features/pricing/purchaseListText';

export function PurchaseListActions({ input }: { input: PurchaseListInput }) {
  const { language } = useLanguage(), pl = language === 'pl';
  const [text, setText] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setText(null); setMessage(''); }, [input.basket, input.mode, input.postalCode, input.partial, input.limited, language]);
  const copy = async () => {
    const value = purchaseListText(input, language);
    if (!value) { setMessage(pl ? 'Nie można przygotować tej listy. Odśwież porównanie.' : 'This list cannot be prepared. Refresh the comparison.'); return; }
    setText(value); setMessage(''); setBusy(true);
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(value);
        setMessage(pl ? 'Skopiowano plan zakupów.' : 'Shopping plan copied.');
      } else {
        await Share.share({ message: value, title: pl ? 'Plan zakupów' : 'Shopping plan' });
      }
    } catch {
      setMessage(pl ? 'Możesz zaznaczyć i skopiować tekst poniżej.' : 'You can select and copy the text below.');
    } finally { setBusy(false); }
  };
  return <View style={{ gap: 8 }}>
    <Button variant="outline" label={Platform.OS === 'web' ? (pl ? 'Kopiuj plan zakupów' : 'Copy shopping plan') : (pl ? 'Udostępnij plan zakupów' : 'Share shopping plan')} onPress={() => void copy()} loading={busy} />
    <Txt style={{ fontSize: 13, lineHeight: 19, color: Colors.textSecondary }}>{pl ? 'Produkty, opakowania, linki i podział na zamówienia. Brakujące koszty dostawy są oznaczone.' : 'Products, packs, links and separate orders. Missing delivery costs are marked.'}</Txt>
    {message ? <Txt accessibilityLiveRegion="polite" style={{ fontSize: 13, lineHeight: 19 }}>{message}</Txt> : null}
    {text && <>
      <TextInput accessibilityLabel={pl ? 'Plan zakupów do skopiowania' : 'Shopping plan to copy'} value={text} multiline readOnly selectTextOnFocus style={{ minHeight: 160, maxHeight: 260, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, color: Colors.text, backgroundColor: Colors.surface, fontSize: 13, lineHeight: 20, textAlignVertical: 'top' }} />
      <Button variant="ghost" size="sm" label={pl ? 'Ukryj kopię planu' : 'Hide plan copy'} onPress={() => { setText(null); setMessage(''); }} />
    </>}
  </View>;
}
