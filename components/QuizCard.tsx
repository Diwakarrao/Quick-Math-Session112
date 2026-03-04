import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { CountdownRing } from "./CountdownRing";
import { AnswerOptionButton, AnswerState } from "./AnswerOptionButton";
import type { QuizCard as QuizCardType } from "@/lib/math";
import { Ionicons } from "@expo/vector-icons";

const TOTAL_MS = 15000;
const letters = ["A", "B", "C", "D"];

interface QuizCardProps {
  visible: boolean;
  card: QuizCardType | null;
  strings: { timeUp: string; thinking: string; correct: string; wrong: string; close: string };
  onAnswer: (idx: number) => void;
  onDismiss: () => void;
  answerIndex: number | null;
  timerComplete: boolean;
  onTimerComplete: () => void;
}

export function QuizCard({
  visible,
  card,
  strings,
  onAnswer,
  onDismiss,
  answerIndex,
  timerComplete,
  onTimerComplete,
}: QuizCardProps) {
  const [remainingMs, setRemainingMs] = useState(TOTAL_MS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(Date.now());
  const timerDoneRef = useRef(false);

  const slideY = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible && card) {
      setRemainingMs(TOTAL_MS);
      timerDoneRef.current = false;
      startRef.current = Date.now();

      slideY.value = withSpring(0, { damping: 20, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 250 });

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startRef.current;
        const remaining = Math.max(0, TOTAL_MS - elapsed);
        setRemainingMs(remaining);
        if (remaining <= 0 && !timerDoneRef.current) {
          timerDoneRef.current = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
          onTimerComplete();
        }
      }, 100);
    } else {
      slideY.value = withTiming(60, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible, card]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
    opacity: opacity.value,
  }));

  const getAnswerState = useCallback(
    (idx: number): AnswerState => {
      if (answerIndex === null) return "default";
      if (!timerComplete) {
        return idx === answerIndex ? "selected" : "default";
      }
      if (idx === card?.correctIndex) return "correct";
      if (idx === answerIndex && idx !== card?.correctIndex) return "wrong";
      return "default";
    },
    [answerIndex, timerComplete, card]
  );

  const handleAnswer = useCallback(
    (idx: number) => {
      if (answerIndex !== null) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onAnswer(idx);
    },
    [answerIndex, onAnswer]
  );

  const handleDismiss = useCallback(() => {
    if (!timerComplete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  }, [timerComplete, onDismiss]);

  if (!card) return null;

  const optionTexts = card.options.map((o) => o.replace(/^[A-D]\. /, ""));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, animStyle]}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.qmBadge}>
                <Text style={styles.qmText}>QM</Text>
              </View>
              <Text style={styles.brandName}>QUICK MATH</Text>
            </View>
            <CountdownRing
              totalMs={TOTAL_MS}
              remainingMs={remainingMs}
              onComplete={() => {}}
            />
          </View>

          <View style={styles.accentBar} />

          <Text style={styles.prompt}>
            {timerComplete ? strings.timeUp : strings.thinking}
          </Text>

          <Text style={styles.question}>{card.question}</Text>

          <View style={styles.options}>
            {optionTexts.map((opt, idx) => (
              <AnswerOptionButton
                key={idx}
                letter={letters[idx]}
                text={opt}
                state={getAnswerState(idx)}
                onPress={() => handleAnswer(idx)}
                disabled={answerIndex !== null}
              />
            ))}
          </View>

          <Pressable
            onPress={handleDismiss}
            style={[styles.closeBtn, !timerComplete && styles.closeBtnHidden]}
            pointerEvents={timerComplete ? "auto" : "none"}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={timerComplete ? Colors.secondary : "transparent"}
            />
            <Text
              style={[
                styles.closeText,
                !timerComplete && { color: "transparent" },
              ]}
            >
              {strings.close}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,13,20,0.55)",
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "web" ? 34 : 0,
  },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    gap: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.accent,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qmBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  qmText: {
    color: "#fff",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 13,
  },
  brandName: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 13,
    color: Colors.accent,
    letterSpacing: 1.5,
  },
  prompt: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: Colors.secondary,
  },
  question: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 36,
    color: Colors.ink,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  options: {
    gap: 10,
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 4,
  },
  closeBtnHidden: {
    opacity: 0,
  },
  closeText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: Colors.secondary,
  },
});
