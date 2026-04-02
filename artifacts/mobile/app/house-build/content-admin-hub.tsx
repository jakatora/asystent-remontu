import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Txt } from '@/components/ui/Txt';
import { Colors } from '@/constants/colors';

const HB_ACCENT = '#2563EB';
const HB_ACCENT_BG = '#EFF6FF';

interface AdminMenuItem {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

const MENU_ITEMS: readonly AdminMenuItem[] = [
  { title: 'Panel glowny', subtitle: 'Statystyki i podsumowanie tresci', icon: 'bar-chart-2', route: 'content-dashboard' },
  { title: 'Etapy budowy', subtitle: 'Opisy, checklisty, kryteria', icon: 'layers', route: 'content-stages' },
  { title: 'Wytyczne formalne', subtitle: 'Prawo budowlane, procedury', icon: 'file-text', route: 'content-formal' },
  { title: 'Przylacza i media', subtitle: 'Wytyczne mediow', icon: 'zap', route: 'content-utilities' },
  { title: 'Szablony decyzji', subtitle: 'Decyzje inwestora', icon: 'check-square', route: 'content-decisions' },
  { title: 'Szablony pytan', subtitle: 'Pytania do specjalistow', icon: 'help-circle', route: 'content-questions' },
  { title: 'Ostrzezenia', subtitle: 'Notatki bezpieczenstwa', icon: 'alert-triangle', route: 'content-warnings' },
  { title: 'Rejestr zrodel', subtitle: 'Zrodla i metadane', icon: 'book-open', route: 'content-sources' },
  { title: 'Import / Eksport', subtitle: 'Dane tresci JSON', icon: 'download', route: 'content-import-export' },
  { title: 'Wersjonowanie', subtitle: 'Snapshoty tresci', icon: 'git-branch', route: 'content-snapshots' },
  { title: 'Kontrola jakosci', subtitle: 'Audyt i zdrowie tresci', icon: 'shield', route: 'content-health' },
  { title: 'Zastrzezenia', subtitle: 'Notatki zaufania', icon: 'info', route: 'content-disclaimers' },
];

export default function ContentAdminHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
      <View style={{ backgroundColor: HB_ACCENT_BG, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Feather name="settings" size={20} color={HB_ACCENT} />
          <Txt w="bold" style={{ fontSize: 16, color: HB_ACCENT }}>Administracja tresci</Txt>
        </View>
        <Txt style={{ fontSize: 12, color: '#1E40AF' }}>
          Zarzadzaj tresciami modulu Budowa domu. Edytuj opisy etapow, wytyczne, szablony, ostrzezenia i zrodla bez przebudowy aplikacji.
        </Txt>
      </View>

      <View style={{ gap: 8 }}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={{
              backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14,
              borderWidth: 1, borderColor: '#E2E8F0',
              flexDirection: 'row', alignItems: 'center', gap: 12,
            }}
            onPress={() => router.push({ pathname: `/house-build/${item.route}` as any })}
          >
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: HB_ACCENT_BG, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={item.icon as any} size={18} color={HB_ACCENT} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="semibold" style={{ fontSize: 13, color: Colors.text }}>{item.title}</Txt>
              <Txt style={{ fontSize: 11, color: Colors.textMuted }}>{item.subtitle}</Txt>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
