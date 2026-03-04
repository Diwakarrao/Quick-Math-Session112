import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from "react-native-reanimated";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { AppCard } from "@/components/AppCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/context/AppContext";
import type { AppSettings } from "@/lib/storage";
import type { Language } from "@/constants/strings";
import { Ionicons } from "@expo/vector-icons";

type PickerMode = "language" | "cardsBeforePopup" | null;

const LANGUAGES: { key: Language; label: string }[] = [
  { key: "en", label: "English" },
  { key: "te", label: "తెలుగు" },
  { key: "hi", label: "हिंदी" },
];

const POPUP_COUNTS = [2, 3, 5];

function ToggleRow({
  label,
  value,
  onChange,
  premiumGated,
  isPremium,
  onGatedTap,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  premiumGated?: boolean;
  isPremium?: boolean;
  onGatedTap?: () => void;
}) {
  const handlePress = () => {
    if (premiumGated && !isPremium) {
      onGatedTap?.();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(!value);
  };

  return (
    <Pressable onPress={handlePress} style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggleTrack, value && styles.toggleTrackOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </Pressable>
  );
}

function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.radioRow}>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, strings, isPremiumUser } = useApp();
  const [draft, setDraft] = useState({ ...settings });
  const [hasChanges, setHasChanges] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const snackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const snackOpacity = useSharedValue(0);
  const snackStyle = useAnimatedStyle(() => ({
    opacity: snackOpacity.value,
    transform: [{ translateY: snackOpacity.value === 1 ? 0 : 20 }],
  }));

  const patch = (key: keyof AppSettings, val: any) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: val };
      const changed = JSON.stringify(next) !== JSON.stringify(settings);
      setHasChanges(changed);
      return next;
    });
  };

  const handleSave = async () => {
    await updateSettings({ ...draft });
    setHasChanges(false);
    showSnack();
  };

  const showSnack = () => {
    setSnackVisible(true);
    snackOpacity.value = withTiming(1, { duration: 200 });
    if (snackTimer.current) clearTimeout(snackTimer.current);
    snackTimer.current = setTimeout(() => {
      snackOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setSnackVisible(false), 300);
    }, 2000);
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(strings.unsavedChanges, strings.unsavedWarning, [
        { text: strings.discard, style: "destructive", onPress: () => router.back() },
        { text: strings.keepEditing, style: "cancel" },
      ]);
    } else {
      router.back();
    }
  };

  const currentLang = LANGUAGES.find((l) => l.key === draft.language)?.label || "English";

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.ink} />
          </Pressable>
          <Text style={styles.screenTitle}>{strings.settings}</Text>
          <Pressable
            onPress={handleSave}
            style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
            disabled={!hasChanges}
          >
            <Text style={[styles.saveBtnText, !hasChanges && { color: Colors.border }]}>
              {strings.save}
            </Text>
          </Pressable>
        </View>

        <AppCard style={{ gap: 4 }}>
          <Text style={styles.sectionTitle}>{strings.displayMode}</Text>
          <RadioRow
            label={strings.halfScreen}
            selected={!draft.cardSizeFull}
            onPress={() => patch("cardSizeFull", false)}
          />
          <RadioRow
            label={strings.fullScreen}
            selected={draft.cardSizeFull}
            onPress={() => patch("cardSizeFull", true)}
          />
        </AppCard>

        <AppCard style={{ gap: 4 }}>
          <Text style={styles.sectionTitle}>Session</Text>
          <ToggleRow
            label={strings.strictMode}
            value={draft.strictMode}
            onChange={(v) => patch("strictMode", v)}
            premiumGated
            isPremium={isPremiumUser}
            onGatedTap={() => router.push("/(main)/subscribe")}
          />
          <View style={styles.divider} />
          <ToggleRow
            label={strings.audioCue}
            value={draft.audioCue}
            onChange={(v) => patch("audioCue", v)}
          />
          <View style={styles.divider} />
          <ToggleRow
            label={strings.vibration}
            value={draft.vibration}
            onChange={(v) => patch("vibration", v)}
          />
        </AppCard>

        <AppCard style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Fun Pop-Ups</Text>
          <ToggleRow
            label={strings.funPopUps}
            value={draft.funPopups}
            onChange={(v) => patch("funPopups", v)}
          />
          {draft.funPopups && (
            <Animated.View entering={FadeIn.duration(250)} style={{ gap: 8 }}>
              <View style={styles.divider} />
              <Text style={styles.subLabel}>{strings.problemsBeforePopup}</Text>
              <View style={styles.chipRow}>
                {POPUP_COUNTS.map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => {
                      patch("cardsBeforePopup", n);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.chip, draft.cardsBeforePopup === n && styles.chipSelected]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        draft.cardsBeforePopup === n && styles.chipTextSelected,
                      ]}
                    >
                      {n}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}
        </AppCard>

        <AppCard style={{ gap: 4 }}>
          <Text style={styles.sectionTitle}>{strings.language}</Text>
          <Pressable
            onPress={() => setPickerMode("language")}
            style={styles.langPickRow}
          >
            <Text style={styles.langPickLabel}>{strings.language}</Text>
            <View style={styles.langPickRight}>
              <Text style={styles.langPickValue}>{currentLang}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
            </View>
          </Pressable>
        </AppCard>
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
            <Text style={styles.pickerTitle}>{strings.language}</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.key}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.pickerItem, draft.language === item.key && styles.pickerItemSelected]}
                  onPress={() => {
                    patch("language", item.key);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPickerMode(null);
                  }}
                >
                  <Text style={[styles.pickerItemText, draft.language === item.key && styles.pickerItemTextSelected]}>
                    {item.label}
                  </Text>
                  {draft.language === item.key && (
                    <Ionicons name="checkmark" size={20} color={Colors.accent} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {snackVisible && (
        <Animated.View
          style={[
            styles.snack,
            { bottom: bottomInset + 24 },
            snackStyle,
          ]}
          pointerEvents="none"
        >
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.snackText}>Settings saved!</Text>
        </Animated.View>
      )}
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
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  screenTitle: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: Colors.ink },
  saveBtn: {
    backgroundColor: Colors.accentLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  saveBtnDisabled: { backgroundColor: Colors.surface },
  saveBtnText: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: Colors.accent },
  sectionTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    color: Colors.secondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  toggleLabel: { fontFamily: "Nunito_600SemiBold", fontSize: 15, color: Colors.ink },
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
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 2 },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: Colors.accent },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: Colors.accent },
  radioLabel: { fontFamily: "Nunito_600SemiBold", fontSize: 15, color: Colors.ink },
  radioLabelSelected: { color: Colors.accent, fontFamily: "Nunito_700Bold" },
  subLabel: { fontFamily: "Nunito_600SemiBold", fontSize: 14, color: Colors.secondary },
  chipRow: { flexDirection: "row", gap: 10 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipSelected: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  chipText: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 15, color: Colors.secondary },
  chipTextSelected: { color: Colors.accent },
  langPickRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  langPickLabel: { fontFamily: "Nunito_600SemiBold", fontSize: 15, color: Colors.ink },
  langPickRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  langPickValue: { fontFamily: "Nunito_700Bold", fontSize: 15, color: Colors.accent, textDecorationLine: "underline" },
  pickerOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: "flex-end" },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 8,
  },
  pickerHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: "center", marginBottom: 8 },
  pickerTitle: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 17, color: Colors.ink, marginBottom: 8 },
  pickerItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 },
  pickerItemSelected: { backgroundColor: Colors.accentLight },
  pickerItemText: { fontFamily: "Nunito_600SemiBold", fontSize: 16, color: Colors.ink },
  pickerItemTextSelected: { color: Colors.accent, fontFamily: "Nunito_700Bold" },
  snack: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: Colors.success,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  snackText: { fontFamily: "Nunito_700Bold", fontSize: 14, color: "#fff" },
});
