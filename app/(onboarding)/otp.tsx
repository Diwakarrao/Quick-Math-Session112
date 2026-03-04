import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  Alert,
  Keyboard,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { PrimaryButton } from "@/components/PrimaryButton";
import { OutlineButton } from "@/components/OutlineButton";
import { useApp } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const { strings, updateSettings } = useApp();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [verified, setVerified] = useState(false);

  const refs = useRef<(TextInput | null)[]>([]);
  const resendRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  const startResendTimer = () => {
    setResendSeconds(30);
    resendRef.current = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          if (resendRef.current) clearInterval(resendRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setOtpSent(true);
    startResendTimer();
  };

  const handleOtpChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6) {
      Keyboard.dismiss();
      handleVerify(newOtp);
    }
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === "Backspace" && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (otpArr: string[]) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setVerified(true);
    successScale.value = withSpring(1, { damping: 14, stiffness: 250 });
    successOpacity.value = withTiming(1, { duration: 300 });
    await updateSettings({ userVerified: true });
    setTimeout(() => {
      router.push("/(onboarding)/privacy");
    }, 1200);
  };

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topInset + 16, paddingBottom: bottomInset + 24 },
      ]}
    >
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={Colors.ink} />
      </Pressable>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>Verify your{"\n"}number</Text>
        <Text style={styles.subtitle}>
          {otpSent
            ? `OTP sent to +91 ${phone}`
            : "Enter your +91 mobile number"}
        </Text>
      </View>

      {!otpSent ? (
        <View style={styles.phoneWrap}>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryText}>+91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="98765 43210"
              placeholderTextColor={Colors.secondary}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              autoFocus
            />
          </View>
          <PrimaryButton
            label={strings.sendOtp}
            onPress={handleSendOtp}
            disabled={phone.length < 10}
            loading={loading}
            style={{ width: "100%" }}
          />
        </View>
      ) : verified ? (
        <Animated.View style={[styles.successWrap, successStyle]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          </View>
          <Text style={styles.successText}>{strings.verified}</Text>
        </Animated.View>
      ) : (
        <View style={styles.otpSection}>
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => (refs.current[idx] = r)}
                style={[styles.otpBox, digit && styles.otpBoxFilled]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, idx)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
                autoFocus={idx === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          <PrimaryButton
            label="Verify"
            onPress={() => handleVerify(otp)}
            disabled={otp.join("").length < 6}
            loading={loading}
            style={{ width: "100%" }}
          />

          <View style={styles.resendRow}>
            {resendSeconds > 0 ? (
              <Text style={styles.resendTimer}>
                {strings.resendIn} {resendSeconds}s
              </Text>
            ) : (
              <Pressable onPress={handleSendOtp}>
                <Text style={styles.resendLink}>{strings.resendOtp}</Text>
              </Pressable>
            )}
          </View>

          <OutlineButton
            label={strings.whatsappFallback}
            onPress={() => Alert.alert("WhatsApp OTP", "WhatsApp fallback requires Firebase Cloud Functions setup.")}
            style={{ width: "100%" }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    gap: 32,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -6,
  },
  titleWrap: { gap: 8 },
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
  },
  phoneWrap: { gap: 16 },
  phoneRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  countryCode: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  countryText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 16,
    color: Colors.ink,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    color: Colors.ink,
  },
  otpSection: { gap: 20 },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    textAlign: "center",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 22,
    color: Colors.ink,
  },
  otpBoxFilled: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  resendRow: {
    alignItems: "center",
  },
  resendTimer: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.secondary,
  },
  resendLink: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: Colors.accent,
    textDecorationLine: "underline",
  },
  successWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 22,
    color: Colors.success,
  },
});
