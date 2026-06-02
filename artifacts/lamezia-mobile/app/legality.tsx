import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt } from "@/lib/civic";
import {
  useGetLegalitySection,
  type LegalityActLink,
  type LegalityAreaWithRequirements,
  type LegalityRequirement,
  type LegalityRequirementStatus,
} from "@workspace/api-client-react";

type StatusMeta = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  tone: "success" | "destructive" | "warning" | "muted";
};

const STATUS_META: Record<LegalityRequirementStatus, StatusMeta> = {
  present: { label: "Presente", icon: "check-circle", tone: "success" },
  absent: { label: "Assente", icon: "x-circle", tone: "destructive" },
  partial: { label: "Parziale", icon: "alert-circle", tone: "warning" },
  not_applicable: {
    label: "Non applicabile",
    icon: "minus-circle",
    tone: "muted",
  },
};

function statusMeta(status: string): StatusMeta {
  return (
    STATUS_META[status as LegalityRequirementStatus] ??
    STATUS_META.not_applicable
  );
}

export default function LegalityScreen() {
  const colors = useColors();
  const { data, isLoading, isError, refetch } = useGetLegalitySection();

  const areas = data?.areas ?? [];
  const overall = data?.overallJudgment?.trim();
  const hasContent = areas.length > 0 || Boolean(overall);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 12 }}>
          <Skeleton height={120} radius={colors.radius + 2} />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={140} radius={colors.radius + 2} />
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Impossibile recuperare il monitoraggio su legalità e trasparenza."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  if (!hasContent) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="shield"
          title="Sezione in preparazione"
          message="Il monitoraggio su legalità e trasparenza non è ancora stato pubblicato. La Redazione lo aggiorna nel tempo."
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
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          Monitoriamo l'impegno del Comune di Lamezia Terme su trasparenza,
          partecipazione democratica, antiriciclaggio e contrasto alla
          criminalità organizzata. Tutte le valutazioni sono redazionali.
        </Text>

        {overall ? (
          <OverallJudgment text={overall} updatedAt={data?.updatedAt} />
        ) : null}

        {areas.map((area) => (
          <AreaSection key={area.id} area={area} />
        ))}
      </ScrollView>
    </View>
  );
}

