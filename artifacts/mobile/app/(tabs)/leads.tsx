import Colors from "@/constants/colors";
import { Lead, useLeads } from "@/context/LeadContext";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SALES_MESSAGE =
  "Dzień dobry, zajmuję się tworzeniem stron internetowych dla firm, które jeszcze ich nie posiadają. Dobrze wykonana strona pomaga zdobywać więcej klientów, budować zaufanie i pokazać ofertę w profesjonalny sposób. Mogę przygotować dla Państwa nowoczesną stronę z ofertą, galerią, mapą i formularzem kontaktowym. Czy są Państwo zainteresowani krótką wyceną?";

function cleanPhone(raw: string): string {
  let digits = raw.replace(/[\s\-().+]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("48") && digits.length === 11) return "48" + digits.slice(2);
  if (digits.length === 9) return "48" + digits;
  return digits;
}

async function sendMessage(phone: string) {
  const cleaned = cleanPhone(phone);
  const encoded = encodeURIComponent(SALES_MESSAGE);

  const waUrl = `whatsapp://send?phone=${cleaned}&text=${encoded}`;
  const smsUrl = Platform.OS === "ios"
    ? `sms:${phone}&body=${encoded}`
    : `sms:${phone}?body=${encoded}`;

  const canWA = await Linking.canOpenURL(waUrl);
  if (canWA) {
    await Linking.openURL(waUrl);
    return "whatsapp";
  }
  await Linking.openURL(smsUrl);
  return "sms";
}

