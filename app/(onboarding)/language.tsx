import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/context/AppContext";
import type { Language } from "@/constants/strings";

const LANGUAGES: { key: Language; label: string; native: string; flag: string }[] = [
  { key: "en", label: "English", native: "English", flag: "🇬🇧" },
  { key: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { key: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
];

function LangCard({
  item,
  selected,
  onSelect,
  delay,
}: {
  item: (typeof LANGUAGES)[0];
  selected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 200 }));
    opacity.value = withDelay(delay, withSpring(1, { damping: 20 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          styles.langCard,
          selected && styles.langCardSelected,
          pressed && { opacity: 0.85 },
        ]}
      >
        <View style={styles.langLeft}>
          <Text style={styles.flag}>{item.flag}</Text>
          <View>
            <Text style={[styles.langLabel, selected && styles.langLabelSelected]}>
              {item.native}
            </Text>
            <Text style={styles.langSub}>{item.label}</Text>
          </View>
        </View>
        <View
          style={[
            styles.radio,
            selected && styles.radioSelected,
          ]}
        >
          {selected && <View style={styles.radioDot} />}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useApp();
  const [selected, setSelected] = useState<Language | null>(null);

  const titleY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleY.value = withSpring(0, { damping: 18, stiffness: 200 });
    titleOpacity.value = withSpring(1, { damping: 20 });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));

  const handleSelect = (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(lang);
  };

  const handleContinue = async () => {
    if (!selected) return;
    await updateSettings({ language: selected });
    router.push("/(onboarding)/otp");
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topInset + 24, paddingBottom: bottomInset + 24 }]}>
      <View style={styles.badge}>
        <View style={styles.qmBadge}>
          <Text style={styles.qmText}>QM</Text>
        </View>
        <Text style={styles.appName}>Quick Math</Text>
      </View>

      <Animated.View style={[styles.titleWrap, titleStyle]}>
        <Text style={styles.title}>Choose your{"\n"}language</Text>
        <Text style={styles.subtitle}>Pick the language you're most comfortable with</Text>
      </Animated.View>

      <View style={styles.cards}>
        {LANGUAGES.map((lang, i) => (
          <LangCard
            key={lang.key}
            item={lang}
            selected={selected === lang.key}
            onSelect={() => handleSelect(lang.key)}
            delay={i * 80}
          />
        ))}
      </View>

      <PrimaryButton
        label="Continue"
        onPress={handleContinue}
        disabled={!selected}
        style={{ width: "100%" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    gap: 28,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qmBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  qmText: {
    color: "#fff",
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 16,
  },
  appName: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 22,
    color: Colors.ink,
  },
  titleWrap: {
    gap: 8,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 32,
    color: Colors.ink,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: Colors.secondary,
    lineHeight: 22,
  },
  cards: {
    flex: 1,
    gap: 12,
  },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 18,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  langCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  langLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  flag: {
    fontSize: 28,
  },
  langLabel: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: Colors.ink,
  },
  langLabelSelected: {
    color: Colors.accent,
  },
  langSub: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.secondary,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
});
