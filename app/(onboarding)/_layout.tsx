import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 280,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="language" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="permission" />
    </Stack>
  );
}
