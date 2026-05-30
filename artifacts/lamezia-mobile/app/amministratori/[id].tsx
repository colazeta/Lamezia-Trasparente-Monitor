import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import {
  formatAmount,
  formatDateOpt,
  intentColors,
  officialRoleLabel,
  officialStatusInfo,
  voteInfo,
} from "@/lib/civic";
import { useGetOfficial } from "@workspace/api-client-react";

export default function OfficialDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const officialId = Number(id);
  const official = useGetOfficial(officialId);

  if (official.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
        <Skeleton height={120} radius={colors.radius + 2} />
        <Skeleton height={160} radius={colors.radius + 2} />
        <Skeleton height={200} radius={colors.radius + 2} />
      </View>
    );
  }

  if (official.isError || !official.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare il profilo."
          onRetry={() => official.refetch()}
        />
      </View>
    );
  }

  const p = official.data;
  const status = officialStatusInfo(p.status);
  const si = intentColors(status.intent, colors);
  const initials = p.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.heroCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.initials, { color: colors.primaryForeground }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{p.name}</Text>
        <Text style={[styles.role, { color: colors.mutedForeground }]}>
          {p.roleTitle || officialRoleLabel(p.role)}
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={status.label} bg={si.bg} fg={si.fg} />
          {p.group ? (
            <Badge label={p.group} bg={colors.muted} fg={colors.mutedForeground} />
          ) : null}
        </View>
        {p.appointmentDate ? (
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            In carica dal {formatDateOpt(p.appointmentDate)}
          </Text>
        ) : null}
      </Card>

      {p.organi.length > 0 ? (
        <Card style={{ gap: 10 }}>
          <SectionTitle icon="home" label="Appartenenza agli organi" />
          {p.organi.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => router.push(`/organi/${o.slug}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View style={[styles.lineRow, { borderTopColor: colors.border }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.lineTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {o.name}
                  </Text>
                  {o.membershipRole ? (
                    <Text style={[styles.lineSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {o.membershipRole}
                    </Text>
                  ) : null}
                </View>
                <Feather name="chevron-right" size={16} color={colors.primary} />
              </View>
            </Pressable>
          ))}
        </Card>
      ) : null}

      {p.biography ? (
        <Card style={{ gap: 8 }}>
          <SectionTitle icon="user" label="Biografia" />
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{p.biography}</Text>
        </Card>
      ) : null}

      {p.remunerations.length > 0 ? (
        <Card style={{ gap: 10 }}>
          <SectionTitle icon="dollar-sign" label="Compensi" />
          {p.remunerations.map((r) => (
            <View key={r.id} style={[styles.lineRow, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lineTitle, { color: colors.foreground }]}>{r.type}</Text>
                <Text style={[styles.lineSub, { color: colors.mutedForeground }]}>{r.year}</Text>
              </View>
              <Text style={[styles.amount, { color: colors.primary }]}>
                {r.amount != null ? formatAmount(r.amount) : "—"}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      {p.activities.length > 0 ? (
        <Card style={{ gap: 10 }}>
          <SectionTitle icon="activity" label="Attività" />
          {p.activities.map((a) => (
            <View key={a.id} style={[styles.lineRow, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lineTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {a.title}
                </Text>
                {a.description ? (
                  <Text style={[styles.lineSub, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {a.description}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.lineSub, { color: colors.mutedForeground }]}>
                {formatDateOpt(a.date)}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      {p.votes.length > 0 ? (
        <Card style={{ gap: 10 }}>
          <SectionTitle icon="check-square" label="Voti recenti" />
          {p.votes.map((v) => {
            const vi = voteInfo(v.vote);
            const vc = intentColors(vi.intent, colors);
            return (
              <View key={v.publicationId} style={[styles.lineRow, { borderTopColor: colors.border }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.lineTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {v.oggetto}
                  </Text>
                  <Text style={[styles.lineSub, { color: colors.mutedForeground }]}>
                    {formatDateOpt(v.dataAtto)}
                  </Text>
                </View>
                <Badge label={vi.label} bg={vc.bg} fg={vc.fg} icon={vi.icon} />
              </View>
            );
          })}
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
  heroCard: { alignItems: "center", gap: 8, paddingVertical: 22 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 26 },
  name: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 21,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  role: { fontFamily: "Inter_500Medium", fontSize: 14, textAlign: "center" },
  badgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "center" },
  meta: { fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: 2 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16, letterSpacing: -0.2 },
  body: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  lineTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13.5, lineHeight: 19 },
  lineSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  amount: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 14 },
});
