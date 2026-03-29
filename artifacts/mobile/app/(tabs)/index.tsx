import Colors from "@/constants/colors";
import { useLeads } from "@/context/LeadContext";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const {
    leads,
    isRunning,
    isSearching,
    totalScanned,
    lastSearchAt,
    startAutomation,
    stopAutomation,
    runOnce,
    searchLog,
    settings,
  } = useLeads();
  const insets = useSafeAreaInsets();

  const handleToggle = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (isRunning) {
      stopAutomation();
    } else {
      startAutomation();
    }
  }, [isRunning, startAutomation, stopAutomation]);

  const handleRunOnce = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    runOnce();
  }, [runOnce]);

  const formatDate = (iso: string | null) => {
    if (!iso) return "Nigdy";
    return new Date(iso).toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top > 0 ? insets.top : 44;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 34 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Lead Hunter PL</Text>
            <Text style={styles.headerSub}>Automatyczne wyszukiwanie firm</Text>
          </View>
          {isSearching && (
            <ActivityIndicator color={Colors.primary} size="small" />
          )}
        </View>

        <Pressable
          onPress={handleToggle}
          style={({ pressed }) => [
            styles.mainBtn,
            isRunning ? styles.mainBtnStop : styles.mainBtnStart,
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Feather
            name={isRunning ? "square" : "play"}
            size={28}
            color={isRunning ? Colors.danger : Colors.dark}
          />
          <Text
            style={[
              styles.mainBtnText,
              { color: isRunning ? Colors.danger : Colors.dark },
            ]}
          >
            {isRunning ? "ZATRZYMAJ AUTOMATYZACJĘ" : "URUCHOM AUTOMATYZACJĘ"}
          </Text>
        </Pressable>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isRunning
                  ? Colors.success
                  : isSearching
                  ? Colors.warning
                  : Colors.textSecondary,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {isRunning
              ? `Aktywna • co ${settings.intervalMinutes} min`
              : isSearching
              ? "Wyszukiwanie..."
              : "Nieaktywna"}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="Leady"
            value={leads.length}
            icon="users"
            color={Colors.primary}
          />
          <StatCard
            label="Przeszukano"
            value={totalScanned}
            icon="search"
            color={Colors.warning}
          />
          <StatCard
            label="Kategorie"
            value={settings.categories.length}
            icon="tag"
            color="#818CF8"
          />
        </View>

        <View style={styles.infoCard}>
          <Feather name="clock" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoText}>
            Ostatnie wyszukiwanie: {formatDate(lastSearchAt)}
          </Text>
        </View>

        <Pressable
          onPress={handleRunOnce}
          disabled={isSearching}
          style={({ pressed }) => [
            styles.onceBtn,
            isSearching && { opacity: 0.4 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="refresh-cw" size={16} color={Colors.primary} />
          <Text style={styles.onceBtnText}>Wyszukaj teraz (jednorazowo)</Text>
        </Pressable>

        <View style={styles.logSection}>
          <Text style={styles.logTitle}>Dziennik aktywności</Text>
          {searchLog.length === 0 ? (
            <View style={styles.logEmpty}>
              <Feather name="terminal" size={20} color={Colors.textSecondary} />
              <Text style={styles.logEmptyText}>
                Uruchom automatyzację, aby zobaczyć logi
              </Text>
            </View>
          ) : (
            searchLog.slice(0, 15).map((log, idx) => (
              <View key={idx} style={styles.logRow}>
                <Text style={styles.logText}>{log}</Text>
              </View>
            ))
          )}
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
  content: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  mainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
  },
  mainBtnStart: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  mainBtnStop: {
    backgroundColor: "transparent",
    borderColor: Colors.danger,
  },
  mainBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.darkCard,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: Colors.darkCard,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  onceBtn: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  onceBtnText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  logSection: {
    backgroundColor: Colors.darkCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    gap: 8,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  logEmpty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  logEmptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  logRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.darkBorder,
    paddingTop: 6,
  },
  logText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
});