function OverallJudgment({
  text,
  updatedAt,
}: {
  text: string;
  updatedAt?: string | null;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.overall,
        {
          backgroundColor: colors.accent,
          borderColor: colors.primary,
          borderRadius: colors.radius + 2,
        },
      ]}
    >
      <View style={styles.overallHeader}>
        <Feather name="shield" size={16} color={colors.primary} />
        <Text style={[styles.overallTitle, { color: colors.foreground }]}>
          Giudizio complessivo della Redazione
        </Text>
      </View>
      <Text style={[styles.overallText, { color: colors.foreground }]}>
        {text}
      </Text>
      {updatedAt ? (
        <View style={styles.updatedRow}>
          <Feather name="refresh-cw" size={12} color={colors.mutedForeground} />
          <Text style={[styles.updatedText, { color: colors.mutedForeground }]}>
            Aggiornato il {formatDateOpt(updatedAt)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function AreaSection({ area }: { area: LegalityAreaWithRequirements }) {
  const colors = useColors();
  const requirements = area.requirements ?? [];
  const finalJudgment = area.finalJudgment?.trim();

  return (
    <View style={styles.area}>
      <View style={[styles.areaHeader, { borderLeftColor: colors.primary }]}>
        <Text style={[styles.areaTitle, { color: colors.foreground }]}>
          {area.title}
        </Text>
        {area.description ? (
          <Text style={[styles.areaDesc, { color: colors.mutedForeground }]}>
            {area.description}
          </Text>
        ) : null}
      </View>

      {requirements.length > 0 ? (
        <View style={{ gap: 12 }}>
          {requirements.map((req) => (
            <RequirementCard key={req.id} requirement={req} />
          ))}
        </View>
      ) : (
        <Card>
          <Text style={[styles.emptyReq, { color: colors.mutedForeground }]}>
            Nessun requisito ancora pubblicato per quest'area.
          </Text>
        </Card>
      )}

      {finalJudgment ? (
        <View
          style={[
            styles.judgment,
            {
              backgroundColor: colors.muted,
              borderRadius: colors.radius + 2,
            },
          ]}
        >
          <View style={styles.judgmentHeader}>
            <Feather name="message-square" size={13} color={colors.primary} />
            <Text style={[styles.judgmentLabel, { color: colors.foreground }]}>
              Giudizio della Redazione su quest'area
            </Text>
          </View>
          <Text style={[styles.judgmentText, { color: colors.foreground }]}>
            {finalJudgment}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function RequirementCard({
  requirement,
}: {
  requirement: LegalityRequirement;
}) {
  const colors = useColors();
  const meta = statusMeta(requirement.status);

  const toneBg = {
    success: colors.success,
    destructive: colors.destructive,
    warning: colors.warning,
    muted: colors.muted,
  }[meta.tone];
  const toneFg = {
    success: colors.successForeground,
    destructive: colors.destructiveForeground,
    warning: colors.warningForeground,
    muted: colors.mutedForeground,
  }[meta.tone];

  const comment = requirement.comment?.trim();
  const linkedActs = requirement.linkedActs ?? [];

  return (
    <Card style={{ gap: 10 }}>
      <View style={styles.reqHeader}>
        <Text
          style={[styles.reqTitle, { color: colors.foreground }]}
        >
          {requirement.title}
        </Text>
        <Badge label={meta.label} bg={toneBg} fg={toneFg} icon={meta.icon} />
      </View>

      {requirement.description ? (
        <Text style={[styles.reqDesc, { color: colors.mutedForeground }]}>
          {requirement.description}
        </Text>
      ) : null}

      {comment ? (
        <Text
          style={[
            styles.reqComment,
            { color: colors.foreground, borderLeftColor: colors.border },
          ]}
        >
          {comment}
        </Text>
      ) : null}

      {linkedActs.length > 0 ? (
        <View style={{ gap: 6, marginTop: 2 }}>
          <Text style={[styles.actsLabel, { color: colors.mutedForeground }]}>
            ATTI COLLEGATI
          </Text>
          {linkedActs.map((act, i) => (
            <ActLink key={`${act.url}-${i}`} act={act} />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function resolveActUrl(url: string): string {
  const isInternal = url.startsWith("/") && !url.startsWith("//");
  if (isInternal) {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    return domain ? `https://${domain}${url}` : url;
  }
  return url;
}

function ActLink({ act }: { act: LegalityActLink }) {
  const colors = useColors();
  const isInternal = act.url.startsWith("/") && !act.url.startsWith("//");
  return (
    <Pressable
      onPress={() => Linking.openURL(resolveActUrl(act.url))}
      hitSlop={6}
      style={styles.actLink}
    >
      <Feather
        name={isInternal ? "file-text" : "external-link"}
        size={13}
        color={colors.primary}
      />
      <Text style={[styles.actLinkText, { color: colors.primary }]}>
        {act.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
    gap: 18,
  },
  intro: {
    fontFamily: "Inter_400Regular",
    fontSize: 13.5,
    lineHeight: 20,
  },
  overall: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  overallHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  overallTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15,
    letterSpacing: -0.2,
    flex: 1,
  },
  overallText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  updatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  updatedText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  area: { gap: 12 },
  areaHeader: { borderLeftWidth: 2, paddingLeft: 10, gap: 3 },
  areaTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  areaDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  emptyReq: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19 },
  reqHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  reqTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: -0.2,
    flex: 1,
  },
  reqDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13.5,
    lineHeight: 19,
  },
  reqComment: {
    fontFamily: "Inter_400Regular",
    fontSize: 13.5,
    lineHeight: 20,
    borderLeftWidth: 2,
    paddingLeft: 10,
  },
  actsLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10.5,
    letterSpacing: 0.8,
  },
  actLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  actLinkText: { fontFamily: "Inter_600SemiBold", fontSize: 13.5, flex: 1 },
  judgment: { padding: 14, gap: 6, marginTop: 2 },
  judgmentHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  judgmentLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  judgmentText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13.5,
    lineHeight: 20,
  },
});
