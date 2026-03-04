import React, { ReactNode } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  leftIcon?: ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  leftIcon,
}: PrimaryButtonProps) {
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
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.button,
          (disabled || loading) && styles.disabled,
          style,
          animStyle,
        ]}
      >
        {leftIcon}
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 0.2,
  },
});
