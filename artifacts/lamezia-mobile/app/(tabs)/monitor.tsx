import { Feather } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HelperMenuButton } from "@/components/HelperMenu";
import { ScreenHeader } from "@/components/ui";
import { useColors } from "@/hooks/useColors";

type Section = {
  href: Href;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
};

type Category = {
  label: string;
  sections: Section[];
};

const CATEGORIES: Category[] = [
  {
    label: "Istituzioni",
    sections: [
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
        href: "/organi",
        title: "Organi",
        subtitle: "Consiglio, Giunta e Commissioni Consiliari",
        icon: "home",
      },
      {
        href: "/amministratori",
        title: "Amministratori",
        subtitle: "Chi governa la città e come vota",
        icon: "users",
      },
    ],
  },
  {
    label: "Atti e controllo",
    sections: [
      {
        href: "/albo",
        title: "Albo Pretorio",
        subtitle: "Atti e avvisi pubblicati dal Comune",
        icon: "clipboard",
      },
      {
        href: "/pareri",
        title: "Pareri di Vigilanza",
        subtitle: "Controlli di Revisori, OIV, Corte dei Conti e ANAC",
        icon: "shield",
      },
      {
        href: "/legality",
        title: "Legalità e Trasparenza",
        subtitle: "Monitoraggio su trasparenza e legalità",
        icon: "eye",
      },
    ],
  },
  {
    label: "Appalti e risorse",
    sections: [
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
    ],
  },
  {
    label: "Dati e performance",
    sections: [
      {
        href: "/performance",
        title: "Performance del Comune",
        subtitle: "Indicatori e qualità della vita nel tempo",
        icon: "bar-chart-2",
      },
      {
        href: "/opendata",
        title: "Opendata",
        subtitle: "Catalogo dei dataset aperti del Comune",
        icon: "database",
      },
    ],
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
        right={<HelperMenuButton />}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => (
          <View key={cat.label} style={styles.category}>
            <Text style={[styles.categoryLabel, { color: colors.mutedForeground }]}>
              {cat.label.toUpperCase()}
            </Text>
            <View
              style={[
                styles.groupCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  borderRadius: colors.radius + 4,
                },
              ]}
            >
              {cat.sections.map((s, idx) => (
                <Pressable
                  key={s.title}
                  onPress={() => router.push(s.href)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                      borderTopColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
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
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 4,
    paddingBottom: Platform.OS === "web" ? 110 : 40,
  },
  category: {
    marginBottom: 8,
  },
  categoryLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 8,
    marginTop: 8,
  },
  groupCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16, letterSpacing: -0.2 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 3, lineHeight: 18 },
});