function LeadCard({
  lead,
  onRemove,
  onContact,
}: {
  lead: Lead;
  onRemove: () => void;
  onContact: () => void;
}) {
  const [sending, setSending] = useState(false);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleRemove = () => {
    Alert.alert("Usuń lead", `Usunąć "${lead.companyName}"?`, [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Usuń",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onRemove();
        },
      },
    ]);
  };

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const method = await sendMessage(lead.phone);
      onContact();
      if (method === "sms") {
        Alert.alert("SMS otwarty", "Wiadomość przygotowana w aplikacji SMS.");
      }
    } catch {
      Alert.alert("Błąd", "Nie udało się otworzyć WhatsApp ani SMS.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.card, lead.contacted && styles.cardContacted]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <View style={[styles.cardIcon, lead.contacted && styles.cardIconContacted]}>
            <Feather
              name={lead.contacted ? "check" : "briefcase"}
              size={16}
              color={lead.contacted ? Colors.whatsapp : Colors.primary}
            />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName} numberOfLines={1}>
                {lead.companyName}
              </Text>
              {lead.contacted && (
                <View style={styles.contactedBadge}>
                  <Feather name="check-circle" size={10} color={Colors.whatsapp} />
                  <Text style={styles.contactedBadgeText}>Wysłano</Text>
                </View>
              )}
            </View>
            <View style={styles.cardMetaRow}>
              <Feather name="phone" size={11} color={Colors.primary} />
              <Text style={styles.cardPhone}>{lead.phone}</Text>
            </View>
            <View style={styles.cardMetaRow}>
              <Feather name="map-pin" size={11} color={Colors.textSecondary} />
              <Text style={styles.cardMeta} numberOfLines={1}>
                {lead.address || lead.city}
              </Text>
            </View>
            <View style={styles.cardMetaRow}>
              <Feather name="tag" size={11} color={Colors.textSecondary} />
              <Text style={styles.cardMeta}>{lead.category}</Text>
            </View>
            <Text style={styles.cardDate}>{formatDate(lead.discoveredAt)}</Text>
          </View>
        </View>
        <Pressable
          onPress={handleRemove}
          hitSlop={12}
          style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.5 }]}
        >
          <Feather name="trash-2" size={16} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <Pressable
        onPress={handleSend}
        disabled={sending}
        style={({ pressed }) => [
          styles.sendBtn,
          lead.contacted && styles.sendBtnContacted,
          (pressed || sending) && { opacity: 0.7 },
        ]}
      >
        <Feather
          name="message-circle"
          size={15}
          color={lead.contacted ? Colors.whatsapp : "#fff"}
        />
        <Text style={[styles.sendBtnText, lead.contacted && styles.sendBtnTextContacted]}>
          {sending
            ? "Otwieranie..."
            : lead.contacted
            ? "Wyślij ponownie"
            : "Wyślij wiadomość"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function LeadsScreen() {
  const { leads, removeLead, clearLeads, markContacted } = useLeads();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "contacted">("all");
  const insets = useSafeAreaInsets();

  const baseFiltered = filter === "new"
    ? leads.filter((l) => !l.contacted)
    : filter === "contacted"
    ? leads.filter((l) => l.contacted)
    : leads;

  const filtered = search.trim()
    ? baseFiltered.filter(
        (l) =>
          l.companyName.toLowerCase().includes(search.toLowerCase()) ||
          l.phone.includes(search) ||
          l.city.toLowerCase().includes(search.toLowerCase()) ||
          l.category.toLowerCase().includes(search.toLowerCase()),
      )
    : baseFiltered;

  const contactedCount = leads.filter((l) => l.contacted).length;

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Wyczyść bazę",
      `Usunąć wszystkie ${leads.length} leadów? Tej operacji nie można cofnąć.`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Wyczyść",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning,
            );
            clearLeads();
          },
        },
      ],
    );
  }, [leads.length, clearLeads]);

  const topPad = Platform.OS === "web" ? 67 : insets.top > 0 ? insets.top : 44;
  const bottomPad = Platform.OS === "web" ? 34 : 90;

  const renderLead = useCallback(
    ({ item }: { item: Lead }) => (
      <LeadCard
        lead={item}
        onRemove={() => removeLead(item.id)}
        onContact={() => markContacted(item.id)}
      />
    ),
    [removeLead, markContacted],
  );

  const keyExtractor = useCallback((item: Lead) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={styles.screenTitle}>Baza Leadów</Text>
          <Text style={styles.screenSub}>
            {leads.length} firm · {contactedCount} skontaktowanych
          </Text>
        </View>
        {leads.length > 0 && (
          <Pressable
            onPress={handleClearAll}
            style={({ pressed }) => [
              styles.clearBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Feather name="trash-2" size={16} color={Colors.danger} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        {(["all", "new", "contacted"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === "all" ? "Wszystkie" : f === "new" ? "Nowe" : "Skontaktowane"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Szukaj firm, telefonów, miast..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} hitSlop={8}>
            <Feather name="x" size={16} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderLead}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPad },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {search ? "Brak wyników" : "Baza jest pusta"}
            </Text>
            <Text style={styles.emptyText}>
              {search
                ? "Zmień kryteria wyszukiwania"
                : "Uruchom automatyzację na ekranie głównym, aby zbierać leady"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 12,
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
  },
  clearBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger + "44",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.darkCard,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + "22",
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.darkCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    backgroundColor: Colors.darkCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    gap: 10,
  },
  cardContacted: {
    borderColor: Colors.whatsapp + "33",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + "22",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardIconContacted: {
    backgroundColor: Colors.whatsapp + "22",
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    flexShrink: 1,
  },
  contactedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.whatsapp + "22",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  contactedBadgeText: {
    fontSize: 10,
    color: Colors.whatsapp,
    fontFamily: "Inter_500Medium",
  },
  cardPhone: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  cardDate: {
    fontSize: 10,
    color: Colors.textSecondary + "88",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  removeBtn: {
    padding: 8,
    marginLeft: 4,
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: Colors.whatsapp,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  sendBtnContacted: {
    backgroundColor: Colors.whatsapp + "18",
    borderWidth: 1,
    borderColor: Colors.whatsapp + "55",
  },
  sendBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  sendBtnTextContacted: {
    color: Colors.whatsapp,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
