import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path, Rect } from "react-native-svg";

import { Badge, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import {
  useGetOpendataResourceContent,
  type OpendataColumn,
  type OpendataTableRowsItem,
} from "@workspace/api-client-react";

const PAGE_SIZE = 12;
const MAX_CHART_POINTS = 50;

const numberFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 4,
});

function formatCell(value: string | number | null, type: string): string {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "number" && typeof value === "number") {
    return numberFormatter.format(value);
  }
  return String(value);
}

export function ResourceTable({ resourceId }: { resourceId: number }) {
  const colors = useColors();
  const { data, isLoading, isError, refetch } = useGetOpendataResourceContent(resourceId);

  const [page, setPage] = useState(0);
  const [showChart, setShowChart] = useState(true);

  const columns: OpendataColumn[] = data?.columns ?? [];
  const rows: OpendataTableRowsItem[] = data?.rows ?? [];

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const chart = useMemo(() => pickChart(columns, rows), [columns, rows]);

  if (isLoading) {
    return (
      <View style={{ gap: 10 }}>
        <Skeleton height={36} />
        <Skeleton height={180} radius={colors.radius + 2} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View
        style={[
          styles.warnBox,
          { backgroundColor: "rgba(217, 119, 6, 0.12)", borderColor: "rgba(217, 119, 6, 0.4)" },
        ]}
      >
        <Feather name="alert-triangle" size={16} color="#D97706" />
        <Text style={[styles.warnText, { color: "#B45309" }]}>
          Impossibile caricare l'anteprima. Puoi comunque scaricare il file originale.
        </Text>
        <Pressable onPress={() => refetch()} hitSlop={8}>
          <Feather name="refresh-cw" size={15} color="#B45309" />
        </Pressable>
      </View>
    );
  }

  if (columns.length === 0 || rows.length === 0) {
    return (
      <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Nessun dato tabellare disponibile per l'anteprima di questa risorsa.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Summary row */}
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
            {numberFormatter.format(data.rowCount)}
          </Text>{" "}
          {data.rowCount === 1 ? "riga" : "righe"}
          {data.truncated ? " (anteprima limitata)" : ""}
        </Text>
        {chart ? (
          <Pressable
            onPress={() => setShowChart((v) => !v)}
            hitSlop={6}
            style={styles.toggleBtn}
          >
            <Feather name="bar-chart-2" size={14} color={colors.primary} />
            <Text style={[styles.toggleText, { color: colors.primary }]}>
              {showChart ? "Nascondi grafico" : "Mostra grafico"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {data.truncated ? (
        <View style={[styles.noteBox, { borderColor: colors.border, backgroundColor: colors.muted }]}>
          <Feather name="alert-triangle" size={13} color={colors.primary} />
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            L'anteprima mostra le prime {numberFormatter.format(data.rowCount)} righe. Scarica la
            risorsa per il dataset completo.
          </Text>
        </View>
      ) : null}

      {chart && showChart ? <ResourceChart chart={chart} /> : null}

      {/* Table */}
      <View style={[styles.tableWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={[styles.tableHeaderRow, { backgroundColor: colors.muted, borderBottomColor: colors.border }]}>
              {columns.map((c) => (
                <View key={c.name} style={styles.cell}>
                  <Text
                    style={[
                      styles.headerCellText,
                      { color: colors.mutedForeground, textAlign: c.type === "number" ? "right" : "left" },
                    ]}
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                </View>
              ))}
            </View>
            {pageRows.map((row, i) => (
              <View
                key={safePage * PAGE_SIZE + i}
                style={[
                  styles.tableRow,
                  { borderBottomColor: colors.border, backgroundColor: i % 2 === 1 ? colors.muted : colors.card },
                ]}
              >
                {columns.map((c) => (
                  <View key={c.name} style={styles.cell}>
                    <Text
                      style={[
                        styles.cellText,
                        {
                          color: colors.foreground,
                          textAlign: c.type === "number" ? "right" : "left",
                          fontFamily: c.type === "number" ? "Inter_500Medium" : "Inter_400Regular",
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {formatCell(row[c.name], c.type)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Pagination */}
      {pageCount > 1 ? (
        <View style={styles.pagination}>
          <Text style={[styles.pageInfo, { color: colors.mutedForeground }]}>
            Pagina {safePage + 1} di {pageCount}
          </Text>
          <View style={styles.pageBtns}>
            <Pressable
              disabled={safePage === 0}
              onPress={() => setPage((p) => Math.max(0, p - 1))}
              style={[
                styles.pageBtn,
                { borderColor: colors.border, opacity: safePage === 0 ? 0.4 : 1 },
              ]}
            >
              <Feather name="chevron-left" size={16} color={colors.foreground} />
            </Pressable>
            <Pressable
              disabled={safePage >= pageCount - 1}
              onPress={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              style={[
                styles.pageBtn,
                { borderColor: colors.border, opacity: safePage >= pageCount - 1 ? 0.4 : 1 },
              ]}
            >
              <Feather name="chevron-right" size={16} color={colors.foreground} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

type ChartSpec = {
  type: "bar" | "line";
  xKey: string;
  yKey: string;
  data: Array<{ label: string; value: number }>;
};

function pickChart(columns: OpendataColumn[], rows: OpendataTableRowsItem[]): ChartSpec | null {
  if (rows.length < 2) return null;
  const numericCols = columns.filter((c) => c.type === "number");
  const dateCols = columns.filter((c) => c.type === "date");
  const stringCols = columns.filter((c) => c.type === "string");
  if (numericCols.length === 0) return null;

  const yCol = numericCols[0];
  const xCol =
    dateCols[0] ??
    stringCols[0] ??
    numericCols.find((c) => c.name !== yCol.name) ??
    null;
  if (!xCol) return null;

  const type: "bar" | "line" = dateCols[0] ? "line" : "bar";

  const points = rows
    .map((row) => {
      const rawY = row[yCol.name];
      const rawX = row[xCol.name];
      if (rawY == null || rawX == null) return null;
      const value = Number(rawY);
      if (Number.isNaN(value)) return null;
      return { label: String(rawX), value };
    })
    .filter((p): p is { label: string; value: number } => p !== null);

  if (points.length < 2) return null;

  const data = points.length > MAX_CHART_POINTS ? points.slice(0, MAX_CHART_POINTS) : points;
  return { type, xKey: xCol.name, yKey: yCol.name, data };
}

const CHART_HEIGHT = 180;
const CHART_WIDTH = 300;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 22;

function ResourceChart({ chart }: { chart: ChartSpec }) {
  const colors = useColors();
  const values = chart.data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const range = max - min || 1;

  const plotW = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const yOf = (v: number) => PAD_TOP + plotH - ((v - min) / range) * plotH;

  const n = chart.data.length;

  return (
    <View style={[styles.chartCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
      <View style={styles.chartHeader}>
        <Feather name="bar-chart-2" size={14} color={colors.primary} />
        <Text style={[styles.chartTitle, { color: colors.foreground }]} numberOfLines={1}>
          {chart.yKey}
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
            {" "}
            per {chart.xKey}
          </Text>
        </Text>
        {chart.data.length === MAX_CHART_POINTS ? (
          <Badge label={`primi ${MAX_CHART_POINTS}`} bg={colors.muted} fg={colors.mutedForeground} />
        ) : null}
      </View>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        {/* baseline */}
        <Line
          x1={PAD_LEFT}
          y1={yOf(min)}
          x2={CHART_WIDTH - PAD_RIGHT}
          y2={yOf(min)}
          stroke={colors.border}
          strokeWidth={1}
        />
        {chart.type === "bar"
          ? chart.data.map((d, i) => {
              const slot = plotW / n;
              const barW = Math.max(2, slot * 0.6);
              const x = PAD_LEFT + slot * i + (slot - barW) / 2;
              const y = yOf(d.value);
              const h = yOf(min) - y;
              return (
                <Rect
                  key={i}
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(0, h)}
                  rx={2}
                  fill={colors.primary}
                />
              );
            })
          : (() => {
              const slot = n > 1 ? plotW / (n - 1) : plotW;
              const d = chart.data
                .map((pt, i) => {
                  const x = PAD_LEFT + slot * i;
                  const y = yOf(pt.value);
                  return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
                })
                .join(" ");
              return <Path d={d} stroke={colors.primary} strokeWidth={2} fill="none" />;
            })()}
      </Svg>
      <View style={styles.chartAxis}>
        <Text style={[styles.axisLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
          {chart.data[0]?.label}
        </Text>
        <Text style={[styles.axisLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
          {chart.data[chart.data.length - 1]?.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  warnBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  warnText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 12.5, lineHeight: 17 },
  emptyBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 18,
  },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", lineHeight: 19 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  summaryText: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  toggleBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  toggleText: { fontFamily: "Inter_600SemiBold", fontSize: 12.5 },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  noteText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 11.5, lineHeight: 16 },
  tableWrap: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cell: {
    width: 130,
    paddingHorizontal: 10,
    paddingVertical: 9,
    justifyContent: "center",
  },
  headerCellText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10.5,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  cellText: { fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 17 },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageInfo: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  pageBtns: { flexDirection: "row", gap: 8 },
  pageBtn: {
    width: 38,
    height: 34,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  chartHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  chartTitle: { flex: 1, fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 13, letterSpacing: -0.2 },
  chartAxis: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  axisLabel: { fontFamily: "Inter_400Regular", fontSize: 10.5, maxWidth: "48%" },
});
