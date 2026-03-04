import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { PrimaryButton } from "@/components/PrimaryButton";
import { OutlineButton } from "@/components/OutlineButton";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

export default function PermissionScreen() {
  const insets = useSafeAreaInsets();
  const { strings, updateSettings } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    opacity.value = withSpring(1, { damping: 20 });
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleAllow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "android") {
      await Linking.openSettings();
    }
    await updateSettings({ onboardingDone: true, overlayPermissionDeclined: false });
    router.replace("/(main)/home");
  };

  const handleNotNow = async () => {
    await updateSettings({ onboardingDone: true, overlayPermissionDeclined: true });
    router.replace("/(main)/home");
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topInset + 40, paddingBottom: bottomInset + 24 },
      ]}
    >
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <View style={styles.iconBg}>
          <Ionicons name="layers-outline" size={52} color={Colors.accent} />
        </View>
      </Animated.View>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{strings.overlayPermission}</Text>
        <Text style={styles.subtitle}>{strings.overlayDesc}</Text>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.accent} />
        <Text style={styles.infoText}>
          This is only used during active sessions to display math cards over other apps.
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.actions}>
        <PrimaryButton
          label={strings.allowOverlay}
          onPress={handleAllow}
          style={{ width: "100%" }}
        />
        <OutlineButton
          label={strings.notNow}
          onPress={handleNotNow}
          style={{ width: "100%" }}
        />
      </View>
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
  iconWrap: { alignItems: "center" },
  iconBg: {
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
  infoCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: Colors.accentLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    color: Colors.accent,
    lineHeight: 19,
  },
  spacer: { flex: 1 },
  actions: { gap: 12 },
});
