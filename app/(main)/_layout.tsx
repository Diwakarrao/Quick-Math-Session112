import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 280,
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="subscribe" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
