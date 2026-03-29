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
  region: string;
  discoveredAt: string;
  source: string;
}

export interface SearchSettings {
  categories: string[];
  regions: string[];
  intervalMinutes: number;
  autoStart: boolean;
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
  updateSettings: (s: Partial<SearchSettings>) => void;
  runOnce: () => Promise<void>;
  searchLog: string[];
}

const defaultSettings: SearchSettings = {
  categories: ["restauracja", "fryzjer", "sklep", "mechanik", "dentysta"],
  regions: ["Warszawa", "Kraków", "Wrocław", "Gdańsk", "Poznań"],
  intervalMinutes: 30,
  autoStart: false,
};

const LeadContext = createContext<LeadContextType | null>(null);

const STORAGE_KEYS = {
  LEADS: "@leadhunter/leads",
  SETTINGS: "@leadhunter/settings",
  SCANNED: "@leadhunter/scanned_count",
  KNOWN_IDS: "@leadhunter/known_ids",
};

const POLISH_BUSINESS_SOURCES = [
  {
    name: "Aleo.com",
    buildUrl: (category: string, region: string) =>
      `https://aleo.com/pl/firmy/${encodeURIComponent(region.toLowerCase())}?q=${encodeURIComponent(category)}&page=1`,
  },
  {
    name: "Panorama Firm",
    buildUrl: (category: string, region: string) =>
      `https://panoramafirm.pl/${encodeURIComponent(category)},firmy/${encodeURIComponent(region.toLowerCase())}/1`,
  },
];

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

function extractLeadsFromHTML(html: string, source: string, category: string, region: string): Lead[] {
  const leads: Lead[] = [];
  const phoneRegex = /(?:\+48[\s-]?)?(?:\d{3}[\s-]?\d{3}[\s-]?\d{3}|\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})/g;
  const nameRegex = /<h[123][^>]*class="[^"]*(?:company|firma|name|title)[^"]*"[^>]*>([^<]{3,80})<\/h[123]>/gi;

  const phoneMatches = html.match(phoneRegex) || [];
  const nameMatches: string[] = [];
  let match;
  while ((match = nameRegex.exec(html)) !== null) {
    nameMatches.push(match[1].trim());
  }

  const hasWebsite = (html: string, name: string) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const context = html.substring(
      Math.max(0, html.indexOf(name) - 200),
      html.indexOf(name) + 500,
    );
    return /https?:\/\/(?!panoramafirm|aleo\.com|zumi\.pl|google|facebook)[^\s"'>]{5,}/i.test(context);
  };

  for (let i = 0; i < Math.min(nameMatches.length, phoneMatches.length); i++) {
    const name = nameMatches[i];
    const phone = phoneMatches[i].replace(/[\s-]/g, "");
    if (name && phone && !hasWebsite(html, name)) {
      leads.push({
        id: generateId(),
        companyName: name,
        phone,
        category,
        city: region,
        region,
        discoveredAt: new Date().toISOString(),
        source,
      });
    }
  }

  return leads;
}

async function fetchBusinessListings(
  category: string,
  region: string,
): Promise<{ name: string; phone: string; hasWebsite: boolean }[]> {
  const results: { name: string; phone: string; hasWebsite: boolean }[] = [];

  const corsProxy = "https://corsproxy.io/?";

  for (const src of POLISH_BUSINESS_SOURCES) {
    try {
      const url = src.buildUrl(category, region);
      const resp = await fetch(`${corsProxy}${encodeURIComponent(url)}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
        },
        signal: AbortSignal.timeout(12000),
      });
      if (!resp.ok) continue;
      const html = await resp.text();
      const leads = extractLeadsFromHTML(html, src.name, category, region);
      for (const l of leads) {
        results.push({ name: l.companyName, phone: l.phone, hasWebsite: false });
      }
    } catch {
    }
  }

  return results;
}

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [totalScanned, setTotalScanned] = useState(0);
  const [lastSearchAt, setLastSearchAt] = useState<string | null>(null);
  const [settings, setSettings] = useState<SearchSettings>(defaultSettings);
  const [searchLog, setSearchLog] = useState<string[]>([]);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("pl-PL");
    setSearchLog((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 100));
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
          const ids = new Set(parsed.map((l) => l.phone + l.companyName));
          knownIdsRef.current = ids;
        }
        if (storedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
        }
        if (storedCount) {
          setTotalScanned(Number(storedCount));
        }
      } catch {}
    })();
  }, []);

  const saveLeads = useCallback(async (newLeads: Lead[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(newLeads));
  }, []);

  const performSearch = useCallback(
    async (currentSettings: SearchSettings) => {
      if (isSearching) return;
      setIsSearching(true);
      addLog("Rozpoczęto wyszukiwanie...");

      let newCount = 0;

      for (const category of currentSettings.categories) {
        for (const region of currentSettings.regions) {
          if (!isRunningRef.current && currentSettings.autoStart) break;
          addLog(`Szukam: ${category} w ${region}`);
          try {
            const found = await fetchBusinessListings(category, region);
            setTotalScanned((prev) => {
              const next = prev + found.length;
              AsyncStorage.setItem(STORAGE_KEYS.SCANNED, String(next));
              return next;
            });

            const newLeads: Lead[] = [];
            for (const biz of found) {
              const uniqueKey = biz.phone + biz.name;
              if (!knownIdsRef.current.has(uniqueKey)) {
                knownIdsRef.current.add(uniqueKey);
                newLeads.push({
                  id: generateId(),
                  companyName: biz.name,
                  phone: biz.phone,
                  category,
                  city: region,
                  region,
                  discoveredAt: new Date().toISOString(),
                  source: "Katalog PL",
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
              addLog(`✓ Dodano ${newLeads.length} nowych leadów z ${region}`);
            } else {
              addLog(`Brak nowych firm w: ${category} / ${region}`);
            }
          } catch (e) {
            addLog(`⚠ Błąd dla ${category}/${region}`);
          }
        }
      }

      const now = new Date().toISOString();
      setLastSearchAt(now);
      setIsSearching(false);
      addLog(`Zakończono. Dodano ${newCount} nowych leadów.`);
    },
    [isSearching, addLog, saveLeads],
  );

  const startAutomation = useCallback(() => {
    setIsRunning(true);
    isRunningRef.current = true;
    addLog("Automatyczne wyszukiwanie uruchomione");

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
    addLog("Automatyczne wyszukiwanie zatrzymane");
  }, [addLog]);

  const runOnce = useCallback(async () => {
    await performSearch(settings);
  }, [settings, performSearch]);

  const clearLeads = useCallback(async () => {
    setLeads([]);
    knownIdsRef.current = new Set();
    setTotalScanned(0);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LEADS,
      STORAGE_KEYS.SCANNED,
      STORAGE_KEYS.KNOWN_IDS,
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

  const updateSettings = useCallback(
    async (partial: Partial<SearchSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

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
