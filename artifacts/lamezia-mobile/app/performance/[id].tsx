import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import {
  POLARITY_LABEL,
  computeTrend,
  formatIndicatorValue,
  formatPeriod,
  latestValue,
} from "@/lib/performance";
import {
  useGetPerformanceIndicator,
  type PerformanceIndicatorValue,
} from "@workspace/api-client-react";

export default function PerformanceDetailScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data, isLoading, error, refetch } = useGetPerformanceIndicator(
    String(id ?? ""),
  );

  const headerOptions = {
    title: "Indicatore",
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerTitleStyle: {
      fontFamily: "SpaceGrotesk_600SemiBold",
      color: colors.foreground,
    },
    headerShadowVisible: false,
  };

  const values = data?.values ?? [];
  const latest = latestValue(values);
  const trend = useMemo(
    () => (data ? computeTrend(values, data.polarity, colors) : null),
    [data, values, colors],
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={headerOptions} />
        <View style={{ padding: 20, gap: 14 }}>
          <Skeleton height={20} width="40%" />
          <Skeleton height={30} width="80%" />
          <Skeleton height={48} width="55%" />
          <Skeleton height={200} radius={colors.radius + 2} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={headerOptions} />
        <EmptyState
          icon="alert-triangle"
          title="Indicatore non trovato"
          message="Il contenuto richiesto non è disponibile."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={headerOptions} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeRow}>
          <Badge
            label={data.source}
            bg={colors.accent}
            fg={colors.accentForeground}
            icon="database"
          />
          <Badge
            label={POLARITY_LABEL[data.polarity]}
            bg={colors.muted}
            fg={colors.mutedForeground}
          />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          {data.title}
        </Text>
        {data.description ? (
          <Text style={[styles.summary, { color: colors.mutedForeground }]}>
            {data.description}
          </Text>
        ) : null}

        {/* Valore più recente */}
        {latest ? (
          <Card style={{ marginTop: 16, gap: 6 }}>
            <Text style={[styles.latestLabel, { color: colors.mutedForeground }]}>
              VALORE PIÙ RECENTE · {formatPeriod(latest.period).toUpperCase()}
            </Text>
            <View style={styles.latestRow}>
              <Text style={[styles.latestValue, { color: colors.primary }]}>
                {formatIndicatorValue(latest.value, data.unit)}
              </Text>
              {trend ? (
                <View style={styles.trendRow}>
                  <Feather name={trend.icon} size={16} color={trend.color} />
                  <Text style={[styles.trendText, { color: trend.color }]}>
                    {trend.delta > 0 ? "+" : ""}
                    {formatIndicatorValue(trend.delta, data.unit)}
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>
        ) : null}

        {/* Grafico serie storica */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Serie storica
        </Text>
        {values.length >= 2 ? (
          <SeriesChart values={values} unit={data.unit} />
        ) : values.length === 1 ? (
          <Card>
            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
              È disponibile un solo periodo: non è possibile tracciare un
              andamento.
            </Text>
          </Card>
        ) : (
          <EmptyState
            icon="bar-chart-2"
            title="Nessun dato"
            message="Non ci sono ancora valori per questo indicatore."
          />
        )}

        {/* Tabella valori */}
        {values.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Tutti i periodi
            </Text>
            <Card style={{ padding: 0 }}>
              {[...values].reverse().map((v, idx) => (
                <View
                  key={v.id}
                  style={[
                    styles.valueItem,
                    {
                      borderTopColor: colors.border,
                      borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.periodText, { color: colors.foreground }]}
                    >
                      {formatPeriod(v.period)}
                    </Text>
                    {v.note ? (
                      <Text
                        style={[
                          styles.noteSmall,
                          { color: colors.mutedForeground },
                        ]}
                        numberOfLines={2}
                      >
                        {v.note}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={[styles.periodValue, { color: colors.foreground }]}
                  >
                    {formatIndicatorValue(v.value, data.unit)}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        {/* Fonte */}
        {data.sourceUrl ? (
          <Pressable
            onPress={() => Linking.openURL(data.sourceUrl as string)}
            hitSlop={8}
            style={styles.sourceLink}
          >
            <Feather name="external-link" size={14} color={colors.primary} />
            <Text style={[styles.sourceLinkText, { color: colors.primary }]}>
              Fonte: {data.source}
            </Text>
          </Pressable>
        ) : (
          <Text style={[styles.sourceText, { color: colors.mutedForeground }]}>
            Fonte: {data.source}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const CHART_HEIGHT = 200;
const CHART_WIDTH = 320;
const PAD_LEFT = 10;
const PAD_RIGHT = 10;
const PAD_TOP = 14;
const PAD_BOTTOM = 24;

function SeriesChart({
  values,
  unit,
}: {
  values: PerformanceIndicatorValue[];
  unit: string;
}) {
  const colors = useColors();
  const points = values.map((v) => v.value);
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const plotW = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const n = values.length;
  const xOf = (i: number) => PAD_LEFT + (n > 1 ? (plotW / (n - 1)) * i : plotW / 2);
  const yOf = (v: number) => PAD_TOP + plotH - ((v - min) / range) * plotH;

  const linePath = values
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${xOf(i).toFixed(2)},${yOf(v.value).toFixed(2)}`,
    )
    .join(" ");

  return (
    <Card style={{ gap: 10 }}>
      <Svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        {/* baseline */}
        <Line
          x1={PAD_LEFT}
          y1={PAD_TOP + plotH}
          x2={CHART_WIDTH - PAD_RIGHT}
          y2={PAD_TOP + plotH}
          stroke={colors.border}
          strokeWidth={1}
        />
        <Path d={linePath} stroke={colors.primary} strokeWidth={2.5} fill="none" />
        {values.map((v, i) => (
          <Circle
            key={v.id}
            cx={xOf(i)}
            cy={yOf(v.value)}
            r={3}
            fill={colors.primary}
          />
        ))}
      </Svg>
      <View style={styles.chartAxis}>
        <Text
          style={[styles.axisLabel, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {formatPeriod(values[0].period)} · {formatIndicatorValue(min, unit)} –{" "}
          {formatIndicatorValue(max, unit)} · {formatPeriod(values[n - 1].period)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  title: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.5,
  },
  summary: {
    fontFamily: "Inter_400Regular",
    fontSize: 14.5,
    lineHeight: 21,
    marginTop: 10,
  },
  latestLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
  latestRow: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  latestValue: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 34,
    letterSpacing: -0.5,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingBottom: 6,
  },
  trendText: { fontFamily: "Inter_600SemiBold", fontSize: 13.5 },
  sectionTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 19,
    letterSpacing: -0.3,
    marginTop: 22,
    marginBottom: 12,
  },
  noteText: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19 },
  chartAxis: { flexDirection: "row", justifyContent: "center" },
  axisLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10.5,
    textAlign: "center",
  },
  valueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  periodText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  noteSmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  periodValue: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15 },
  sourceLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  sourceLinkText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  sourceText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 20,
  },
});
