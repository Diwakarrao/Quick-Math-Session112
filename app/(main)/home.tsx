import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
  Linking,
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
import { QuizCard } from "@/components/QuizCard";
import { FunPopup } from "@/components/FunPopup";
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
          withTiming(1.5, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [active]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: active ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.dot, style]} />
  );
}

function LogoBadge({
  active,
  onDoubleTap,
  inFreeTrial,
  trialDaysLeft,
}: {
  active: boolean;
  onDoubleTap: () => void;
  inFreeTrial: boolean;
  trialDaysLeft: number;
}) {
  const lastTapRef = useRef<number>(0);
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    lastTapRef.current = now;

    if (timeDiff < 320) {
      // Double tap!
      scale.value = withSequence(
        withSpring(0.85, { damping: 10, stiffness: 400 }),
        withSpring(1.08, { damping: 10, stiffness: 300 }),
        withSpring(1, { damping: 12, stiffness: 250 })
      );
      Haptics.notificationAsync(
        active
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success
      );
      onDoubleTap();
    } else {
      scale.value = withSequence(
        withSpring(0.92, { damping: 12, stiffness: 400 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [active, onDoubleTap]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress} style={styles.logoPressable}>
      <Animated.View style={[styles.qmBadge, active && styles.qmBadgeActive, animStyle]}>
        <Text style={styles.qmText}>QM</Text>
        {active && <View style={styles.activePulseRing} />}
      </Animated.View>
      {inFreeTrial && trialDaysLeft > 0 && (
        <View style={styles.trialBubble}>
          <Text style={styles.trialBubbleText}>{trialDaysLeft}d</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    settings, updateSettings, strings, isPremiumUser, hasAnyPremium, inFreeTrial, trialDaysLeft,
    session, startSession, stopSession,
    currentCard, cardVisible, answerIndex, timerComplete,
    markTimerComplete, handleAnswer, dismissCard,
    funPopupVisible, funPopupType, dismissFunPopup,
  } = useApp();

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const currentDuration = DURATION_OPTIONS.find((d) => d.ms === settings.durationMs) || DURATION_OPTIONS[3];
  const currentFrequency = FREQUENCY_OPTIONS.find((f) => f.ms === settings.frequencyMs) || FREQUENCY_OPTIONS[1];

  const handleDoubleTap = useCallback(() => {
    if (session.active) {
      stopSession();
    } else {
      startSession();
    }
  }, [session.active, startSession, stopSession]);

  const handleStrictToggle = () => {
    if (!hasAnyPremium) {
      router.push("/(main)/subscribe");
      return;
    }
    updateSettings({ strictMode: !settings.strictMode });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Check out Quick Math — keeps your brain sharp! Double-tap the QM logo to start.",
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
              <LogoBadge
                active={session.active}
                onDoubleTap={handleDoubleTap}
                inFreeTrial={inFreeTrial}
                trialDaysLeft={trialDaysLeft}
              />
              <View style={styles.titleTextWrap}>
                <Text style={styles.title}>{strings.quickMath}</Text>
                <Text style={styles.tapHint}>
                  {session.active ? "Active — double-tap to stop" : "Double-tap to start"}
                </Text>
              </View>
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

        {inFreeTrial && (
          <AnimatedSection delay={30}>
            <AppCard style={styles.trialCard}>
              <View style={styles.trialRow}>
                <Ionicons name="gift-outline" size={18} color={Colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.trialTitle}>
                    Free Trial Active — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left
                  </Text>
                  <Text style={styles.trialSubtext}>
                    All premium features unlocked. Verify your number to keep access after trial.
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push("/(main)/subscribe")}
                  style={styles.trialBtn}
                >
                  <Text style={styles.trialBtnText}>Upgrade</Text>
                </Pressable>
              </View>
            </AppCard>
          </AnimatedSection>
        )}

        {settings.overlayPermissionDeclined && (
          <AnimatedSection delay={40}>
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
                {!hasAnyPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>{strings.premium}</Text>
                  </View>
                )}
              </View>
              <Pressable
                onPress={handleStrictToggle}
                style={[
                  styles.toggleTrack,
                  settings.strictMode && styles.toggleTrackOn,
                ]}
              >
                <View style={[styles.toggleThumb, settings.strictMode && styles.toggleThumbOn]} />
              </Pressable>
            </View>
          </AppCard>
        </AnimatedSection>

        <AnimatedSection delay={160}>
          <AppCard style={session.active ? { ...styles.sessionCard, ...styles.sessionCardActive } : styles.sessionCard}>
            <View style={styles.sessionInfo}>
              <View style={styles.sessionIconWrap}>
                <Ionicons
                  name={session.active ? "radio-button-on" : "play-circle-outline"}
                  size={28}
                  color={session.active ? Colors.success : Colors.accent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionTitle}>
                  {session.active ? "Session Running" : "Start Session"}
                </Text>
                <Text style={styles.sessionSubtitle}>
                  {session.active
                    ? `${session.cardsShown} card${session.cardsShown !== 1 ? "s" : ""} shown`
                    : "Double-tap the QM logo above"}
                </Text>
              </View>
              {session.active && (
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); stopSession(); }}
                  style={styles.stopBtn}
                >
                  <Ionicons name="stop" size={16} color="#fff" />
                  <Text style={styles.stopBtnText}>Stop</Text>
                </Pressable>
              )}
            </View>
          </AppCard>
        </AnimatedSection>

        <AnimatedSection delay={220}>
          <View style={styles.grid}>
            {gridActions.map((action, i) => (
              <AppCard key={i} onPress={action.onPress} style={styles.gridItem}>
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
              scrollEnabled={false}
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
                    {selected && <Ionicons name="checkmark" size={20} color={Colors.accent} />}
                  </Pressable>
                );
              }}
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
        totalMs={settings.cardDurationMs}
      />

      <FunPopup
        visible={funPopupVisible}
        type={funPopupType}
        onDismiss={dismissFunPopup}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, gap: 14 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  logoPressable: { position: "relative" },
  qmBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    overflow: "visible",
  },
  qmBadgeActive: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
  },
  activePulseRing: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.success,
    opacity: 0.4,
  },
  qmText: {
    color: "#fff",
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 15,
  },
  trialBubble: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: Colors.gold,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  trialBubbleText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 10,
    color: Colors.ink,
  },
  titleTextWrap: { flex: 1, gap: 2 },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 18,
    color: Colors.ink,
  },
  tapHint: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
    color: Colors.secondary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
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
  trialCard: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
    padding: 14,
  },
  trialRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trialTitle: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 13, color: Colors.accent, marginBottom: 2 },
  trialSubtext: { fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.secondary, lineHeight: 17 },
  trialBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  trialBtnText: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "#fff" },
  warningCard: { backgroundColor: "#FFFBEB", borderColor: Colors.gold, padding: 12 },
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
  sessionCard: {
    padding: 16,
  },
  sessionCardActive: {
    backgroundColor: "#F0FDF4",
    borderColor: Colors.success,
  },
  sessionInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  sessionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionTitle: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 15, color: Colors.ink },
  sessionSubtitle: { fontFamily: "Nunito_400Regular", fontSize: 13, color: Colors.secondary, marginTop: 2 },
  stopBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stopBtnText: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: "#fff" },
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
    backgroundColor: "rgba(13,13,20,0.55)",
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
