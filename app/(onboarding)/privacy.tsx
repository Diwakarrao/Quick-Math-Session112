import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

const POINTS = [
  { icon: "cloud-offline-outline" as const, textKey: "offlineAfterSetup" },
  { icon: "people-outline" as const, textKey: "ageNotice" },
  { icon: "shield-checkmark-outline" as const, textKey: "zeroData" },
] as const;

function PrivacyPoint({ icon, text, delay }: { icon: keyof typeof Ionicons.glyphMap; text: string; delay: number }) {
  const translateX = useSharedValue(-30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 200 }));
    opacity.value = withDelay(delay, withSpring(1));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.point, animStyle]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={Colors.accent} />
      </View>
      <Text style={styles.pointText}>{text}</Text>
    </Animated.View>
  );
}

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { strings, updateSettings } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 14, stiffness: 200 });
    iconOpacity.value = withSpring(1, { damping: 20 });
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const handleAccept = async () => {
    router.push("/(onboarding)/permission");
  };

  const pointTexts: Record<string, string> = {
    offlineAfterSetup: strings.offlineAfterSetup,
    ageNotice: strings.ageNotice,
    zeroData: strings.zeroData,
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topInset + 40, paddingBottom: bottomInset + 24 },
      ]}
    >
      <Animated.View style={[styles.shieldWrap, iconStyle]}>
        <View style={styles.shieldBg}>
          <Ionicons name="shield-checkmark" size={52} color={Colors.accent} />
        </View>
      </Animated.View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{strings.privacy}</Text>
        <Text style={styles.subtitle}>{strings.privacyDesc}</Text>
      </View>

      <View style={styles.points}>
        {POINTS.map((p, i) => (
          <PrivacyPoint
            key={p.textKey}
            icon={p.icon}
            text={pointTexts[p.textKey]}
            delay={i * 100}
          />
        ))}
      </View>

      <View style={styles.spacer} />

      <PrimaryButton
        label={strings.acceptAndContinue}
        onPress={handleAccept}
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
  shieldWrap: {
    alignItems: "center",
  },
  shieldBg: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titleWrap: { gap: 8 },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 30,
    color: Colors.ink,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: Colors.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  points: { gap: 16 },
  point: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  pointText: {
    flex: 1,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 20,
  },
  spacer: { flex: 1 },
});
