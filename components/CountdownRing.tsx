import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  interpolateColor,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "@/constants/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 30;
const STROKE = 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE) * 2 + 4;

interface CountdownRingProps {
  totalMs: number;
  remainingMs: number;
  onComplete?: () => void;
}

export function CountdownRing({ totalMs, remainingMs, onComplete }: CountdownRingProps) {
  const progress = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const calledComplete = useRef(false);
  const prevRemaining = useRef(remainingMs);

  const seconds = Math.ceil(remainingMs / 1000);
  const isLastFive = seconds <= 5;

  useEffect(() => {
    progress.value = withTiming(remainingMs / totalMs, {
      duration: 1000,
      easing: Easing.linear,
    });

    if (remainingMs <= 0 && !calledComplete.current) {
      calledComplete.current = true;
      onComplete?.();
    }
  }, [remainingMs, totalMs]);

  useEffect(() => {
    if (isLastFive) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isLastFive]);

  const animProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    const strokeColor = interpolateColor(
      progress.value,
      [0, 0.33, 1],
      [Colors.danger, Colors.danger, Colors.accent]
    );
    return {
      strokeDashoffset,
      stroke: strokeColor,
    };
  });

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    color: isLastFive ? Colors.danger : Colors.ink,
  }));

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.border}
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
          animatedProps={animProps}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Animated.Text style={[styles.number, textStyle]}>
            {Math.max(0, seconds)}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
  },
});
