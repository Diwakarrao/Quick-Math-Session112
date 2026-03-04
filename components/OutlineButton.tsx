import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

interface OutlineButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function OutlineButton({ label, onPress, disabled, style }: OutlineButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 250 });
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[styles.button, disabled && styles.disabled, style, animStyle]}>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: Colors.accent,
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 0.2,
  },
});
