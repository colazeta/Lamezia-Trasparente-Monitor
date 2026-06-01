import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Badge, Card, ChipRow, DateField, EmptyState, NoticeBanner, SearchBar, Skeleton } from "@/components/ui";
import { InterventionsMap } from "../../components/InterventionsMap";
import { useColors } from "@/hooks/useColors";
import { compactAmount, formatAmount, formatDateOpt, intentColors } from "@/lib/civic";
import {
  MONITORING_NOTICE_BODY,
  MONITORING_NOTICE_TITLE,
} from "@/lib/monitoring";
import {
  useGetContractsAnalytics,
  useGetContractsFeedStatus,
  useListContracts,
  useListThemes,
  type Contract,
  type ContractAnalytics,
  type ListContractsParams,
} from "@workspace/api-client-react";

const ANAC_PORTAL_URL = "https://dati.anticorruzione.it/superset/dashboard/appalti/";

export default function ContrattiScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [procedureType, setProcedureType] = useState<string | undefined>(undefined);
  const [acquisitionTool, setAcquisitionTool] = useState<string | undefined>(undefined);
  const [themeId, setThemeId] = useState<number | undefined>(undefined);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 400);
    return () => clearTimeout(t);
  }, [input]);

  const themes = useListThemes();

  const params = useMemo(() => {
    const p: ListContractsParams = {};
    if (search) p.search = search;
    if (procedureType) p.procedureType = procedureType;
    if (acquisitionTool) p.acquisitionTool = acquisitionTool;
    if (themeId != null) p.themeId = themeId;
    if (minAmount && !Number.isNaN(Number(minAmount))) p.minAmount = Number(minAmount);
    if (maxAmount && !Number.isNaN(Number(maxAmount))) p.maxAmount = Number(maxAmount);
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [search, procedureType, acquisitionTool, themeId, minAmount, maxAmount, from, to]);

  const hasActiveFilters =
    !!search ||
    procedureType != null ||
    acquisitionTool != null ||
    themeId != null ||
    minAmount !== "" ||
    maxAmount !== "" ||
    from !== "" ||
    to !== "";

  const resetFilters = () => {
    setInput("");
    setSearch("");
    setProcedureType(undefined);
    setAcquisitionTool(undefined);
    setThemeId(undefined);
    setMinAmount("");
    setMaxAmount("");
    setFrom("");
    setTo("");
  };

  const contracts = useListContracts(params);
  const analytics = useGetContractsAnalytics(params);
  const feedStatus = useGetContractsFeedStatus();

  const { procedures, tools } = useMemo(() => {
    const p = new Set<string>();
    const t = new Set<string>();
    (contracts.data ?? []).forEach((c) => {
      if (c.procedureType) p.add(c.procedureType);
      if (c.acquisitionTool) t.add(c.acquisitionTool);
    });
    return {
      procedures: Array.from(p).sort(),
      tools: Array.from(t).sort(),
    };
  }, [contracts.data]);

  const procedureOptions = useMemo(
    () => [{ label: "Tutte le procedure", value: undefined as string | undefined }, ...procedures.map((p) => ({ label: p, value: p }))],
    [procedures],
  );
  const toolOptions = useMemo(
    () => [{ label: "Tutti gli strumenti", value: undefined as string | undefined }, ...tools.map((t) => ({ label: t, value: t }))],
    [tools],
  );
  const themeOptions = useMemo(
    () => [
      { label: "Tutti i Temi", value: undefined as number | undefined },
      ...(themes.data ?? []).map((t) => ({ label: t.title, value: t.id as number | undefined })),
    ],
    [themes.data],
  );

  const items = contracts.data ?? [];

  const located = useMemo(
    () =>
      items.filter(
        (c) => typeof c.latitude === "number" && typeof c.longitude === "number",
      ),
    [items],
  );

  const Header = (
    <View style={styles.headerArea}>
      <FeedBanner feedStatus={feedStatus.data} />
      <NoticeBanner
        title={MONITORING_NOTICE_TITLE}
        message={MONITORING_NOTICE_BODY}
      />
      <Analytics loading={analytics.isLoading} analytics={analytics.data} />
      {located.length > 0 ? (
        <Card style={{ gap: 10 }}>
          <View style={styles.sectionTitleRow}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Mappa degli interventi
            </Text>
          </View>
          <Text style={[styles.mapHint, { color: colors.mutedForeground }]}>
            {located.length} su {items.length} appalti geolocalizzati. Tocca un
            segnaposto per aprire la scheda.
          </Text>
          <InterventionsMap
            contracts={located}
            onMarkerPress={(c) => router.push(`/contratti/${c.id}`)}
          />
        </Card>
      ) : null}
      {procedures.length > 1 ? (
        <ChipRow
          options={procedureOptions}
          selected={procedureType}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setProcedureType(v as string | undefined)}
        />
      ) : null}
      {tools.length > 1 ? (
        <ChipRow
          options={toolOptions}
          selected={acquisitionTool}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setAcquisitionTool(v as string | undefined)}
        />
      ) : null}
      {(themes.data?.length ?? 0) > 0 ? (
        <ChipRow
          options={themeOptions}
          selected={themeId}
          getLabel={(o) => o.label}
          getValue={(o) => o.value}
          onSelect={(v) => setThemeId(v as number | undefined)}
        />
      ) : null}

      <Card style={{ gap: 14 }}>
        <View style={styles.filterHeaderRow}>
          <View style={styles.filterTitleRow}>
            <Feather name="sliders" size={14} color={colors.primary} />
            <Text style={[styles.filterTitle, { color: colors.foreground }]}>Filtri avanzati</Text>
          </View>
          {hasActiveFilters ? (
            <Pressable onPress={resetFilters} hitSlop={8} style={styles.resetBtn}>
              <Feather name="x" size={13} color={colors.primary} />
              <Text style={[styles.resetText, { color: colors.primary }]}>Azzera filtri</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.fieldRow}>
          <FilterField label="Importo min €">
            <TextInput
              value={minAmount}
              onChangeText={setMinAmount}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              inputMode="numeric"
              style={[styles.fieldInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </FilterField>
          <FilterField label="Importo max €">
            <TextInput
              value={maxAmount}
              onChangeText={setMaxAmount}
              placeholder="∞"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              inputMode="numeric"
              style={[styles.fieldInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </FilterField>
        </View>

        <View style={styles.fieldRow}>
          <FilterField label="Aggiudicato dal">
            <DateField value={from} onChange={setFrom} placeholder="Da" />
          </FilterField>
          <FilterField label="Aggiudicato al">
            <DateField value={to} onChange={setTo} placeholder="A" />
          </FilterField>
        </View>
      </Card>

      <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
        {items.length} {items.length === 1 ? "risultato" : "risultati"}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <SearchBar value={input} onChangeText={setInput} placeholder="Cerca oggetto, fornitore, CIG…" />
      </View>

      {contracts.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} radius={colors.radius + 2} />
          ))}
        </View>
      ) : contracts.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare gli appalti."
          onRetry={() => contracts.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ContractCard contract={item} onPress={() => router.push(`/contratti/${item.id}`)} />
          )}
          ListHeaderComponent={Header}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState icon="briefcase" title="Nessun appalto" message="Nessun risultato." />
          }
        />
      )}
    </View>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {children}
    </View>
  );
}

