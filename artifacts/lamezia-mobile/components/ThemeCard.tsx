import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { THEME_STATUS, formatDate, intentColors } from "@/lib/civic";
import type { Theme } from "@workspace/api-client-react";

export function ThemeCard({ theme }: { theme: Theme }) {
  const colors = useColors();
  const router = useRouter();
  const status = THEME_STATUS[theme.status] ?? {
    label: theme.status,
    intent: "closed" as const,
  };
  const statusColor = intentColors(status.intent, colors);

  return (
    <Pressable
      onPress={() => router.push(`/theme/${theme.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: colors.radius + 2,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Badge label={theme.categoryName} bg={colors.accent} fg={colors.accentForeground} />
        <Badge label={status.label} bg={statusColor.bg} fg={statusColor.fg} />
      </View>

      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
        {theme.title}
      </Text>
      <Text style={[styles.summary, { color: colors.mutedForeground }]} numberOfLines={2}>
        {theme.summary}
      </Text>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.metric}>
          <Feather
            name={theme.signalled ? "check-circle" : "alert-circle"}
            size={14}
            color={theme.signalled ? colors.primary : colors.mutedForeground}
          />
          <Text style={[styles.metricText, { color: colors.foreground }]}>
            {theme.relevanceCount}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
            {theme.signalled ? "segnalato" : "rilevante"}
          </Text>
        </View>
        <View style={styles.metric}>
          <Feather name="share-2" size={14} color={colors.mutedForeground} />
          <Text style={[styles.metricText, { color: colors.foreground }]}>
            {theme.shareCount}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {formatDate(theme.updatedAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 2,
  },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.3,
  },
  summary: {
    fontFamily: "Inter_400Regular",
    fontSize: 13.5,
    lineHeight: 19,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 6,
  },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  metricLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  date: {
    fontFamily: "Inter_500Medium",
    fontSize: 11.5,
  },
});
