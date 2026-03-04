import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Linking,
  Alert,
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
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

type Plan = "daily" | "monthly" | "yearly";

const PLANS: { key: Plan; price: string; period: string; priceLabel: string; best?: boolean }[] = [
  { key: "daily", price: "₹3/day", period: "Billed ₹21/week", priceLabel: "₹3" },
  { key: "monthly", price: "₹73/mo", period: "Billed monthly", priceLabel: "₹73" },
  { key: "yearly", price: "₹703/yr", period: "Billed annually", priceLabel: "₹703", best: true },
];

const UPI_ID = "quickmath@upi";

function PlanCard({
  plan,
  selected,
  onSelect,
  dailyLabel,
  monthlyLabel,
  yearlyLabel,
  bestLabel,
}: {
  plan: (typeof PLANS)[0];
  selected: boolean;
  onSelect: () => void;
  dailyLabel: string;
  monthlyLabel: string;
  yearlyLabel: string;
  bestLabel: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const label =
    plan.key === "daily" ? dailyLabel : plan.key === "monthly" ? monthlyLabel : yearlyLabel;

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      onPress={onSelect}
    >
      <Animated.View
        style={[
          styles.planCard,
          selected && styles.planCardSelected,
          plan.best && styles.planCardBest,
          animStyle,
        ]}
      >
        {plan.best && (
          <View style={styles.bestBadge}>
            <Ionicons name="star" size={11} color={Colors.gold} />
            <Text style={styles.bestText}>{bestLabel}</Text>
          </View>
        )}
        <View style={styles.planRow}>
          <View>
            <Text style={[styles.planName, selected && styles.planNameSelected, plan.best && styles.planNameBest]}>
              {label}
            </Text>
            <Text style={[styles.planPeriod, selected && styles.planPeriodSelected]}>
              {plan.period}
            </Text>
          </View>
          <Text style={[styles.planPrice, selected && styles.planPriceSelected, plan.best && styles.planPriceBest]}>
            {plan.price}
          </Text>
        </View>
        <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const BENEFITS = [
  { icon: "lock-open-outline" as const, textKey: "benefitStrict" },
  { icon: "ban-outline" as const, textKey: "benefitNoAds" },
  { icon: "trophy-outline" as const, textKey: "benefitLeaderboard" },
  { icon: "headset-outline" as const, textKey: "benefitSupport" },
] as const;

export default function SubscribeScreen() {
  const insets = useSafeAreaInsets();
  const { strings, updateSettings } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("yearly");
  const [loading, setLoading] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const benefitTexts: Record<string, string> = {
    benefitStrict: strings.benefitStrict,
    benefitNoAds: strings.benefitNoAds,
    benefitLeaderboard: strings.benefitLeaderboard,
    benefitSupport: strings.benefitSupport,
  };

  const handleJoin = async () => {
    const plan = PLANS.find((p) => p.key === selectedPlan)!;
    setLoading(true);
    try {
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=QuickMath&am=${plan.priceLabel.replace("₹","")}&cu=INR&tn=QuickMath+${plan.key}+plan`;
      const canOpen = await Linking.canOpenURL(upiUrl);
      if (canOpen) {
        await Linking.openURL(upiUrl);
        await updateSettings({ premiumToken: `qm_${Date.now()}`, strictMode: true });
        Alert.alert("Payment", "If payment was successful, premium is now active!");
      } else {
        Alert.alert(
          "UPI not available",
          "Please install GPay, PhonePe or any UPI app, or contact support at nophonekidz@gmail.com"
        );
      }
    } catch {
      Alert.alert("Error", "Payment failed. Contact support: nophonekidz@gmail.com");
    }
    setLoading(false);
  };

  const handleRestore = () => {
    Alert.alert("Restore Purchase", "Please contact support at nophonekidz@gmail.com with your payment receipt.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.accent }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.crownWrap}>
            <Ionicons name="star" size={32} color={Colors.gold} />
          </View>
          <Text style={styles.title}>{strings.choosePlan}</Text>
          <Text style={styles.subtitle}>{strings.trialNote}</Text>
        </View>

        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.textKey} style={styles.benefitRow}>
              <Ionicons name={b.icon} size={18} color={Colors.gold} />
              <Text style={styles.benefitText}>{benefitTexts[b.textKey]}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              selected={selectedPlan === plan.key}
              onSelect={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPlan(plan.key);
              }}
              dailyLabel={strings.daily}
              monthlyLabel={strings.monthly}
              yearlyLabel={strings.yearly}
              bestLabel={strings.bestValue}
            />
          ))}
        </View>

        <PrimaryButton
          label={strings.joinPremium}
          onPress={handleJoin}
          loading={loading}
          style={{ width: "100%", backgroundColor: Colors.gold }}
        />

        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>{strings.restorePurchase}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  header: { alignItems: "center", gap: 10 },
  crownWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 28,
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  benefits: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitText: { fontFamily: "Nunito_600SemiBold", fontSize: 15, color: "#fff" },
  plans: { gap: 12 },
  planCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 16,
    gap: 8,
    position: "relative",
  },
  planCardSelected: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderColor: "#fff",
  },
  planCardBest: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: Colors.gold,
  },
  bestBadge: {
    position: "absolute",
    top: -1,
    right: 16,
    backgroundColor: Colors.gold,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bestText: { fontFamily: "PlusJakartaSans_700Bold", fontSize: 11, color: Colors.ink },
  planRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planName: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 17,
    color: "rgba(255,255,255,0.85)",
  },
  planNameSelected: { color: "#fff" },
  planNameBest: { color: "#fff" },
  planPeriod: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  planPeriodSelected: { color: "rgba(255,255,255,0.8)" },
  planPrice: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 20,
    color: "rgba(255,255,255,0.85)",
  },
  planPriceSelected: { color: "#fff" },
  planPriceBest: { color: Colors.gold },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: { borderColor: "#fff" },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: "#fff" },
  restoreBtn: { alignItems: "center", paddingVertical: 8 },
  restoreText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    textDecorationLine: "underline",
  },
});
