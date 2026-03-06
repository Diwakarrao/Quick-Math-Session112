import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import {
  AppSettings,
  loadSettings,
  saveSettings,
  isPremium,
  isInFreeTrial,
  freeTrialEnded,
  freeTrialDaysLeft,
  mustVerifyOtp,
  hasAnyPremiumAccess,
} from "@/lib/storage";
import { generateQuizCard, adaptDifficulty, QuizCard, Difficulty } from "@/lib/math";
import { getStrings } from "@/constants/strings";

interface SessionState {
  active: boolean;
  startedAt: number | null;
  cardsShown: number;
  cardsSincePopup: number;
}

interface AppContextValue {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  loaded: boolean;
  isPremiumUser: boolean;
  hasAnyPremium: boolean;
  inFreeTrial: boolean;
  trialDaysLeft: number;
  needsOtp: boolean;
  strings: ReturnType<typeof getStrings>;

  session: SessionState;
  startSession: () => void;
  stopSession: () => void;

  currentCard: QuizCard | null;
  cardVisible: boolean;
  answerIndex: number | null;
  answerLockedAt: number | null;
  timerComplete: boolean;
  markTimerComplete: () => void;
  handleAnswer: (idx: number) => void;
  dismissCard: () => void;

  funPopupVisible: boolean;
  funPopupType: "dots" | "ring";
  dismissFunPopup: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_SETTINGS: AppSettings = {
  cardSizeFull: false,
  strictMode: false,
  audioCue: true,
  vibration: true,
  funPopups: false,
  cardsBeforePopup: 3,
  durationMs: 1200000,
  frequencyMs: 60000,
  cardDurationMs: 15000,
  language: "en",
  premiumToken: "",
  onboardingDone: false,
  userVerified: false,
  overlayPermissionDeclined: false,
  currentDifficulty: "easy",
  freeTrialStartedAt: null,
  otpSkippedAt: null,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const [session, setSession] = useState<SessionState>({
    active: false,
    startedAt: null,
    cardsShown: 0,
    cardsSincePopup: 0,
  });

  const [currentCard, setCurrentCard] = useState<QuizCard | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [answerLockedAt, setAnswerLockedAt] = useState<number | null>(null);
  const [timerComplete, setTimerComplete] = useState(false);
  const [cardShownAt, setCardShownAt] = useState<number | null>(null);

  const [funPopupVisible, setFunPopupVisible] = useState(false);
  const [funPopupType, setFunPopupType] = useState<"dots" | "ring">("dots");

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const timerCompleteRef = useRef(false);
  const cardIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const funPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupCountRef = useRef(0);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const showNextCard = useCallback((diff: Difficulty) => {
    const s = settingsRef.current;
    const card = generateQuizCard(diff);
    setCurrentCard(card);
    setCardVisible(true);
    setAnswerIndex(null);
    setAnswerLockedAt(null);
    timerCompleteRef.current = false;
    setTimerComplete(false);
    setCardShownAt(Date.now());

    // Check if we should show a fun popup after this card
    if (s.funPopups) {
      popupCountRef.current += 1;
      if (popupCountRef.current >= s.cardsBeforePopup) {
        popupCountRef.current = 0;
        // Show fun popup 500ms after the card would be dismissed
        const totalCardTime = s.cardDurationMs + 2000;
        funPopupTimerRef.current = setTimeout(() => {
          if (!cardVisible) {
            setFunPopupType(Math.random() > 0.5 ? "dots" : "ring");
            setFunPopupVisible(true);
          }
        }, totalCardTime);
      }
    }
  }, []);

  const startSession = useCallback(() => {
    const s = settingsRef.current;
    setSession({
      active: true,
      startedAt: Date.now(),
      cardsShown: 0,
      cardsSincePopup: 0,
    });
    popupCountRef.current = 0;

    firstCardTimeoutRef.current = setTimeout(() => {
      if (!sessionRef.current.active) return;
      const diff = settingsRef.current.currentDifficulty;
      showNextCard(diff);
      setSession((prev) => ({ ...prev, cardsShown: prev.cardsShown + 1 }));

      cardIntervalRef.current = setInterval(() => {
        if (!sessionRef.current.active) return;
        const currentDiff = settingsRef.current.currentDifficulty;
        showNextCard(currentDiff);
        setSession((prev) => ({ ...prev, cardsShown: prev.cardsShown + 1 }));
      }, Math.max(settingsRef.current.frequencyMs, 30000));
    }, 45000);

    sessionTimeoutRef.current = setTimeout(() => {
      stopSessionInternal();
    }, s.durationMs);
  }, [showNextCard]);

  const stopSessionInternal = useCallback(() => {
    if (cardIntervalRef.current) clearInterval(cardIntervalRef.current);
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    if (firstCardTimeoutRef.current) clearTimeout(firstCardTimeoutRef.current);
    if (funPopupTimerRef.current) clearTimeout(funPopupTimerRef.current);
    setSession({ active: false, startedAt: null, cardsShown: 0, cardsSincePopup: 0 });
    setCardVisible(false);
    setCurrentCard(null);
    setFunPopupVisible(false);
  }, []);

  const stopSession = useCallback(() => {
    stopSessionInternal();
  }, [stopSessionInternal]);

  const markTimerComplete = useCallback(() => {
    timerCompleteRef.current = true;
    setTimerComplete(true);
  }, []);

  const handleAnswer = useCallback((idx: number) => {
    if (answerIndex !== null) return;
    setAnswerIndex(idx);
    setAnswerLockedAt(Date.now());
  }, [answerIndex]);

  const dismissCard = useCallback(() => {
    if (!timerCompleteRef.current) return;
    const responseMs = answerLockedAt && cardShownAt ? answerLockedAt - cardShownAt : settingsRef.current.cardDurationMs;
    const wasCorrect = answerIndex === currentCard?.correctIndex;
    const newDiff = adaptDifficulty(settingsRef.current.currentDifficulty, responseMs, wasCorrect);
    updateSettings({ currentDifficulty: newDiff });
    timerCompleteRef.current = false;
    setTimerComplete(false);
    setCardVisible(false);
    setCurrentCard(null);
    setAnswerIndex(null);
    setAnswerLockedAt(null);
  }, [answerLockedAt, cardShownAt, answerIndex, currentCard, updateSettings]);

  const dismissFunPopup = useCallback(() => {
    setFunPopupVisible(false);
  }, []);

  const isPremiumUser = isPremium(settings.premiumToken);
  const inFreeTrial = isInFreeTrial(settings);
  const trialDaysLeft = freeTrialDaysLeft(settings);
  const hasAnyPremium = hasAnyPremiumAccess(settings);
  const needsOtp = mustVerifyOtp(settings);
  const strings = getStrings(settings.language);

  const value = useMemo<AppContextValue>(
    () => ({
      settings,
      updateSettings,
      loaded,
      isPremiumUser,
      hasAnyPremium,
      inFreeTrial,
      trialDaysLeft,
      needsOtp,
      strings,
      session,
      startSession,
      stopSession,
      currentCard,
      cardVisible,
      answerIndex,
      answerLockedAt,
      timerComplete,
      markTimerComplete,
      handleAnswer,
      dismissCard,
      funPopupVisible,
      funPopupType,
      dismissFunPopup,
    }),
    [
      settings, updateSettings, loaded,
      isPremiumUser, hasAnyPremium, inFreeTrial, trialDaysLeft, needsOtp, strings,
      session, startSession, stopSession,
      currentCard, cardVisible, answerIndex, answerLockedAt,
      timerComplete, markTimerComplete, handleAnswer, dismissCard,
      funPopupVisible, funPopupType, dismissFunPopup,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
