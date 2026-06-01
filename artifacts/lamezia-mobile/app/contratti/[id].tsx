import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { InterventionsMap } from "../../components/InterventionsMap";
import { useColors } from "@/hooks/useColors";
import { formatAmount, formatDateOpt, intentColors } from "@/lib/civic";
import { quartiereLabel } from "@/lib/gis";
import {
  useGetContract,
  useGetContractStoryline,
  type StorylineEvent,
  type LifecyclePhase,
  type StorylineStatus,
} from "@workspace/api-client-react";

const PHASE_META: Record<
  LifecyclePhase,
  { label: string; icon: keyof typeof Feather.glyphMap }
> = {
  affidamento: { label: "Affidamento", icon: "award" },
  contratto: { label: "Contratto", icon: "file-text" },
  variante: { label: "Variante", icon: "git-branch" },
  liquidazione: { label: "Liquidazione", icon: "dollar-sign" },
  collaudo: { label: "Collaudo / chiusura", icon: "check-circle" },
  altro: { label: "Altro atto", icon: "circle" },
};

const STATUS_LABEL: Record<StorylineStatus, string> = {
  liquidato: "Liquidato",
  in_corso: "In corso",
  nessuna_liquidazione: "Nessuna liquidazione registrata",
};

export default function ContractDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const contract = useGetContract(Number(id));
  const storyline = useGetContractStoryline(Number(id));

  if (contract.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
        <Skeleton height={140} radius={colors.radius + 2} />
        <Skeleton height={220} radius={colors.radius + 2} />
      </View>
    );
  }

  if (contract.isError || !contract.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare il contratto."
          onRetry={() => contract.refetch()}
        />
      </View>
    );
  }

  const c = contract.data;
  const warn = intentColors("warn", colors);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card style={{ gap: 12 }}>
        <View style={styles.badgeRow}>
          {c.cig ? <Badge label={`CIG ${c.cig}`} bg={intentColors("active", colors).bg} fg={colors.primary} /> : null}
          {c.cup ? <Badge label={`CUP ${c.cup}`} bg={colors.muted} fg={colors.mutedForeground} /> : null}
          {c.withoutTender ? <Badge label="Senza gara" bg={warn.bg} fg={warn.fg} /> : null}
          {c.withoutMepa ? <Badge label="Fuori MePA" bg={colors.muted} fg={colors.mutedForeground} /> : null}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{c.title}</Text>
        {c.description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{c.description}</Text>
        ) : null}
      </Card>

      <Card style={{ gap: 2 }}>
        <MetaRow icon="dollar-sign" label="Importo" value={c.amount > 0 ? formatAmount(c.amount) : "Non disponibile"} />
        <MetaRow icon="briefcase" label="Beneficiario" value={c.supplier} />
        <MetaRow icon="award" label="Modalità di scelta" value={c.procedureType} />
        <MetaRow icon="shopping-cart" label="Strumento di acquisto" value={c.acquisitionTool ?? "Non specificato"} />
        <MetaRow icon="home" label="Stazione appaltante" value={c.stazioneAppaltante ?? "Comune di Lamezia Terme"} />
        <MetaRow icon="calendar" label="Data" value={formatDateOpt(c.awardDate)} />
        <MetaRow icon="tag" label="Stato" value={c.status} last />
      </Card>

      {typeof c.latitude === "number" && typeof c.longitude === "number" ? (
        <Card style={{ gap: 10 }}>
          <View style={styles.locTitleRow}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.locTitle, { color: colors.foreground }]}>
              Luogo dell'intervento
            </Text>
          </View>
          {c.geoAddress || c.geoQuartiere ? (
            <Text style={[styles.locText, { color: colors.mutedForeground }]}>
              {[c.geoAddress, quartiereLabel(c.geoQuartiere)]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          ) : null}
          <InterventionsMap contracts={[c]} height={220} showBoundary={false} />
          {c.geoVerify ? (
            <View style={[styles.verifyRow, { backgroundColor: warn.bg }]}>
              <Feather name="alert-triangle" size={13} color={warn.fg} />
              <Text style={[styles.verifyText, { color: warn.fg }]}>
                Posizione approssimata, in attesa di verifica redazionale.
              </Text>
            </View>
          ) : null}
        </Card>
      ) : null}

      <StorylineSection
        loading={storyline.isLoading}
        data={storyline.data}
      />

      {c.anacUrl ? (
        <Pressable
          onPress={() => Linking.openURL(c.anacUrl as string)}
          hitSlop={8}
          style={styles.linkBtn}
        >
          <Feather name="external-link" size={15} color={colors.primary} />
          <Text style={[styles.link, { color: colors.primary }]}>Scheda ufficiale su ANAC</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function StorylineSection({
  loading,
  data,
}: {
  loading: boolean;
  data:
    | {
        timeline: StorylineEvent[];
        indicators: {
          evidenceCount: number;
          daysToFirstLiquidazione: number | null;
          liquidatedAmount: number | null;
          extraAmount: number | null;
          costOverrunPct: number | null;
          status: StorylineStatus;
        };
      }
    | undefined;
}) {
  const colors = useColors();

  if (loading) {
    return <Skeleton height={200} radius={colors.radius + 2} />;
  }
  if (!data) return null;

  const { timeline, indicators } = data;

  return (
    <Card style={{ gap: 14 }}>
      <View style={styles.locTitleRow}>
        <Feather name="git-commit" size={16} color={colors.primary} />
        <Text style={[styles.locTitle, { color: colors.foreground }]}>
          Ciclo di vita della spesa
        </Text>
      </View>

      <View style={styles.indicatorRow}>
        <Indicator
          label="Evidenze"
          value={String(indicators.evidenceCount)}
        />
        <Indicator
          label="1ª liquidazione"
          value={
            indicators.daysToFirstLiquidazione != null
              ? `${indicators.daysToFirstLiquidazione} gg`
              : "—"
          }
        />
        <Indicator
          label="Aumento costo"
          value={
            indicators.extraAmount != null
              ? `+${formatAmount(indicators.extraAmount)}`
              : "—"
          }
          sub={
            indicators.costOverrunPct != null
              ? `+${indicators.costOverrunPct.toFixed(1)}%`
              : undefined
          }
        />
      </View>

      <Badge
        label={STATUS_LABEL[indicators.status]}
        bg={
          indicators.status === "liquidato"
            ? intentColors("active", colors).bg
            : indicators.status === "in_corso"
              ? colors.muted
              : intentColors("warn", colors).bg
        }
        fg={
          indicators.status === "liquidato"
            ? colors.primary
            : indicators.status === "in_corso"
              ? colors.mutedForeground
              : intentColors("warn", colors).fg
        }
      />

      {timeline.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Nessuna evidenza dell'Albo Pretorio collegata a questo appalto tramite
          CIG o CUP. La storyline si arricchirà con le nuove pubblicazioni.
        </Text>
      ) : (
        <View style={{ gap: 12 }}>
          {timeline.map((event) => (
            <TimelineRow key={event.publicationId} event={event} />
          ))}
        </View>
      )}
    </Card>
  );
}

function TimelineRow({ event }: { event: StorylineEvent }) {
  const colors = useColors();
  const meta = PHASE_META[event.phase] ?? PHASE_META.altro;
  return (
    <View style={styles.timelineRow}>
      <View
        style={[
          styles.timelineIcon,
          { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
      >
        <Feather name={meta.icon} size={15} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={styles.timelineHead}>
          <Text style={[styles.timelinePhase, { color: colors.foreground }]}>
            {meta.label}
          </Text>
          <Text style={[styles.timelineDate, { color: colors.mutedForeground }]}>
            {formatDateOpt(event.date)}
          </Text>
        </View>
        <Text style={[styles.timelineMeta, { color: colors.mutedForeground }]}>
          {event.tipologia} · collegato via {event.matchedBy.toUpperCase()}
        </Text>
        <Text style={[styles.timelineText, { color: colors.foreground }]}>
          {event.oggetto}
        </Text>
        {event.estimatedAmount != null ? (
          <Text style={[styles.timelineMeta, { color: colors.mutedForeground }]}>
            Importo citato: {formatAmount(event.estimatedAmount)} (stima)
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function Indicator({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={[styles.indicatorValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.indicatorLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      {sub ? (
        <Text style={[styles.indicatorSub, { color: colors.mutedForeground }]}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

function MetaRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | null | undefined;
  last?: boolean;
}) {
  const colors = useColors();
  if (!value) return null;
  return (
    <View style={[styles.metaRow, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Feather name={icon} size={16} color={colors.mutedForeground} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{label.toUpperCase()}</Text>
        <Text style={[styles.metaValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 14,
    paddingBottom: Platform.OS === "web" ? 80 : 48,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  title: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 20,
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  description: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  metaRow: { flexDirection: "row", gap: 10, paddingVertical: 11 },
  metaLabel: { fontFamily: "Inter_500Medium", fontSize: 10.5, letterSpacing: 0.4 },
  metaValue: { fontFamily: "Inter_500Medium", fontSize: 14, marginTop: 2, lineHeight: 19 },
  locTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  locTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16, letterSpacing: -0.2 },
  locText: { fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 18 },
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  verifyText: { fontFamily: "Inter_500Medium", fontSize: 12, flex: 1, lineHeight: 16 },
  linkBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 6 },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  indicatorRow: { flexDirection: "row", gap: 12 },
  indicatorValue: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  indicatorLabel: { fontFamily: "Inter_500Medium", fontSize: 11, lineHeight: 14 },
  indicatorSub: { fontFamily: "Inter_400Regular", fontSize: 10.5 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  timelineRow: { flexDirection: "row", gap: 10 },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  timelinePhase: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14 },
  timelineDate: { fontFamily: "Inter_500Medium", fontSize: 11.5 },
  timelineMeta: { fontFamily: "Inter_400Regular", fontSize: 11.5, lineHeight: 16 },
  timelineText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
});