function FeedBanner({ feedStatus }: { feedStatus?: { lastUpdatedAt?: string | null; itemsTotal?: number; url?: string | null } }) {
  const colors = useColors();
  const url = feedStatus?.url || ANAC_PORTAL_URL;
  return (
    <Card style={{ gap: 8 }}>
      <View style={styles.feedRow}>
        <Feather name="refresh-cw" size={14} color={colors.primary} />
        <Text style={[styles.feedText, { color: colors.mutedForeground }]}>
          Ultimo aggiornamento:{" "}
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
            {formatDateOpt(feedStatus?.lastUpdatedAt)}
          </Text>
          {feedStatus?.itemsTotal ? ` · ${feedStatus.itemsTotal} contratti` : ""}
        </Text>
      </View>
      <Pressable onPress={() => Linking.openURL(url)} hitSlop={8} style={styles.linkBtn}>
        <Feather name="external-link" size={13} color={colors.primary} />
        <Text style={[styles.link, { color: colors.primary }]}>Portale ANAC – Dati Appalti</Text>
      </Pressable>
    </Card>
  );
}

function Analytics({
  loading,
  analytics,
}: {
  loading: boolean;
  analytics: ContractAnalytics | undefined;
}) {
  const colors = useColors();

  if (loading) {
    return (
      <View style={styles.statGrid}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={86} radius={colors.radius + 2} style={styles.statItem} />
        ))}
      </View>
    );
  }

  if (!analytics || analytics.totalCount === 0) return null;

  const maxBeneficiary = Math.max(1, ...analytics.topBeneficiaries.map((b) => b.value));

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.statGrid}>
        <StatCard
          label="Valore totale"
          value={compactAmount(analytics.totalAmount)}
          icon="dollar-sign"
          highlight
        />
        <StatCard label="Contratti" value={String(analytics.totalCount)} icon="file-text" />
        <StatCard
          label="Senza gara"
          value={`${Math.round(analytics.withoutTenderPct)}%`}
          sub={`${analytics.withoutTenderCount} contratti`}
          icon="award"
        />
        <StatCard
          label="Fuori MePA"
          value={`${Math.round(analytics.withoutMepaPct)}%`}
          sub={`${analytics.withoutMepaCount} contratti`}
          icon="shopping-cart"
        />
      </View>

      {analytics.mostRecurrentBeneficiary ? (
        <Card style={styles.recurrentCard}>
          <View style={[styles.recurrentIcon, { backgroundColor: intentColors("active", colors).bg }]}>
            <Feather name="repeat" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.recurrentLabel, { color: colors.mutedForeground }]}>
              Beneficiario più ricorrente
            </Text>
            <Text style={[styles.recurrentName, { color: colors.foreground }]} numberOfLines={2}>
              {analytics.mostRecurrentBeneficiary.name}
            </Text>
            <Text style={[styles.recurrentCount, { color: colors.mutedForeground }]}>
              {analytics.mostRecurrentBeneficiary.count} contratti
            </Text>
          </View>
        </Card>
      ) : null}

      {analytics.topBeneficiaries.length > 0 ? (
        <Card style={{ gap: 12 }}>
          <View style={styles.sectionTitleRow}>
            <Feather name="users" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Top beneficiari per importo
            </Text>
          </View>
          {analytics.topBeneficiaries.slice(0, 6).map((b) => (
            <View key={b.name} style={{ gap: 5 }}>
              <View style={styles.beneRow}>
                <Text style={[styles.beneName, { color: colors.foreground }]} numberOfLines={1}>
                  {b.name}
                </Text>
                <Text style={[styles.beneValue, { color: colors.primary }]}>
                  {compactAmount(b.value)}
                </Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.max(4, (b.value / maxBeneficiary) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: keyof typeof Feather.glyphMap;
  highlight?: boolean;
}) {
  const colors = useColors();
  const tint = highlight ? colors.primary : colors.mutedForeground;
  const tintBg = highlight ? intentColors("active", colors).bg : colors.muted;
  return (
    <Card style={[styles.statItem, highlight ? { borderColor: colors.primary } : undefined]}>
      <View style={[styles.statIcon, { backgroundColor: tintBg }]}>
        <Feather name={icon} size={15} color={tint} />
      </View>
      <Text style={[styles.statValue, { color: highlight ? colors.primary : colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {sub ? <Text style={[styles.statSub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
    </Card>
  );
}

function ContractCard({ contract, onPress }: { contract: Contract; onPress: () => void }) {
  const colors = useColors();
  const statusIntent = contract.status?.toLowerCase().includes("aggiudic") ? "active" : "monitor";
  const si = intentColors(statusIntent, colors);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ gap: 8 }}>
        <View style={styles.topRow}>
          {contract.procedureType ? (
            <Badge label={contract.procedureType} bg={colors.muted} fg={colors.mutedForeground} />
          ) : null}
          {contract.withoutTender ? (
            <Badge
              label="Senza gara"
              bg={intentColors("warn", colors).bg}
              fg={intentColors("warn", colors).fg}
            />
          ) : null}
          {contract.status ? <Badge label={contract.status} bg={si.bg} fg={si.fg} /> : null}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
          {contract.title}
        </Text>
        <Text style={[styles.supplier, { color: colors.mutedForeground }]} numberOfLines={1}>
          {contract.supplier}
        </Text>
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.amount, { color: colors.primary }]}>
            {contract.amount > 0 ? formatAmount(contract.amount) : "—"}
          </Text>
          <View style={styles.footerRight}>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {formatDateOpt(contract.awardDate)}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 10 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  headerArea: { gap: 12, marginBottom: 12 },
  feedRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  feedText: { fontFamily: "Inter_400Regular", fontSize: 12.5, flex: 1, lineHeight: 17 },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  resultCount: { fontFamily: "Inter_500Medium", fontSize: 12.5 },
  filterHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  filterTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  filterTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14, letterSpacing: -0.2 },
  resetBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  resetText: { fontFamily: "Inter_600SemiBold", fontSize: 12.5 },
  fieldRow: { flexDirection: "row", gap: 12 },
  field: { flex: 1, gap: 5 },
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10.5,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: { width: "47.5%", flexGrow: 1, gap: 6, padding: 14 },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, letterSpacing: -0.5, marginTop: 2 },
  statLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  statSub: { fontFamily: "Inter_400Regular", fontSize: 11 },
  recurrentCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  recurrentIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  recurrentLabel: { fontFamily: "Inter_500Medium", fontSize: 11, letterSpacing: 0.3 },
  recurrentName: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15, letterSpacing: -0.2 },
  recurrentCount: { fontFamily: "Inter_400Regular", fontSize: 12 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16, letterSpacing: -0.2 },
  mapHint: { fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 17 },
  beneRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  beneName: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  beneValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 13 },
  barTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  topRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  title: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  supplier: { fontFamily: "Inter_500Medium", fontSize: 13 },
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
  amount: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 15 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
