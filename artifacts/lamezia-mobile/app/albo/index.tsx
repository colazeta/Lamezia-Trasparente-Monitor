import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge, Card, EmptyState, NoticeBanner, SearchBar, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt, intentColors } from "@/lib/civic";
import { macrotemaColor, macrotemaLabel } from "@/lib/gis";
import {
  MONITORING_NOTICE_BODY,
  MONITORING_NOTICE_TITLE,
} from "@/lib/monitoring";
import {
  useGetFeedStatus,
  useGetPublicationsMacrotemi,
  useListPublications,
  type MacrotemaKey,
  type Publication,
} from "@workspace/api-client-react";

const MACROTEMA_KEYS: MacrotemaKey[] = [
  "ambiente",
  "scuole",
  "strade",
  "sociale",
  "cultura",
  "mobilita",
  "altro",
];

export default function AlboScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [macrotema, setMacrotema] = useState<MacrotemaKey | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 400);
    return () => clearTimeout(t);
  }, [input]);

  const params = useMemo(
    () => ({
      category: "albo",
      ...(q ? { q } : {}),
      ...(macrotema ? { macrotema } : {}),
    }),
    [q, macrotema],
  );
  const pubs = useListPublications(params);
  const feed = useGetFeedStatus();
  const alboFeed = feed.data;

  const macrotemiStats = useGetPublicationsMacrotemi({ category: "albo" });
  const counts = useMemo(() => {
    const map: Partial<Record<MacrotemaKey, number>> = {};
    let total = 0;
    for (const row of macrotemiStats.data ?? []) {
      map[row.macrotema as MacrotemaKey] = row.count;
      total += row.count;
    }
    return { map, total };
  }, [macrotemiStats.data]);
  const hasCounts = (macrotemiStats.data?.length ?? 0) > 0;
  const visibleKeys = hasCounts
    ? MACROTEMA_KEYS.filter((key) => (counts.map[key] ?? 0) > 0)
    : MACROTEMA_KEYS;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <SearchBar
          value={input}
          onChangeText={setInput}
          placeholder="Cerca per oggetto…"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <MacrotemaChip
            label="Tutti i temi"
            color={colors.primary}
            active={macrotema === null}
            count={hasCounts ? counts.total : undefined}
            onPress={() => setMacrotema(null)}
          />
          {visibleKeys.map((key) => (
            <MacrotemaChip
              key={key}
              label={macrotemaLabel(key)}
              color={macrotemaColor(key)}
              active={macrotema === key}
              count={hasCounts ? counts.map[key] ?? 0 : undefined}
              onPress={() => setMacrotema(key)}
            />
          ))}
        </ScrollView>
        {alboFeed?.lastUpdatedAt ? (
          <View style={styles.feedRow}>
            <Feather name="rss" size={12} color={colors.mutedForeground} />
            <Text style={[styles.feedText, { color: colors.mutedForeground }]}>
              Aggiornato il {formatDateOpt(alboFeed.lastUpdatedAt)}
            </Text>
          </View>
        ) : null}
        <NoticeBanner
          title={MONITORING_NOTICE_TITLE}
          message={MONITORING_NOTICE_BODY}
        />
      </View>

      {pubs.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={110} radius={colors.radius + 2} />
          ))}
        </View>
      ) : pubs.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare gli atti."
          onRetry={() => pubs.refetch()}
        />
      ) : (
        <FlatList
          data={pubs.data ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PublicationCard
              pub={item}
              onPress={() => router.push(`/albo/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          scrollEnabled={(pubs.data?.length ?? 0) > 0}
          ListEmptyComponent={
            <EmptyState
              icon="clipboard"
              title="Nessun atto"
              message="Nessun atto corrisponde alla ricerca."
            />
          }
        />
      )}
    </View>
  );
}

function MacrotemaChip({
  label,
  color,
  active,
  count,
  onPress,
}: {
  label: string;
  color: string;
  active: boolean;
  count?: number;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? color : `${color}1A`,
          borderColor: active ? color : `${color}55`,
        },
      ]}
    >
      <View style={[styles.chipDot, { backgroundColor: active ? "#fff" : color }]} />
      <Text
        style={[
          styles.chipText,
          { color: active ? "#fff" : colors.foreground },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {count !== undefined ? (
        <View
          style={[
            styles.chipCount,
            {
              backgroundColor: active ? "rgba(255,255,255,0.25)" : `${color}26`,
            },
          ]}
        >
          <Text
            style={[
              styles.chipCountText,
              { color: active ? "#fff" : color },
            ]}
          >
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function PublicationCard({
  pub,
  onPress,
}: {
  pub: Publication;
  onPress?: () => void;
}) {
  const colors = useColors();
  const newColor = intentColors("alert", colors);
  const showMacrotema = pub.macrotema && pub.macrotema !== "altro";
  const card = (
    <Card style={{ gap: 8 }}>
      <View style={styles.topRow}>
        <Badge label={pub.tipologia || pub.category} bg={colors.muted} fg={colors.mutedForeground} />
        {pub.isPnrr ? (
          <Badge label="PNRR" bg={colors.accent} fg={colors.accentForeground} icon="trending-up" />
        ) : null}
        {pub.isNew ? <Badge label="Nuovo" bg={newColor.bg} fg={newColor.fg} /> : null}
      </View>
      {showMacrotema ? (
        <Badge
          label={macrotemaLabel(pub.macrotema)}
          bg={`${macrotemaColor(pub.macrotema)}22`}
          fg={macrotemaColor(pub.macrotema)}
          icon="layers"
        />
      ) : null}
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
        {pub.oggetto}
      </Text>
      {pub.brief ? (
        <Text
          style={[styles.brief, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {pub.brief}
        </Text>
      ) : null}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {pub.progressivo ? `N. ${pub.progressivo}` : pub.provenienza ?? ""}
        </Text>
        <View style={styles.footerRight}>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {formatDateOpt(pub.pubStart ?? pub.dataAtto)}
          </Text>
          {onPress ? (
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          ) : null}
        </View>
      </View>
    </Card>
  );

  if (!onPress) return card;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {card}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 8 },
  chipRow: { gap: 8, paddingVertical: 2, paddingRight: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12.5 },
  chipCount: {
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  chipCountText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  feedRow: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 2 },
  feedText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  topRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  brief: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
