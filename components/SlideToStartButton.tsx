import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";

const TRACK_PADDING = 6;
const THUMB_SIZE = 52;

interface SlideToStartButtonProps {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  startLabel: string;
  stopLabel: string;
}

export function SlideToStartButton({
  active,
  onStart,
  onStop,
  startLabel,
  stopLabel,
}: SlideToStartButtonProps) {
  const trackWidth = useRef(0);
  const thumbX = useSharedValue(0);
  const [dragging, setDragging] = useState(false);

  const maxX = useRef(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !active,
    onMoveShouldSetPanResponder: () => !active,
    onPanResponderGrant: () => {
      setDragging(true);
    },
    onPanResponderMove: (_, gs) => {
      const clampedX = Math.max(0, Math.min(gs.dx, maxX.current));
      thumbX.value = clampedX;
    },
    onPanResponderRelease: (_, gs) => {
      setDragging(false);
      if (gs.dx >= maxX.current * 0.85) {
        thumbX.value = withSpring(maxX.current, { damping: 18, stiffness: 250 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          onStart();
          thumbX.value = withSpring(0, { damping: 18, stiffness: 250 });
        }, 200);
      } else {
        thumbX.value = withSpring(0, { damping: 18, stiffness: 250 });
      }
    },
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: interpolate(
      thumbX.value,
      [0, maxX.current || 1],
      [THUMB_SIZE + TRACK_PADDING * 2, trackWidth.current],
      Extrapolation.CLAMP
    ),
  }));

  const labelOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(thumbX.value, [0, 80], [1, 0], Extrapolation.CLAMP),
  }));

  if (active) {
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onStop();
        }}
        style={({ pressed }) => [styles.stopButton, pressed && { opacity: 0.82 }]}
      >
        <Ionicons name="stop-circle" size={22} color="#fff" />
        <Text style={styles.stopLabel}>{stopLabel}</Text>
      </Pressable>
    );
  }

  return (
    <View
      style={styles.track}
      onLayout={(e) => {
        trackWidth.current = e.nativeEvent.layout.width;
        maxX.current = e.nativeEvent.layout.width - THUMB_SIZE - TRACK_PADDING * 2;
      }}
      {...panResponder.panHandlers}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
      <Animated.View style={[styles.thumb, thumbStyle]}>
        <Ionicons name="chevron-forward" size={24} color={Colors.accent} />
      </Animated.View>
      <Animated.View style={[styles.labelWrap, labelOpacity]} pointerEvents="none">
        <Text style={styles.label}>{startLabel}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: THUMB_SIZE + TRACK_PADDING * 2,
    backgroundColor: Colors.accentLight,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: "hidden",
    justifyContent: "center",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.accent,
    borderRadius: 100,
  },
  thumb: {
    position: "absolute",
    left: TRACK_PADDING,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  labelWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: Colors.accent,
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  stopButton: {
    backgroundColor: Colors.danger,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  stopLabel: {
    color: "#fff",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 16,
  },
});
