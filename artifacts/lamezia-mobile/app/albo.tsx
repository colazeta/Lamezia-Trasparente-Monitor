import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, NoticeBanner, SearchBar, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt, intentColors } from "@/lib/civic";
import {
  MONITORING_NOTICE_BODY,
  MONITORING_NOTICE_TITLE,
} from "@/lib/monitoring";
import {
  useGetFeedStatus,
  useListPublications,
  type Publication,
} from "@workspace/api-client-react";

export default function AlboScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 400);
    return () => clearTimeout(t);
  }, [input]);

  const params = useMemo(
    () => ({ category: "albo", ...(q ? { q } : {}) }),
    [q],
  );
  const pubs = useListPublications(params);
  const feed = useGetFeedStatus();
  const alboFeed = feed.data;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <SearchBar
          value={input}
          onChangeText={setInput}
          placeholder="Cerca per oggetto…"
        />
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
          renderItem={({ item }) => <PublicationCard pub={item} />}
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

export function PublicationCard({ pub }: { pub: Publication }) {
  const colors = useColors();
  const newColor = intentColors("alert", colors);
  return (
    <Card style={{ gap: 8 }}>
      <View style={styles.topRow}>
        <Badge label={pub.tipologia || pub.category} bg={colors.muted} fg={colors.mutedForeground} />
        {pub.isPnrr ? (
          <Badge label="PNRR" bg={colors.accent} fg={colors.accentForeground} icon="trending-up" />
        ) : null}
        {pub.isNew ? <Badge label="Nuovo" bg={newColor.bg} fg={newColor.fg} /> : null}
      </View>
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
        {pub.oggetto}
      </Text>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
          {pub.progressivo ? `N. ${pub.progressivo}` : pub.provenienza ?? ""}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {formatDateOpt(pub.pubStart ?? pub.dataAtto)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 8 },
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
