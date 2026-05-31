import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import colors from "@/constants/colors";

// Point the generated API client at the shared backend (same server as the web app).
setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const stackHeader = {
    headerShown: true,
    headerStyle: { backgroundColor: palette.background },
    headerTintColor: palette.primary,
    headerTitleStyle: {
      fontFamily: "SpaceGrotesk_700Bold",
      color: palette.foreground,
    },
    headerShadowVisible: false,
  } as const;
  return (
    <Stack screenOptions={{ headerBackTitle: "Indietro", ...stackHeader }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="domande" options={{ title: "Cosa vuoi scoprire?" }} />
      <Stack.Screen name="theme/[id]" options={{ title: "Tema" }} />
      <Stack.Screen name="albo" options={{ title: "Albo Pretorio" }} />
      <Stack.Screen name="delibere" options={{ title: "Delibere" }} />
      <Stack.Screen name="contratti/index" options={{ title: "Appalti" }} />
      <Stack.Screen name="contratti/[id]" options={{ title: "Contratto" }} />
      <Stack.Screen name="pnrr" options={{ title: "PNRR" }} />
      <Stack.Screen name="convocazioni/index" options={{ title: "Convocazioni" }} />
      <Stack.Screen name="convocazioni/[id]" options={{ title: "Seduta" }} />
      <Stack.Screen name="organi/index" options={{ title: "Organi" }} />
      <Stack.Screen name="organi/[slug]" options={{ title: "Organo" }} />
      <Stack.Screen name="amministratori/index" options={{ title: "Amministratori" }} />
      <Stack.Screen name="amministratori/[id]" options={{ title: "Profilo" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    const palette = scheme === "dark" ? colors.dark : colors.light;
    SystemUI.setBackgroundColorAsync(palette.background);
  }, [scheme]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
