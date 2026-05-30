import { Feather } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card, ScreenHeader } from "@/components/ui";
import { useColors } from "@/hooks/useColors";

type Section = {
  href: Href;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
};

const SECTIONS: Section[] = [
  {
    href: "/albo",
    title: "Albo Pretorio",
    subtitle: "Atti e avvisi pubblicati dal Comune",
    icon: "clipboard",
  },
  {
    href: "/delibere",
    title: "Delibere",
    subtitle: "Deliberazioni di Giunta e Consiglio",
    icon: "file-text",
  },
  {
    href: "/convocazioni",
    title: "Convocazioni",
    subtitle: "Sedute del Consiglio e delle Commissioni",
    icon: "calendar",
  },
  {
    href: "/contratti",
    title: "Appalti",
    subtitle: "Contratti e affidamenti pubblici",
    icon: "briefcase",
  },
  {
    href: "/pnrr",
    title: "PNRR",
    subtitle: "Progetti finanziati dal Recovery Plan",
    icon: "trending-up",
  },
  {
    href: "/amministratori",
    title: "Amministratori",
    subtitle: "Chi governa la città e come vota",
    icon: "users",
  },
];

export default function MonitorScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        eyebrow="Sorveglianza civica"
        title="Atti & Organi"
        subtitle="Tutti i documenti della cosa pubblica"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((s) => (
          <Pressable
            key={s.title}
            onPress={() => router.push(s.href)}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <Card style={styles.row}>
              <View style={[styles.icon, { backgroundColor: colors.accent }]}>
                <Feather name={s.icon} size={20} color={colors.accentForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {s.title}
                </Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  {s.subtitle}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: Platform.OS === "web" ? 110 : 40,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16.5, letterSpacing: -0.2 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2, lineHeight: 18 },
});
