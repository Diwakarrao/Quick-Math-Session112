import React, { ReactNode } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";

interface AppCardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function AppCard({ children, onPress, style, disabled }: AppCardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.card,
          style,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});
