import { Redirect } from "expo-router";
import { useApp } from "@/context/AppContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { mustVerifyOtp } from "@/lib/storage";

export default function Index() {
  const { settings, loaded } = useApp();

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!settings.onboardingDone) {
    return <Redirect href="/(onboarding)/language" />;
  }

  // Check if OTP verification is now mandatory
  if (mustVerifyOtp(settings)) {
    return <Redirect href="/(onboarding)/otp" />;
  }

  return <Redirect href="/(main)/home" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
