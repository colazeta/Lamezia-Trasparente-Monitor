import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt } from "@/lib/civic";
import { useListSedute, type Seduta } from "@workspace/api-client-react";

const UNGROUPED = "Altre sedute";

type Group = { name: string; slug: string | null; items: Seduta[] };

function groupByOrgano(sedute: Seduta[]): Group[] {
  const groups = new Map<string, Group>();
  for (const s of sedute) {
    const key = s.organo ? s.organo.slug : UNGROUPED;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(s);
    } else {
      groups.set(key, {
        name: s.organo ? s.organo.name : UNGROUPED,
        slug: s.organo?.slug ?? null,
        items: [s],
      });
    }
  }
  return Array.from(groups.values());
}

export default function ConvocazioniScreen() {
  const colors = useColors();
  const router = useRouter();
  const sedute = useListSedute();

  const groups = useMemo(() => groupByOrgano(sedute.data ?? []), [sedute.data]);

  if (sedute.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} radius={colors.radius + 2} />
          ))}
        </View>
      </View>
    );
  }

  if (sedute.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare le convocazioni."
          onRetry={() => sedute.refetch()}
        />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState icon="calendar" title="Nessuna seduta" message="Nessuna convocazione." />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    >
      {groups.map((g) => (
        <View key={g.slug ?? g.name} style={{ gap: 12, marginBottom: 18 }}>
          <Pressable
            disabled={!g.slug}
            onPress={() => g.slug && router.push(`/organi/${g.slug}`)}
            style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          >
            <View style={styles.groupHeader}>
              <Feather name="home" size={15} color={colors.primary} />
              <Text style={[styles.groupTitle, { color: colors.foreground }]}>{g.name}</Text>
            </View>
          </Pressable>
          {g.items.map((s) => (
            <SedutaCard
              key={s.id}
              seduta={s}
              onPress={() =>
                s.publicationId != null && router.push(`/convocazioni/${s.publicationId}`)
              }
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function SedutaCard({ seduta, onPress }: { seduta: Seduta; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={seduta.publicationId == null}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card style={{ gap: 8 }}>
        <View style={styles.topRow}>
          {seduta.organo ? (
            <Badge
              label={seduta.organo.name}
              bg={colors.accent}
              fg={colors.accentForeground}
            />
          ) : (
            <View />
          )}
          <View style={styles.dateRow}>
            <Feather name="calendar" size={13} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {formatDateOpt(seduta.date)}
            </Text>
          </View>
        </View>
        {seduta.agenda ? (
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
            {seduta.agenda}
          </Text>
        ) : null}
        <View style={styles.linkRow}>
          <Text style={[styles.link, { color: colors.primary }]}>Vedi seduta</Text>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  groupTitle: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 17,
    letterSpacing: -0.3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
