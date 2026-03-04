import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
  Linking,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { AppCard } from "@/components/AppCard";
import { TappableSettingRow } from "@/components/TappableSettingRow";
import { SlideToStartButton } from "@/components/SlideToStartButton";
import { QuizCard } from "@/components/QuizCard";
import { useApp } from "@/context/AppContext";
import { DURATION_OPTIONS, FREQUENCY_OPTIONS } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";

type PickerMode = "duration" | "frequency" | null;

function AnimatedSection({ children, delay }: { children: React.ReactNode; delay: number }) {
  const translateY = useSharedValue(24);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 200 }));
    opacity.value = withDelay(delay, withSpring(1, { damping: 20 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

function PulsingDot({ active }: { active: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 700 }),
          withTiming(1, { duration: 700 })
        ),
        -1
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: active ? 1 : 0,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: Colors.success,
        },
        style,
      ]}
    />
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    settings, updateSettings, strings, isPremiumUser,
    session, startSession, stopSession,
    currentCard, cardVisible, cardTimerMs, answerIndex, timerComplete,
    markTimerComplete, handleAnswer, dismissCard,
  } = useApp();

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const currentDuration = DURATION_OPTIONS.find((d) => d.ms === settings.durationMs) || DURATION_OPTIONS[3];
  const currentFrequency = FREQUENCY_OPTIONS.find((f) => f.ms === settings.frequencyMs) || FREQUENCY_OPTIONS[1];

  const handleStart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startSession();
  };

  const handleStop = () => {
    stopSession();
  };

  const handleStrictToggle = () => {
    if (!isPremiumUser) {
      router.push("/(main)/subscribe");
      return;
    }
    updateSettings({ strictMode: !settings.strictMode });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Check out Quick Math — keeps your brain sharp during phone breaks! 🧠",
        title: "Quick Math",
      });
    } catch {}
  };

  const gridActions = [
    { icon: "share-social-outline" as const, label: strings.share, onPress: handleShare },
    {
      icon: "mail-outline" as const,
      label: strings.contactUs,
      onPress: () => Linking.openURL("mailto:nophonekidz@gmail.com?subject=Quick Math Contact"),
    },
    {
      icon: "chatbubble-outline" as const,
      label: strings.feedback,
      onPress: () => Linking.openURL("mailto:nophonekidz@gmail.com?subject=Quick Math Feedback"),
    },
    {
      icon: "information-circle-outline" as const,
      label: strings.aboutUs,
      onPress: () => router.push("/(main)/about"),
    },
  ];

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <AnimatedSection delay={0}>
          <View style={styles.topBar}>
            <View style={styles.titleRow}>
              <View style={styles.qmBadge}>
                <Text style={styles.qmText}>QM</Text>
              </View>
              <Text style={styles.title}>{strings.quickMath}</Text>
              <PulsingDot active={session.active} />
            </View>
            <Pressable
              onPress={() => router.push("/(main)/settings")}
              style={styles.gearBtn}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.ink} />
            </Pressable>
          </View>
        </AnimatedSection>

        {settings.overlayPermissionDeclined && (
          <AnimatedSection delay={60}>
            <AppCard style={styles.warningCard}>
              <View style={styles.warningRow}>
                <Ionicons name="warning-outline" size={18} color={Colors.gold} />
                <Text style={styles.warningText}>{strings.overlayWarning}</Text>
              </View>
            </AppCard>
          </AnimatedSection>
        )}

        <AnimatedSection delay={60}>
          <View style={styles.settingRows}>
            <TappableSettingRow
              label={strings.sessionDuration}
              value={currentDuration.label}
              onPress={() => setPickerMode("duration")}
            />
            <TappableSettingRow
              label={strings.oneCardEvery}
              value={currentFrequency.label}
              onPress={() => setPickerMode("frequency")}
            />
          </View>
        </AnimatedSection>

        <AnimatedSection delay={120}>
          <AppCard>
            <View style={styles.strictRow}>
              <View style={styles.strictLeft}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.ink} />
                <Text style={styles.strictLabel}>{strings.strictMode}</Text>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>{strings.premium}</Text>
                </View>
              </View>
              <Pressable
                onPress={handleStrictToggle}
                style={[
                  styles.toggleTrack,
                  settings.strictMode && styles.toggleTrackOn,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    settings.strictMode && styles.toggleThumbOn,
                  ]}
                />
              </Pressable>
            </View>
          </AppCard>
        </AnimatedSection>

        <AnimatedSection delay={180}>
          <SlideToStartButton
            active={session.active}
            onStart={handleStart}
            onStop={handleStop}
            startLabel={strings.startSession}
            stopLabel={strings.stopSession}
          />
        </AnimatedSection>

        <AnimatedSection delay={240}>
          <View style={styles.grid}>
            {gridActions.map((action, i) => (
              <AppCard
                key={i}
                onPress={action.onPress}
                style={styles.gridItem}
              >
                <Ionicons name={action.icon} size={26} color={Colors.accent} />
                <Text style={styles.gridLabel}>{action.label}</Text>
              </AppCard>
            ))}
          </View>
        </AnimatedSection>
      </ScrollView>

      <Modal
        visible={pickerMode !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerMode(null)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setPickerMode(null)}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerTitle}>
              {pickerMode === "duration" ? strings.sessionDuration : strings.oneCardEvery}
            </Text>
            <FlatList
              data={pickerMode === "duration" ? DURATION_OPTIONS : FREQUENCY_OPTIONS}
              keyExtractor={(item) => item.ms.toString()}
              renderItem={({ item }) => {
                const selected =
                  pickerMode === "duration"
                    ? item.ms === settings.durationMs
                    : item.ms === settings.frequencyMs;
                return (
                  <Pressable
                    style={[styles.pickerItem, selected && styles.pickerItemSelected]}
                    onPress={() => {
                      if (pickerMode === "duration") {
                        updateSettings({ durationMs: item.ms });
                      } else {
                        updateSettings({ frequencyMs: item.ms });
                      }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPickerMode(null);
                    }}
                  >
                    <Text style={[styles.pickerItemText, selected && styles.pickerItemTextSelected]}>
                      {item.label}
                    </Text>
                    {selected && (
                      <Ionicons name="checkmark" size={20} color={Colors.accent} />
                    )}
                  </Pressable>
                );
              }}
              scrollEnabled={false}
            />
          </View>
        </Pressable>
      </Modal>

      <QuizCard
        visible={cardVisible}
        card={currentCard}
        strings={strings}
        onAnswer={handleAnswer}
        onDismiss={dismissCard}
        answerIndex={answerIndex}
        timerComplete={timerComplete}
        onTimerComplete={markTimerComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, gap: 16 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  qmBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  qmText: {
    color: "#fff",
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 14,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 22,
    color: Colors.accent,
  },
  gearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  warningCard: { backgroundColor: "#FFFBEB", borderColor: Colors.gold },
  warningRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  warningText: { flex: 1, fontFamily: "Nunito_600SemiBold", fontSize: 13, color: "#92400E", lineHeight: 19 },
  settingRows: { gap: 10 },
  strictRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  strictLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  strictLabel: { fontFamily: "Nunito_700Bold", fontSize: 15, color: Colors.ink },
  premiumBadge: {
    backgroundColor: Colors.accentLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  premiumText: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 11, color: Colors.accent },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    padding: 3,
    justifyContent: "center",
  },
  toggleTrackOn: { backgroundColor: Colors.accent },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbOn: { alignSelf: "flex-end" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "47%",
    aspectRatio: 1.4,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
  },
  gridLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: Colors.ink,
    textAlign: "center",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 8,
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 8,
  },
  pickerTitle: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 17,
    color: Colors.ink,
    marginBottom: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  pickerItemSelected: { backgroundColor: Colors.accentLight },
  pickerItemText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    color: Colors.ink,
  },
  pickerItemTextSelected: { color: Colors.accent, fontFamily: "Nunito_700Bold" },
});
