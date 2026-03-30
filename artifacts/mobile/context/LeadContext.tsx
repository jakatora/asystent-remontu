import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface Lead {
  id: string;
  companyName: string;
  phone: string;
  category: string;
  city: string;
  address: string;
  discoveredAt: string;
  contacted?: boolean;
  contactedAt?: string;
}

export interface SearchSettings {
  categories: string[];
  regions: string[];
  intervalMinutes: number;
}

interface LeadContextType {
  leads: Lead[];
  isRunning: boolean;
  isSearching: boolean;
  totalScanned: number;
  lastSearchAt: string | null;
  settings: SearchSettings;
  startAutomation: () => void;
  stopAutomation: () => void;
  clearLeads: () => void;
  removeLead: (id: string) => void;
  markContacted: (id: string) => void;
  updateSettings: (s: Partial<SearchSettings>) => void;
  runOnce: () => Promise<void>;
  searchLog: string[];
}

const defaultSettings: SearchSettings = {
  categories: ["restauracja", "fryzjer", "sklep", "mechanik", "dentysta"],
  regions: ["Warszawa", "Kraków", "Wrocław", "Gdańsk", "Poznań"],
  intervalMinutes: 30,
};

const LeadContext = createContext<LeadContextType | null>(null);

const STORAGE_KEYS = {
  LEADS: "@leadhunter/leads_v2",
  SETTINGS: "@leadhunter/settings_v2",
  SCANNED: "@leadhunter/scanned_v2",
  KNOWN: "@leadhunter/known_v2",
};

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
}

interface PlaceLead {
  placeId: string;
  companyName: string;
  phone: string;
  address: string;
  hasWebsite: boolean;
}

async function fetchPlaceLeads(
  keyword: string,
  location: string,
): Promise<PlaceLead[]> {
  const base = getBaseUrl();
  const url =
    `${base}/api/places/search` +
    `?keyword=${encodeURIComponent(keyword)}` +
    `&location=${encodeURIComponent(location)}`;

  const resp = await fetch(url, {
    signal: AbortSignal.timeout(30000),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API error ${resp.status}: ${text}`);
  }

  const data = (await resp.json()) as { leads: PlaceLead[]; total: number };
  return data.leads ?? [];
}

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [totalScanned, setTotalScanned] = useState(0);
  const [lastSearchAt, setLastSearchAt] = useState<string | null>(null);
  const [settings, setSettings] = useState<SearchSettings>(defaultSettings);
  const [searchLog, setSearchLog] = useState<string[]>([]);

  const knownRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);
  const isSearchingRef = useRef(false);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("pl-PL");
    setSearchLog((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 150));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [storedLeads, storedSettings, storedCount] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LEADS),
          AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
          AsyncStorage.getItem(STORAGE_KEYS.SCANNED),
        ]);
        if (storedLeads) {
          const parsed: Lead[] = JSON.parse(storedLeads);
          setLeads(parsed);
          parsed.forEach((l) => knownRef.current.add(l.phone + "|" + l.companyName));
        }
        if (storedSettings) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(storedSettings) }));
        }
        if (storedCount) {
          setTotalScanned(Number(storedCount));
        }
      } catch {}
    })();
  }, []);

  const saveLeads = useCallback(async (newLeads: Lead[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(newLeads));
    } catch {}
  }, []);

  const performSearch = useCallback(
    async (currentSettings: SearchSettings) => {
      if (isSearchingRef.current) return;
      isSearchingRef.current = true;
      setIsSearching(true);
      addLog("Rozpoczynam wyszukiwanie firm bez strony www...");

      let newCount = 0;
      let scannedCount = 0;

      for (const category of currentSettings.categories) {
        for (const region of currentSettings.regions) {
          if (!isRunningRef.current && leads.length > 0) {
            // only break if automation was stopped mid-run
          }

          addLog(`Google Maps: "${category}" w ${region}...`);

          try {
            const found = await fetchPlaceLeads(category, region);
            scannedCount += found.length;

            setTotalScanned((prev) => {
              const next = prev + found.length;
              AsyncStorage.setItem(STORAGE_KEYS.SCANNED, String(next));
              return next;
            });

            const newLeads: Lead[] = [];
            for (const biz of found) {
              const key = biz.phone + "|" + biz.companyName;
              if (!knownRef.current.has(key)) {
                knownRef.current.add(key);
                newLeads.push({
                  id: generateId(),
                  companyName: biz.companyName,
                  phone: biz.phone,
                  category,
                  city: region,
                  address: biz.address,
                  discoveredAt: new Date().toISOString(),
                });
                newCount++;
              }
            }

            if (newLeads.length > 0) {
              setLeads((prev) => {
                const updated = [...newLeads, ...prev];
                saveLeads(updated);
                return updated;
              });
              addLog(`✓ ${newLeads.length} nowych leadów (${category} / ${region})`);
            } else if (found.length > 0) {
              addLog(`— Brak nowych firm bez www w: ${category} / ${region}`);
            } else {
              addLog(`— Brak wyników dla: ${category} / ${region}`);
            }
          } catch (e: any) {
            addLog(`⚠ Błąd: ${category}/${region} — ${e?.message ?? "nieznany błąd"}`);
          }
        }
      }

      setLastSearchAt(new Date().toISOString());
      isSearchingRef.current = false;
      setIsSearching(false);
      addLog(
        `Zakończono. Przeskanowano ${scannedCount} firm, dodano ${newCount} nowych leadów.`,
      );
    },
    [addLog, saveLeads, leads.length],
  );

  const startAutomation = useCallback(() => {
    setIsRunning(true);
    isRunningRef.current = true;
    addLog("▶ Automatyzacja uruchomiona");

    setSettings((current) => {
      performSearch(current);
      intervalRef.current = setInterval(() => {
        setSettings((s) => {
          performSearch(s);
          return s;
        });
      }, current.intervalMinutes * 60 * 1000);
      return current;
    });
  }, [addLog, performSearch]);

  const stopAutomation = useCallback(() => {
    setIsRunning(false);
    isRunningRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    addLog("■ Automatyzacja zatrzymana");
  }, [addLog]);

  const runOnce = useCallback(async () => {
    await performSearch(settings);
  }, [settings, performSearch]);

  const clearLeads = useCallback(async () => {
    setLeads([]);
    knownRef.current = new Set();
    setTotalScanned(0);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LEADS,
      STORAGE_KEYS.SCANNED,
      STORAGE_KEYS.KNOWN,
    ]);
    addLog("Wyczyszczono bazę leadów");
  }, [addLog]);

  const removeLead = useCallback(
    async (id: string) => {
      setLeads((prev) => {
        const updated = prev.filter((l) => l.id !== id);
        saveLeads(updated);
        return updated;
      });
    },
    [saveLeads],
  );

  const markContacted = useCallback(
    (id: string) => {
      setLeads((prev) => {
        const updated = prev.map((l) =>
          l.id === id
            ? { ...l, contacted: true, contactedAt: new Date().toISOString() }
            : l,
        );
        saveLeads(updated);
        return updated;
      });
    },
    [saveLeads],
  );

  const updateSettings = useCallback((partial: Partial<SearchSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <LeadContext.Provider
      value={{
        leads,
        isRunning,
        isSearching,
        totalScanned,
        lastSearchAt,
        settings,
        startAutomation,
        stopAutomation,
        clearLeads,
        removeLead,
        markContacted,
        updateSettings,
        runOnce,
        searchLog,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads(): LeadContextType {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error("useLeads must be inside LeadProvider");
  return ctx;
}
