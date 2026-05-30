import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt, officialStatusInfo, intentColors } from "@/lib/civic";
import { useGetOrgano } from "@workspace/api-client-react";

export default function OrganoDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const organo = useGetOrgano(slug);

  if (organo.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
        <Skeleton height={120} radius={colors.radius + 2} />
        <Skeleton height={200} radius={colors.radius + 2} />
      </View>
    );
  }

  if (organo.isError || !organo.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare l'organo."
          onRetry={() => organo.refetch()}
        />
      </View>
    );
  }

  const o = organo.data;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card style={{ gap: 8 }}>
        <Text style={[styles.name, { color: colors.foreground }]}>{o.name}</Text>
        {o.description ? (
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{o.description}</Text>
        ) : null}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Feather name="users" size={14} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {o.memberCount} component{o.memberCount === 1 ? "e" : "i"}
            </Text>
          </View>
          <View style={styles.stat}>
            <Feather name="calendar" size={14} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {o.sedutaCount} sedut{o.sedutaCount === 1 ? "a" : "e"}
            </Text>
          </View>
        </View>
      </Card>

      {o.members.length > 0 ? (
        <Card style={{ gap: 10 }}>
          <SectionTitle icon="users" label="Composizione" />
          {o.members.map((m) => {
            const status = officialStatusInfo(m.status);
            const si = intentColors(status.intent, colors);
            return (
              <Pressable
                key={m.officialId}
                onPress={() => router.push(`/amministratori/${m.officialId}`)}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <View style={[styles.lineRow, { borderTopColor: colors.border }]}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.lineTitle, { color: colors.foreground }]} numberOfLines={1}>
                      {m.name}
                    </Text>
                    <Text style={[styles.lineSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {m.membershipRole ?? m.roleTitle ?? m.role}
                    </Text>
                  </View>
                  {m.status === "cessato" ? (
                    <Badge label={status.label} bg={si.bg} fg={si.fg} />
                  ) : null}
                  <Feather name="chevron-right" size={16} color={colors.primary} />
                </View>
              </Pressable>
            );
          })}
        </Card>
      ) : null}

      {o.sedute.length > 0 ? (
        <Card style={{ gap: 10 }}>
          <SectionTitle icon="calendar" label="Sedute" />
          {o.sedute.map((s) => (
            <Pressable
              key={s.id}
              disabled={s.publicationId == null}
              onPress={() =>
                s.publicationId != null && router.push(`/convocazioni/${s.publicationId}`)
              }
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View style={[styles.lineRow, { borderTopColor: colors.border }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.lineSub, { color: colors.mutedForeground }]}>
                    {formatDateOpt(s.date)}
                  </Text>
                  {s.agenda ? (
                    <Text style={[styles.lineTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {s.agenda}
                    </Text>
                  ) : null}
                </View>
                <Feather name="chevron-right" size={16} color={colors.primary} />
              </View>
            </Pressable>
          ))}
        </Card>
      ) : null}
    </ScrollView>
  );
}

function SectionTitle({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitleRow}>
      <Feather name={icon} size={16} color={colors.primary} />
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 14,
    paddingBottom: Platform.OS === "web" ? 80 : 48,
  },
  name: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 21,
    letterSpacing: -0.4,
  },
  body: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  statsRow: { flexDirection: "row", gap: 16, marginTop: 2 },
  stat: { flexDirection: "row", alignItems: "center", gap: 5 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16, letterSpacing: -0.2 },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  lineTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13.5, lineHeight: 19 },
  lineSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
});
