import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "@/constants/strings";
import type { Difficulty } from "@/lib/math";

export interface AppSettings {
  cardSizeFull: boolean;
  strictMode: boolean;
  audioCue: boolean;
  vibration: boolean;
  funPopups: boolean;
  cardsBeforePopup: number;
  durationMs: number;
  frequencyMs: number;
  language: Language;
  premiumToken: string;
  onboardingDone: boolean;
  userVerified: boolean;
  overlayPermissionDeclined: boolean;
  currentDifficulty: Difficulty;
}

const DEFAULTS: AppSettings = {
  cardSizeFull: false,
  strictMode: false,
  audioCue: true,
  vibration: true,
  funPopups: false,
  cardsBeforePopup: 3,
  durationMs: 1200000,
  frequencyMs: 60000,
  language: "en",
  premiumToken: "",
  onboardingDone: false,
  userVerified: false,
  overlayPermissionDeclined: false,
  currentDifficulty: "easy",
};

const STORAGE_KEY = "qm_settings_v1";

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const current = await loadSettings();
  current[key] = value;
  await saveSettings(current);
}

export function isPremium(token: string): boolean {
  return token.length > 0 && token.startsWith("qm_");
}

export const DURATION_OPTIONS = [
  { label: "5 min", ms: 300000 },
  { label: "10 min", ms: 600000 },
  { label: "15 min", ms: 900000 },
  { label: "20 min", ms: 1200000 },
  { label: "30 min", ms: 1800000 },
  { label: "45 min", ms: 2700000 },
  { label: "60 min", ms: 3600000 },
];

export const FREQUENCY_OPTIONS = [
  { label: "30s", ms: 30000 },
  { label: "1 min", ms: 60000 },
  { label: "2 min", ms: 120000 },
  { label: "3 min", ms: 180000 },
  { label: "5 min", ms: 300000 },
];
