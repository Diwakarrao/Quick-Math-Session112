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
import { AppState } from "react-native";
import {
  AppSettings,
  loadSettings,
  saveSettings,
  isPremium,
  DURATION_OPTIONS,
  FREQUENCY_OPTIONS,
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
  strings: ReturnType<typeof getStrings>;

  session: SessionState;
  startSession: () => void;
  stopSession: () => void;

  currentCard: QuizCard | null;
  cardVisible: boolean;
  cardTimerMs: number;
  answerIndex: number | null;
  answerLockedAt: number | null;
  timerComplete: boolean;
  markTimerComplete: () => void;
  handleAnswer: (idx: number) => void;
  dismissCard: () => void;
  nextCard: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
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
  });
  const [loaded, setLoaded] = useState(false);

  const [session, setSession] = useState<SessionState>({
    active: false,
    startedAt: null,
    cardsShown: 0,
    cardsSincePopup: 0,
  });

  const [currentCard, setCurrentCard] = useState<QuizCard | null>(null);
  const [cardVisible, setCardVisible] = useState(false);
  const [cardTimerMs, setCardTimerMs] = useState(15000);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [answerLockedAt, setAnswerLockedAt] = useState<number | null>(null);
  const [timerComplete, setTimerComplete] = useState(false);
  const [cardShownAt, setCardShownAt] = useState<number | null>(null);
  const timerCompleteRef = useRef(false);

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const cardIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const card = generateQuizCard(diff);
    setCurrentCard(card);
    setCardVisible(true);
    setCardTimerMs(15000);
    setAnswerIndex(null);
    setAnswerLockedAt(null);
    setTimerComplete(false);
    setCardShownAt(Date.now());
  }, []);

  const startSession = useCallback(() => {
    const s = settingsRef.current;
    setSession({
      active: true,
      startedAt: Date.now(),
      cardsShown: 0,
      cardsSincePopup: 0,
    });

    firstCardTimeoutRef.current = setTimeout(() => {
      if (!sessionRef.current.active) return;
      const diff = settingsRef.current.currentDifficulty;
      showNextCard(diff);
      setSession((prev) => ({ ...prev, cardsShown: prev.cardsShown + 1, cardsSincePopup: prev.cardsSincePopup + 1 }));

      cardIntervalRef.current = setInterval(() => {
        if (!sessionRef.current.active) return;
        const currentDiff = settingsRef.current.currentDifficulty;
        showNextCard(currentDiff);
        setSession((prev) => ({
          ...prev,
          cardsShown: prev.cardsShown + 1,
          cardsSincePopup: prev.cardsSincePopup + 1,
        }));
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
    setSession({ active: false, startedAt: null, cardsShown: 0, cardsSincePopup: 0 });
    setCardVisible(false);
    setCurrentCard(null);
  }, []);

  const stopSession = useCallback(() => {
    stopSessionInternal();
  }, [stopSessionInternal]);

  const handleAnswer = useCallback((idx: number) => {
    if (answerIndex !== null) return;
    setAnswerIndex(idx);
    setAnswerLockedAt(Date.now());
  }, [answerIndex]);

  const markTimerComplete = useCallback(() => {
    timerCompleteRef.current = true;
    setTimerComplete(true);
  }, []);

  const dismissCard = useCallback(() => {
    if (!timerCompleteRef.current) return;
    const responseMs = answerLockedAt && cardShownAt ? answerLockedAt - cardShownAt : 15000;
    const wasCorrect = answerIndex === currentCard?.correctIndex;
    const newDiff = adaptDifficulty(settings.currentDifficulty, responseMs, wasCorrect);
    updateSettings({ currentDifficulty: newDiff });
    timerCompleteRef.current = false;
    setTimerComplete(false);
    setCardVisible(false);
    setCurrentCard(null);
    setAnswerIndex(null);
    setAnswerLockedAt(null);
  }, [answerLockedAt, cardShownAt, answerIndex, currentCard, settings.currentDifficulty, updateSettings]);

  const nextCard = useCallback(() => {
    dismissCard();
  }, [dismissCard]);

  const isPremiumUser = isPremium(settings.premiumToken);
  const strings = getStrings(settings.language);

  const value = useMemo<AppContextValue>(
    () => ({
      settings,
      updateSettings,
      loaded,
      isPremiumUser,
      strings,
      session,
      startSession,
      stopSession,
      currentCard,
      cardVisible,
      cardTimerMs,
      answerIndex,
      answerLockedAt,
      timerComplete,
      markTimerComplete,
      handleAnswer,
      dismissCard,
      nextCard,
    }),
    [
      settings, updateSettings, loaded, isPremiumUser, strings,
      session, startSession, stopSession,
      currentCard, cardVisible, cardTimerMs, answerIndex, answerLockedAt,
      timerComplete, markTimerComplete, handleAnswer, dismissCard, nextCard,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
