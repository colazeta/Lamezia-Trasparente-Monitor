import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, EmptyState, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { formatAmount, formatDateOpt, intentColors } from "@/lib/civic";
import { macrotemaColor, macrotemaLabel } from "@/lib/gis";
import {
  useGetPublication,
  useGetPublicationStoria,
  type PublicationAttachment,
  type PublicationStoria,
} from "@workspace/api-client-react";

const ALBO_PORTAL_URL =
  "https://lameziaterme.trasparenza-valutazione-merito.it/web/trasparenza/albo-pretorio";

function resolveUrl(url: string): string {
  const isInternal = url.startsWith("/") && !url.startsWith("//");
  if (isInternal) {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    return domain ? `https://${domain}${url}` : url;
  }
  return url;
}

function attachmentHref(att: PublicationAttachment): string {
  const candidate = att.storagePath
    ? resolveUrl(att.storagePath)
    : att.officialUrl;
  if (candidate.startsWith("/")) {
    return att.officialUrl;
  }
  return candidate;
}

export default function AlboDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const numId = Number(id);
  const publication = useGetPublication(numId);
  const storia = useGetPublicationStoria(numId);

  if (publication.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
        <Skeleton height={150} radius={colors.radius + 2} />
        <Skeleton height={120} radius={colors.radius + 2} />
      </View>
    );
  }

  if (publication.isError || !publication.data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="file-text"
          title="Atto non trovato"
          message="L'atto richiesto non esiste o non è più disponibile."
          onRetry={() => publication.refetch()}
        />
      </View>
    );
  }

  const p = publication.data;
  const newColor = intentColors("alert", colors);
  const showMacrotema = p.macrotema && p.macrotema !== "altro";
  const attachments = p.attachments ?? [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card style={{ gap: 12 }}>
        <View style={styles.badgeRow}>
          <Badge label={p.tipologia || p.category} bg={colors.muted} fg={colors.mutedForeground} />
          {p.isNew ? <Badge label="Nuovo" bg={newColor.bg} fg={newColor.fg} /> : null}
          {p.isPnrr ? (
            <Badge label="PNRR" bg={colors.accent} fg={colors.accentForeground} icon="trending-up" />
          ) : null}
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{p.oggetto}</Text>
        {p.provenienza ? (
          <Text style={[styles.provenienza, { color: colors.mutedForeground }]}>
            {p.provenienza}
          </Text>
        ) : null}
        <View style={styles.metaPills}>
          {showMacrotema ? (
            <Badge
              label={macrotemaLabel(p.macrotema)}
              bg={`${macrotemaColor(p.macrotema)}22`}
              fg={macrotemaColor(p.macrotema)}
              icon="layers"
            />
          ) : null}
          {p.numRegGen ? (
            <Text style={[styles.regGen, { color: colors.mutedForeground }]}>
              Reg. gen. {p.numRegGen}
            </Text>
          ) : null}
        </View>
        <View style={styles.dateRow}>
          <Feather name="calendar" size={13} color={colors.mutedForeground} />
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
            {formatDateOpt(p.dataAtto ?? p.pubStart)}
            {p.pubEnd ? ` · pubblicato fino al ${formatDateOpt(p.pubEnd)}` : ""}
          </Text>
        </View>
      </Card>

      {p.brief ? (
        <Card style={{ gap: 10, borderColor: colors.primary, backgroundColor: intentColors("active", colors).bg }}>
          <View style={styles.sectionTitleRow}>
            <Feather name="book-open" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>In breve</Text>
          </View>
          <Text style={[styles.briefText, { color: colors.foreground }]}>{p.brief}</Text>
        </Card>
      ) : null}

      <Card style={{ gap: 12 }}>
        <View style={styles.sectionTitleRow}>
          <Feather name="file-text" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Documenti e allegati
          </Text>
        </View>
        {attachments.length > 0 ? (
          <View style={{ gap: 4 }}>
            {attachments.map((att, i) => (
              <Pressable
                key={`${att.officialUrl}-${i}`}
                onPress={() => Linking.openURL(attachmentHref(att))}
                hitSlop={6}
                style={({ pressed }) => [styles.attachmentRow, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Feather
                  name={att.storagePath ? "download" : "file-text"}
                  size={15}
                  color={colors.primary}
                />
                <Text style={[styles.attachmentName, { color: colors.primary }]} numberOfLines={2}>
                  {att.name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable
            onPress={() => Linking.openURL(ALBO_PORTAL_URL)}
            hitSlop={6}
            style={({ pressed }) => [styles.attachmentRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="external-link" size={15} color={colors.primary} />
            <Text style={[styles.attachmentName, { color: colors.primary }]}>
              Consulta sull'Albo ufficiale
            </Text>
          </Pressable>
        )}
      </Card>

      <StoriaSection loading={storia.isLoading} data={storia.data} />
    </ScrollView>
  );
}

function StoriaSection({
  loading,
  data,
}: {
  loading: boolean;
  data: PublicationStoria | undefined;
}) {
  const colors = useColors();

  if (loading) {
    return <Skeleton height={160} radius={colors.radius + 2} />;
  }

  const hasLinks =
    !!data &&
    (data.contracts.length > 0 ||
      data.pnrrProjects.length > 0 ||
      data.siblings.length > 0 ||
      data.originatingSeduta !== null);

  return (
    <Card style={{ gap: 14 }}>
      <View style={styles.sectionTitleRow}>
        <Feather name="git-merge" size={16} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Storia collegata
        </Text>
      </View>
      <Text style={[styles.storiaHint, { color: colors.mutedForeground }]}>
        Contratti, progetti PNRR e altri atti dell'Albo collegati a questa
        pubblicazione tramite CIG o CUP.
      </Text>

      {!hasLinks || !data ? (
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Nessun contratto, progetto PNRR o altro atto collegabile a questa
          pubblicazione tramite CIG o CUP.
        </Text>
      ) : (
        <View style={{ gap: 18 }}>
          {data.originatingSeduta ? (
            <StoriaGroup icon="users" label="Seduta di origine">
              <StoriaItem
                title={data.originatingSeduta.oggetto}
                subtitle={[
                  formatDateOpt(data.originatingSeduta.pubStart),
                  data.originatingSeduta.subcategory ?? undefined,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                onPress={() =>
                  router.push(`/convocazioni/${data.originatingSeduta!.id}`)
                }
              />
            </StoriaGroup>
          ) : null}

          {data.contracts.length > 0 ? (
            <StoriaGroup
              icon="briefcase"
              label={`Appalti e contratti (${data.contracts.length})`}
            >
              {data.contracts.map((c) => (
                <StoriaItem
                  key={c.id}
                  title={c.title}
                  subtitle={[
                    c.cig ? `CIG ${c.cig}` : undefined,
                    c.amount > 0 ? formatAmount(c.amount) : undefined,
                    `via ${c.matchedBy.toUpperCase()}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  onPress={() => router.push(`/contratti/${c.id}`)}
                />
              ))}
            </StoriaGroup>
          ) : null}

          {data.pnrrProjects.length > 0 ? (
            <StoriaGroup
              icon="trending-up"
              label={`Progetti PNRR (${data.pnrrProjects.length})`}
            >
              {data.pnrrProjects.map((pr) => (
                <StoriaItem
                  key={pr.id}
                  title={pr.title}
                  subtitle={[`CUP ${pr.cup}`, pr.mission ?? undefined]
                    .filter(Boolean)
                    .join(" · ")}
                  onPress={() => router.push("/pnrr")}
                />
              ))}
            </StoriaGroup>
          ) : null}

          {data.siblings.length > 0 ? (
            <StoriaGroup
              icon="git-merge"
              label={`Atti collegati (${data.siblings.length})`}
            >
              {data.siblings.map((s) => (
                <StoriaItem
                  key={s.id}
                  title={s.oggetto}
                  subtitle={[
                    s.tipologia,
                    formatDateOpt(s.pubStart),
                    `via ${s.matchedBy.toUpperCase()}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  onPress={() => router.push(`/albo/${s.id}`)}
                />
              ))}
            </StoriaGroup>
          ) : null}
        </View>
      )}
    </Card>
  );
}

function StoriaGroup({
  icon,
  label,
  children,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.groupTitleRow}>
        <Feather name={icon} size={13} color={colors.mutedForeground} />
        <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>
          {label.toUpperCase()}
        </Text>
      </View>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

function StoriaItem({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.storiaItem,
        { borderColor: colors.border, backgroundColor: colors.background, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[styles.storiaItemTitle, { color: colors.foreground }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.storiaItemSub, { color: colors.mutedForeground }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
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
  provenienza: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19 },
  metaPills: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
  regGen: { fontFamily: "Inter_500Medium", fontSize: 12 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontFamily: "Inter_500Medium", fontSize: 12.5, flex: 1 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16, letterSpacing: -0.2 },
  briefText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  attachmentRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  attachmentName: { fontFamily: "Inter_600SemiBold", fontSize: 13.5, flex: 1, lineHeight: 18 },
  storiaHint: { fontFamily: "Inter_400Regular", fontSize: 12.5, lineHeight: 17 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  groupTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  groupTitle: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.5 },
  storiaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  storiaItemTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 14, lineHeight: 19 },
  storiaItemSub: { fontFamily: "Inter_400Regular", fontSize: 11.5, lineHeight: 16 },
});
