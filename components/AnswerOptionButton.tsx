import React, { useEffect } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

export type AnswerState = "default" | "selected" | "correct" | "wrong";

interface AnswerOptionButtonProps {
  letter: string;
  text: string;
  state: AnswerState;
  onPress: () => void;
  disabled: boolean;
}

export function AnswerOptionButton({
  letter,
  text,
  state,
  onPress,
  disabled,
}: AnswerOptionButtonProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (state === "correct") {
      scale.value = withSequence(
        withSpring(1.05, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 250 })
      );
    } else if (state === "wrong") {
      translateX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  }, [state]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }));

  const bgColor =
    state === "correct"
      ? "#DCFCE7"
      : state === "wrong"
      ? "#FEE2E2"
      : state === "selected"
      ? Colors.accentLight
      : Colors.white;

  const borderColor =
    state === "correct"
      ? Colors.success
      : state === "wrong"
      ? Colors.danger
      : state === "selected"
      ? Colors.accent
      : Colors.border;

  const letterBg =
    state === "correct"
      ? Colors.success
      : state === "wrong"
      ? Colors.danger
      : state === "selected"
      ? Colors.accent
      : Colors.surface;

  const letterColor =
    state === "correct" || state === "wrong" || state === "selected"
      ? "#fff"
      : Colors.secondary;

  const textStyle: any = {
    textDecorationLine: state === "wrong" ? "line-through" : "none",
    color: state === "correct" ? Colors.success : state === "wrong" ? Colors.danger : Colors.ink,
  };

  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ width: "100%" }}>
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: bgColor, borderColor },
          animStyle,
        ]}
      >
        <View style={[styles.badge, { backgroundColor: letterBg }]}>
          <Text style={[styles.letter, { color: letterColor }]}>{letter}</Text>
        </View>
        <Text style={[styles.text, textStyle]} numberOfLines={2}>
          {text}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
  },
  text: {
    flex: 1,
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
  },
});
