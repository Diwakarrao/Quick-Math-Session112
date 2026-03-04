import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/colors";

interface TappableSettingRowProps {
  label: string;
  value: string;
  onPress: () => void;
}

export function TappableSettingRow({ label, value, onPress }: TappableSettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 15,
    color: Colors.secondary,
    fontFamily: "Nunito_600SemiBold",
  },
  value: {
    fontSize: 15,
    color: Colors.accent,
    fontFamily: "Nunito_700Bold",
    textDecorationLine: "underline",
  },
});
