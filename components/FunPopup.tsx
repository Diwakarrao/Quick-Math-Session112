import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Modal, Image, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

const dotsImage = require("@/assets/images/popup_dots.jpeg");
const ringImage = require("@/assets/images/popup_ring.jpeg");

const AUTO_DISMISS_MS = 15000;

interface FunPopupProps {
  visible: boolean;
  type: "dots" | "ring";
  onDismiss: () => void;
}

function DotsOverlay() {
  const leftScale = useSharedValue(1);
  const rightScale = useSharedValue(1);

  useEffect(() => {
    leftScale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      false
    );
    rightScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.05, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
  }));
  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={dotsImage}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.glowCircle, styles.redGlow, leftStyle]} />
        <Animated.View style={[styles.glowCircle, styles.greenGlow, rightStyle]} />
      </View>
    </View>
  );
}

function RingOverlay() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={ringImage}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={styles.ringCenter}>
        <Animated.View style={[styles.spinRing, ringStyle]} />
        <View style={styles.faintRing} />
      </View>
    </View>
  );
}

export function FunPopup({ visible, type, onDismiss }: FunPopupProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withSpring(1, { damping: 20 });
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, AUTO_DISMISS_MS);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.container, animStyle]} pointerEvents="none">
        {type === "dots" ? <DotsOverlay /> : <RingOverlay />}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  bgImage: {
    position: "absolute",
    width: W,
    height: H,
    opacity: 0.85,
  },
  dotsRow: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  glowCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  redGlow: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 12,
  },
  greenGlow: {
    backgroundColor: "#22C55E",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 12,
  },
  ringCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  spinRing: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: "#FFFFFF",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  faintRing: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
});
