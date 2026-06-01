import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge, Card, ChipRow, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt } from "@/lib/civic";
import {
  computeTrend,
  formatIndicatorValue,
  latestValue,
} from "@/lib/performance";
import {
  useGetPerformanceIndicator,
  useListPerformanceCategories,
  useListPerformanceFeedStatus,
  type FeedStatus,
  type PerformanceIndicator,
} from "@workspace/api-client-react";

export default function PerformanceScreen() {
  const colors = useColors();
  const [category, setCategory] = useState<number | undefined>(undefined);

  const categories = useListPerformanceCategories();
  const feedStatus = useListPerformanceFeedStatus();

  const categoryOptions = useMemo(
    () => [
      { label: "Tutte le categorie", value: undefined as number | undefined },
      ...(categories.data ?? []).map((c) => ({
        label: c.name,
        value: c.id as number | undefined,
      })),
    ],
    [categories.data],
  );

  const groups = useMemo(() => {
    const all = categories.data ?? [];
    const filtered =
      category === undefined ? all : all.filter((c) => c.id === category);
    return filtered.filter((c) => c.indicators.length > 0);
  }, [categories.data, category]);

  const indicatorTotal = useMemo(
    () =>
      (categories.data ?? []).reduce((sum, c) => sum + c.indicators.length, 0),
    [categories.data],
  );

  if (categories.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={96} radius={colors.radius + 2} />
          ))}
        </View>
      </View>
    );
  }

  if (categories.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare gli indicatori di performance."
          onRetry={() => categories.refetch()}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FeedBanner feed={(feedStatus.data ?? [])[0]} total={indicatorTotal} />

        {categoryOptions.length > 1 ? (
          <ChipRow
            options={categoryOptions}
            selected={category}
            getLabel={(o) => o.label}
            getValue={(o) => o.value}
            onSelect={(v) => setCategory(v as number | undefined)}
          />
        ) : null}

        {groups.length === 0 ? (
          <EmptyState
            icon="bar-chart-2"
            title="Nessun indicatore"
            message="Non ci sono ancora indicatori di performance disponibili."
          />
        ) : (
          groups.map((g) => (
            <View key={g.id} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={[styles.groupTitle, { color: colors.foreground }]}>
                  {g.name}
                </Text>
                {g.description ? (
                  <Text
                    style={[styles.groupDesc, { color: colors.mutedForeground }]}
                    numberOfLines={2}
                  >
                    {g.description}
                  </Text>
                ) : null}
              </View>
              <View style={{ gap: 12 }}>
                {g.indicators.map((ind) => (
                  <IndicatorCard
                    key={ind.id}
                    indicator={ind}
                    onPress={() => router.push(`/performance/${ind.id}`)}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function FeedBanner({ feed, total }: { feed?: FeedStatus; total: number }) {
  const colors = useColors();
  return (
    <Card style={{ gap: 8 }}>
      <View style={styles.feedRow}>
        <Feather name="activity" size={14} color={colors.primary} />
        <Text style={[styles.feedText, { color: colors.mutedForeground }]}>
          {total} {total === 1 ? "indicatore" : "indicatori"} monitorati
          {feed?.lastUpdatedAt ? (
            <>
              {" · agg. "}
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                {formatDateOpt(feed.lastUpdatedAt)}
              </Text>
            </>
          ) : null}
        </Text>
      </View>
      {feed?.url ? (
        <Pressable
          onPress={() => Linking.openURL(feed.url as string)}
          hitSlop={8}
          style={styles.linkBtn}
        >
          <Feather name="external-link" size={13} color={colors.primary} />
          <Text style={[styles.link, { color: colors.primary }]}>
            {feed.label || "Fonte dati"}
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

function IndicatorCard({
  indicator,
  onPress,
}: {
  indicator: PerformanceIndicator;
  onPress: () => void;
}) {
  const colors = useColors();
  // Il valore più recente non è incluso nell'elenco categorie (risposta
  // leggera): lo recuperiamo dal dettaglio, che viene messo in cache e
  // riutilizzato dalla schermata di dettaglio.
  const detail = useGetPerformanceIndicator(String(indicator.id));
  const values = detail.data?.values ?? [];
  const latest = latestValue(values);
  const trend = computeTrend(values, indicator.polarity, colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Card style={{ gap: 8 }}>
        <Text
          style={[styles.indTitle, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {indicator.title}
        </Text>

        <View style={styles.valueRow}>
          {detail.isLoading ? (
            <Skeleton height={26} width={90} />
          ) : latest ? (
            <Text style={[styles.value, { color: colors.primary }]}>
              {formatIndicatorValue(latest.value, indicator.unit)}
            </Text>
          ) : (
            <Text style={[styles.noValue, { color: colors.mutedForeground }]}>
              Dato non disponibile
            </Text>
          )}
          {trend ? (
            <View style={styles.trend}>
              <Feather name={trend.icon} size={15} color={trend.color} />
            </View>
          ) : null}
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Badge
            label={indicator.source}
            bg={colors.muted}
            fg={colors.mutedForeground}
            icon="database"
          />
          <View style={styles.openRow}>
            <Text style={[styles.openText, { color: colors.primary }]}>
              Serie storica
            </Text>
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
    gap: 14,
  },
  feedRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  feedText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    flex: 1,
    lineHeight: 17,
  },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  group: { gap: 12 },
  groupHeader: { gap: 3 },
  groupTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  groupDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  indTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  valueRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  value: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
  },
  noValue: { fontFamily: "Inter_500Medium", fontSize: 13.5 },
  trend: { flexDirection: "row", alignItems: "center" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  openRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  openText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
