import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { AppCard } from "@/components/AppCard";
import { OutlineButton } from "@/components/OutlineButton";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { strings } = useApp();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const version = Constants.expoConfig?.version || "1.0.0";

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topInset + 16, paddingBottom: bottomInset + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </Pressable>
        <Text style={styles.screenTitle}>{strings.aboutUs}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.hero}>
        <View style={styles.logoBg}>
          <View style={styles.qmBig}>
            <Text style={styles.qmBigText}>QM</Text>
          </View>
        </View>
        <Text style={styles.appName}>{strings.quickMath}</Text>
        <Text style={styles.version}>
          {strings.version} {version}
        </Text>
      </View>

      <AppCard>
        <Text style={styles.descText}>{strings.aboutDesc}</Text>
      </AppCard>

      <View style={styles.badges}>
        <View style={styles.badge}>
          <Ionicons name="cloud-offline-outline" size={20} color={Colors.accent} />
          <Text style={styles.badgeText}>{strings.offlineApp}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="people-outline" size={20} color={Colors.accent} />
          <Text style={styles.badgeText}>{strings.minAge}</Text>
        </View>
      </View>

      <AppCard style={{ gap: 14 }}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>15s</Text>
            <Text style={styles.statLabel}>Per card</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLabel}>Difficulty levels</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>4</Text>
            <Text style={styles.statLabel}>Operations</Text>
          </View>
        </View>
      </AppCard>

      <AppCard style={{ gap: 10 }}>
        <Text style={styles.sectionTitle}>Operations</Text>
        <View style={styles.opsGrid}>
          {[
            { op: "+", label: "Addition" },
            { op: "−", label: "Subtraction" },
            { op: "×", label: "Multiplication" },
            { op: "÷", label: "Division" },
          ].map((item) => (
            <View key={item.op} style={styles.opItem}>
              <View style={styles.opBadge}>
                <Text style={styles.opSymbol}>{item.op}</Text>
              </View>
              <Text style={styles.opLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <OutlineButton
        label={strings.contactBtn}
        onPress={() =>
          Linking.openURL("mailto:nophonekidz@gmail.com?subject=Quick Math Contact")
        }
        style={{ width: "100%" }}
      />

      <Text style={styles.footer}>Made with care for sharp minds</Text>
    </ScrollView>
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
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  screenTitle: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 18, color: Colors.ink },
  hero: { alignItems: "center", paddingVertical: 16, gap: 12 },
  logoBg: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  qmBig: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  qmBigText: { color: "#fff", fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 22 },
  appName: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 26,
    color: Colors.ink,
  },
  version: { fontFamily: "Nunito_400Regular", fontSize: 14, color: Colors.secondary },
  descText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: Colors.ink,
    lineHeight: 23,
  },
  badges: { flexDirection: "row", gap: 10 },
  badge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  badgeText: { fontFamily: "Nunito_600SemiBold", fontSize: 12, color: Colors.accent, flex: 1 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  stat: { alignItems: "center", gap: 4 },
  statNum: { fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 24, color: Colors.accent },
  statLabel: { fontFamily: "Nunito_400Regular", fontSize: 12, color: Colors.secondary },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  sectionTitle: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    color: Colors.secondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  opsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  opItem: { width: "47%", flexDirection: "row", alignItems: "center", gap: 10 },
  opBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  opSymbol: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 20, color: Colors.accent },
  opLabel: { fontFamily: "Nunito_600SemiBold", fontSize: 13, color: Colors.ink },
  footer: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.secondary,
    textAlign: "center",
    paddingVertical: 8,
  },
});
