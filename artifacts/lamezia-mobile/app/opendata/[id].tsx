import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ResourceTable } from "@/components/ResourceTable";
import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatDateOpt } from "@/lib/civic";
import {
  useGetOpendataDataset,
  type OpendataResource,
} from "@workspace/api-client-react";

export default function OpendataDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dataset = useGetOpendataDataset(Number(id));

  if (dataset.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
        <Skeleton height={140} radius={colors.radius + 2} />
        <Skeleton height={200} radius={colors.radius + 2} />
      </View>
    );
  }

  if (dataset.isError || !dataset.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="database"
          title="Dataset non trovato"
          message="Il dataset richiesto non è disponibile."
          onRetry={() => dataset.refetch()}
        />
      </View>
    );
  }

  const d = dataset.data;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card style={{ gap: 12 }}>
        <View style={styles.badgeRow}>
          {d.category ? (
            <Badge label={d.category} bg={colors.accent} fg={colors.accentForeground} icon="layers" />
          ) : null}
          {d.theme ? (
            <Badge label={d.theme} bg={colors.muted} fg={colors.mutedForeground} icon="tag" />
          ) : null}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{d.title}</Text>
        {d.description ? (
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{d.description}</Text>
        ) : null}
      </Card>

      <Card style={{ gap: 2 }}>
        <MetaRow icon="file" label="Risorse" value={String(d.resourceCount)} />
        <MetaRow icon="refresh-cw" label="Aggiornamento" value={formatDateOpt(d.metadataModified)} />
        <MetaRow icon="calendar" label="Frequenza" value={d.frequency} />
        <MetaRow icon="home" label="Titolare" value={d.holderName} />
        <MetaRow icon="file-text" label="Licenza" value={d.licenseTitle ?? d.licenseId} last />
      </Card>

      {d.tags && d.tags.length > 0 ? (
        <Card style={{ gap: 8 }}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TAG</Text>
          <View style={styles.tagRow}>
            {d.tags.map((t) => (
              <Badge key={t} label={t} bg={colors.muted} fg={colors.mutedForeground} />
            ))}
          </View>
        </Card>
      ) : null}

      {d.portalUrl ? (
        <Pressable
          onPress={() => Linking.openURL(d.portalUrl as string)}
          hitSlop={8}
          style={styles.portalBtn}
        >
          <Feather name="external-link" size={15} color={colors.primary} />
          <Text style={[styles.portalText, { color: colors.primary }]}>
            Scheda ufficiale sul portale Opendata
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.resourcesHeader}>
        <Feather name="grid" size={17} color={colors.primary} />
        <Text style={[styles.resourcesTitle, { color: colors.foreground }]}>Risorse</Text>
      </View>

      <View style={{ gap: 12 }}>
        {d.resources.map((r) => (
          <ResourceItem key={r.id} resource={r} />
        ))}
      </View>
    </ScrollView>
  );
}

function ResourceItem({ resource }: { resource: OpendataResource }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);

  return (
    <Card style={{ gap: 10 }}>
      <View style={styles.resourceTop}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[styles.resourceName, { color: colors.foreground }]} numberOfLines={2}>
            {resource.name}
          </Text>
          <View style={styles.resourceBadges}>
            {resource.format ? (
              <Badge label={resource.format.toUpperCase()} bg={colors.muted} fg={colors.mutedForeground} />
            ) : null}
            {resource.tabular ? (
              <Badge label="Anteprima" bg={colors.accent} fg={colors.accentForeground} />
            ) : null}
          </View>
          {resource.description ? (
            <Text style={[styles.resourceDesc, { color: colors.mutedForeground }]} numberOfLines={3}>
              {resource.description}
            </Text>
          ) : null}
          {resource.lastModified ? (
            <Text style={[styles.resourceMeta, { color: colors.mutedForeground }]}>
              Aggiornata il {formatDateOpt(resource.lastModified)}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.resourceActions}>
        {resource.tabular ? (
          <Pressable
            onPress={() => setOpen((v) => !v)}
            style={[styles.actionBtn, { borderColor: colors.border }]}
          >
            <Feather name="grid" size={14} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>
              {open ? "Nascondi" : "Anteprima"}
            </Text>
            <Feather name={open ? "chevron-up" : "chevron-down"} size={14} color={colors.foreground} />
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => Linking.openURL(resource.url)}
          style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
        >
          <Feather name="download" size={14} color={colors.primaryForeground} />
          <Text style={[styles.actionText, { color: colors.primaryForeground }]}>Scarica</Text>
        </Pressable>
      </View>

      {resource.tabular && open ? (
        <View style={[styles.previewWrap, { borderTopColor: colors.border }]}>
          <ResourceTable resourceId={resource.id} />
        </View>
      ) : null}
    </Card>
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
  if (!value || value === "—") return null;
  return (
    <View
      style={[
        styles.metaRow,
        !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
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
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10.5, letterSpacing: 0.4 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  portalBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 6 },
  portalText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  resourcesHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  resourcesTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, letterSpacing: -0.3 },
  resourceTop: { flexDirection: "row", gap: 10 },
  resourceName: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15, lineHeight: 20, letterSpacing: -0.2 },
  resourceBadges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  resourceDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  resourceMeta: { fontFamily: "Inter_400Regular", fontSize: 12 },
  resourceActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  actionText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  previewWrap: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, marginTop: 2 },
});
