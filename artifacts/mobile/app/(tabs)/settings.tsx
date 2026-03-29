import Colors from "@/constants/colors";
import { useLeads } from "@/context/LeadContext";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRESET_CATEGORIES = [
  "restauracja",
  "fryzjer",
  "sklep",
  "mechanik",
  "dentysta",
  "prawnik",
  "księgowość",
  "hotel",
  "kawiarnia",
  "gabinet lekarski",
  "warsztat",
  "kwiaciarnia",
  "piekarnia",
  "hydraulik",
  "elektryk",
  "malarz",
  "stolarz",
  "fotograf",
  "kosmetyczka",
  "spa",
];

const PRESET_REGIONS = [
  "Warszawa",
  "Kraków",
  "Wrocław",
  "Gdańsk",
  "Poznań",
  "Łódź",
  "Katowice",
  "Lublin",
  "Bydgoszcz",
  "Białystok",
  "Rzeszów",
  "Toruń",
  "Olsztyn",
  "Szczecin",
  "Kielce",
];

const INTERVALS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 h", value: 60 },
  { label: "2 h", value: 120 },
  { label: "6 h", value: 360 },
];

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function TagToggle({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onToggle();
      }}
      style={[styles.tag, selected && styles.tagSelected]}
    >
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useLeads();
  const insets = useSafeAreaInsets();
  const [newCategory, setNewCategory] = useState("");
  const [newRegion, setNewRegion] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top > 0 ? insets.top : 44;

  const toggleCategory = useCallback(
    (cat: string) => {
      const cats = settings.categories.includes(cat)
        ? settings.categories.filter((c) => c !== cat)
        : [...settings.categories, cat];
      updateSettings({ categories: cats });
    },
    [settings.categories, updateSettings],
  );

  const toggleRegion = useCallback(
    (reg: string) => {
      const regs = settings.regions.includes(reg)
        ? settings.regions.filter((r) => r !== reg)
        : [...settings.regions, reg];
      updateSettings({ regions: regs });
    },
    [settings.regions, updateSettings],
  );

  const addCustomCategory = useCallback(() => {
    const val = newCategory.trim().toLowerCase();
    if (!val) return;
    if (settings.categories.includes(val)) {
      Alert.alert("Ta kategoria już istnieje");
      return;
    }
    updateSettings({ categories: [...settings.categories, val] });
    setNewCategory("");
  }, [newCategory, settings.categories, updateSettings]);

  const addCustomRegion = useCallback(() => {
    const val = newRegion.trim();
    if (!val) return;
    if (settings.regions.includes(val)) {
      Alert.alert("To miasto już jest na liście");
      return;
    }
    updateSettings({ regions: [...settings.regions, val] });
    setNewRegion("");
  }, [newRegion, settings.regions, updateSettings]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPad + 16,
            paddingBottom: Platform.OS === "web" ? 34 : 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Ustawienia</Text>
        <Text style={styles.screenSub}>Skonfiguruj automatyczne wyszukiwanie</Text>

        <View style={styles.card}>
          <SectionHeader title="Interwał wyszukiwania" />
          <View style={styles.intervalRow}>
            {INTERVALS.map((intv) => (
              <Pressable
                key={intv.value}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateSettings({ intervalMinutes: intv.value });
                }}
                style={[
                  styles.intervalBtn,
                  settings.intervalMinutes === intv.value &&
                    styles.intervalBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.intervalText,
                    settings.intervalMinutes === intv.value &&
                      styles.intervalTextSelected,
                  ]}
                >
                  {intv.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title="Kategorie firm" />
          <Text style={styles.cardSub}>
            Wybrano: {settings.categories.length}
          </Text>
          <View style={styles.tagsWrap}>
            {PRESET_CATEGORIES.map((cat) => (
              <TagToggle
                key={cat}
                label={cat}
                selected={settings.categories.includes(cat)}
                onToggle={() => toggleCategory(cat)}
              />
            ))}
            {settings.categories
              .filter((c) => !PRESET_CATEGORIES.includes(c))
              .map((cat) => (
                <TagToggle
                  key={cat}
                  label={cat}
                  selected={true}
                  onToggle={() => toggleCategory(cat)}
                />
              ))}
          </View>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Dodaj kategorię..."
              placeholderTextColor={Colors.textSecondary}
              value={newCategory}
              onChangeText={setNewCategory}
              returnKeyType="done"
              onSubmitEditing={addCustomCategory}
            />
            <Pressable
              onPress={addCustomCategory}
              style={({ pressed }) => [
                styles.addBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="plus" size={18} color={Colors.dark} />
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <SectionHeader title="Miasta / Regiony" />
          <Text style={styles.cardSub}>Wybrano: {settings.regions.length}</Text>
          <View style={styles.tagsWrap}>
            {PRESET_REGIONS.map((reg) => (
              <TagToggle
                key={reg}
                label={reg}
                selected={settings.regions.includes(reg)}
                onToggle={() => toggleRegion(reg)}
              />
            ))}
            {settings.regions
              .filter((r) => !PRESET_REGIONS.includes(r))
              .map((reg) => (
                <TagToggle
                  key={reg}
                  label={reg}
                  selected={true}
                  onToggle={() => toggleRegion(reg)}
                />
              ))}
          </View>
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Dodaj miasto..."
              placeholderTextColor={Colors.textSecondary}
              value={newRegion}
              onChangeText={setNewRegion}
              returnKeyType="done"
              onSubmitEditing={addCustomRegion}
            />
            <Pressable
              onPress={addCustomRegion}
              style={({ pressed }) => [
                styles.addBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name="plus" size={18} color={Colors.dark} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, styles.infoCard]}>
          <Feather name="info" size={16} color={Colors.warning} />
          <Text style={styles.infoText}>
            Aplikacja automatycznie przeszukuje polskie katalogi firm i
            zapisuje tylko firmy bez wykrytej strony internetowej. Każda firma
            jest dodawana do bazy tylko raz.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  screenSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    gap: 0,
  },
  cardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
    marginTop: -8,
  },
  intervalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  intervalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  intervalBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  intervalText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  intervalTextSelected: {
    color: Colors.dark,
    fontFamily: "Inter_600SemiBold",
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  tagSelected: {
    backgroundColor: Colors.primary + "22",
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  tagTextSelected: {
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  addRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  addInput: {
    flex: 1,
    backgroundColor: Colors.dark,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  addBtn: {
    width: 38,
    height: 38,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: Colors.warning + "11",
    borderColor: Colors.warning + "33",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
