import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge, Card, EmptyState, PrimaryButton, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import {
  THEME_STATUS,
  formatAmount,
  formatDate,
  intentColors,
  relevanceAction,
} from "@/lib/civic";
import {
  getGetThemeQueryKey,
  useGetTheme,
  useMarkThemeRelevant,
  useWithdrawThemeRelevant,
  useShareTheme,
  type ShareInputChannel,
} from "@workspace/api-client-react";

type DetailTab = "documenti" | "atti" | "appalti" | "carteggio";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "documenti", label: "Documenti" },
  { key: "atti", label: "Atti Albo" },
  { key: "appalti", label: "Appalti" },
  { key: "carteggio", label: "Carteggio" },
];

const SHARE_CHANNELS: {
  channel: ShareInputChannel;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { channel: "whatsapp", label: "WhatsApp", icon: "message-circle" },
  { channel: "facebook", label: "Facebook", icon: "facebook" },
  { channel: "twitter", label: "X / Twitter", icon: "twitter" },
  { channel: "email", label: "Email", icon: "mail" },
  { channel: "link", label: "Condividi link", icon: "share-2" },
];

export default function ThemeDetailScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id: string }>();
  const themeId = Number(params.id);
  const queryClient = useQueryClient();

  const { data: theme, isLoading, error, refetch } = useGetTheme(themeId);
  const markRelevant = useMarkThemeRelevant();
  const withdrawRelevant = useWithdrawThemeRelevant();
  const shareTheme = useShareTheme();

  const [tab, setTab] = useState<DetailTab>("documenti");
  const [shareOpen, setShareOpen] = useState(false);

  const onMarkRelevant = () => {
    if (!theme) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const mutation = theme.signalled ? withdrawRelevant : markRelevant;
    mutation.mutate(
      { id: themeId },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: getGetThemeQueryKey(themeId) }),
      },
    );
  };

  const onShare = async (channel: ShareInputChannel) => {
    setShareOpen(false);
    if (!theme) return;
    shareTheme.mutate(
      { id: themeId, data: { channel } },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: getGetThemeQueryKey(themeId) }),
      },
    );
    const url = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
    const text = `${theme.title} — Lamezia Trasparente`;
    try {
      if (channel === "link") {
        await Share.share({ message: `${text}\n${url}`, url });
        return;
      }
      let link = "";
      if (channel === "whatsapp")
        link = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
      else if (channel === "facebook")
        link = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      else if (channel === "twitter")
        link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      else if (channel === "email")
        link = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n${url}`)}`;
      if (link) await Linking.openURL(link);
    } catch {
      /* ignore */
    }
  };

  const headerOptions = {
    title: "Tema",
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerTitleStyle: { fontFamily: "SpaceGrotesk_600SemiBold", color: colors.foreground },
    headerShadowVisible: false,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={headerOptions} />
        <View style={{ padding: 20, gap: 14 }}>
          <Skeleton height={20} width="40%" />
          <Skeleton height={34} width="85%" />
          <Skeleton height={18} />
          <Skeleton height={18} width="70%" />
          <Skeleton height={48} radius={colors.radius} />
          <Skeleton height={200} radius={colors.radius + 2} />
        </View>
      </View>
    );
  }

  if (error || !theme) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={headerOptions} />
        <EmptyState
          icon="alert-triangle"
          title="Tema non trovato"
          message="Il contenuto richiesto non è disponibile."
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const status = THEME_STATUS[theme.status] ?? { label: theme.status, intent: "closed" as const };
  const sc = intentColors(status.intent, colors);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={headerOptions} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <Badge label={theme.categoryName} bg={colors.accent} fg={colors.accentForeground} />
          <Badge label={status.label} bg={sc.bg} fg={sc.fg} />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>{theme.title}</Text>
        <Text style={[styles.summary, { color: colors.mutedForeground }]}>{theme.summary}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={relevanceAction(theme.signalled, theme.relevanceCount).label}
              icon={relevanceAction(theme.signalled, theme.relevanceCount).icon}
              variant={theme.signalled ? "outline" : "primary"}
              onPress={onMarkRelevant}
              loading={markRelevant.isPending || withdrawRelevant.isPending}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={`Condividi · ${theme.shareCount}`}
              icon="share-2"
              variant="outline"
              onPress={() => setShareOpen(true)}
            />
          </View>
        </View>

        {/* Description */}
        {theme.description ? (
          <Card style={{ marginTop: 4 }}>
            <Text style={[styles.bodyText, { color: colors.foreground }]}>
              {theme.description}
            </Text>
          </Card>
        ) : null}

        {/* Metrics */}
        {theme.metrics.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Dati chiave</Text>
            <View style={styles.metricGrid}>
              {theme.metrics.map((m) => (
                <View key={m.id} style={styles.metricItem}>
                  <Card style={{ padding: 14 }}>
                    <Text style={[styles.metricValue, { color: colors.primary }]}>
                      {m.value}
                      {m.unit ? (
                        <Text style={[styles.metricUnit, { color: colors.mutedForeground }]}>
                          {" "}
                          {m.unit}
                        </Text>
                      ) : null}
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
                      {m.label}
                    </Text>
                  </Card>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* Tabs */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Documentazione</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map((t) => {
            const active = tab === t.key;
            const count =
              t.key === "documenti"
                ? theme.documents.length
                : t.key === "atti"
                  ? theme.acts.length
                  : t.key === "appalti"
                    ? theme.contracts.length
                    : theme.emails.length;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: 999,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: active ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {t.label} ({count})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ marginTop: 14, gap: 12 }}>
          {tab === "documenti" ? <Documents theme={theme} /> : null}
          {tab === "atti" ? <Acts theme={theme} /> : null}
          {tab === "appalti" ? <Contracts theme={theme} /> : null}
          {tab === "carteggio" ? <Emails theme={theme} /> : null}
        </View>
      </ScrollView>

      {/* Share modal */}
      <Modal visible={shareOpen} transparent animationType="fade" onRequestClose={() => setShareOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShareOpen(false)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Condividi tema</Text>
            {SHARE_CHANNELS.map((ch) => (
              <Pressable
                key={ch.channel}
                onPress={() => onShare(ch.channel)}
                style={({ pressed }) => [
                  styles.shareRow,
                  { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <View style={[styles.shareIcon, { backgroundColor: colors.muted }]}>
                  <Feather name={ch.icon} size={17} color={colors.primary} />
                </View>
                <Text style={[styles.shareLabel, { color: colors.foreground }]}>{ch.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Documents({ theme }: { theme: { documents: any[] } }) {
  const colors = useColors();
  if (theme.documents.length === 0)
    return <EmptyState icon="file" title="Nessun documento" />;
  return (
    <>
      {theme.documents.map((d) => (
        <Pressable
          key={d.id}
          disabled={!d.url}
          onPress={() => d.url && Linking.openURL(d.url)}
        >
          <Card style={styles.docCard}>
            <View style={[styles.docIcon, { backgroundColor: colors.accent }]}>
              <Feather name="file-text" size={17} color={colors.accentForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.docTitle, { color: colors.foreground }]} numberOfLines={2}>
                {d.title}
              </Text>
              <Text style={[styles.docMeta, { color: colors.mutedForeground }]}>
                {d.type} · {formatDate(d.date)}
              </Text>
            </View>
            {d.url ? <Feather name="external-link" size={16} color={colors.mutedForeground} /> : null}
          </Card>
        </Pressable>
      ))}
    </>
  );
}

function Acts({ theme }: { theme: { acts: any[] } }) {
  const colors = useColors();
  if (theme.acts.length === 0) return <EmptyState icon="clipboard" title="Nessun atto" />;
  return (
    <>
      {theme.acts.map((a) => (
        <Card key={a.id} style={{ gap: 6 }}>
          <Badge label={`${a.type} n. ${a.number}`} bg={colors.muted} fg={colors.mutedForeground} />
          <Text style={[styles.docTitle, { color: colors.foreground }]}>{a.title}</Text>
          <Text style={[styles.bodyText, { color: colors.mutedForeground }]} numberOfLines={3}>
            {a.summary}
          </Text>
          <Text style={[styles.docMeta, { color: colors.mutedForeground }]}>
            Pubblicato {formatDate(a.publishDate)}
          </Text>
        </Card>
      ))}
    </>
  );
}

function Contracts({ theme }: { theme: { contracts: any[] } }) {
  const colors = useColors();
  if (theme.contracts.length === 0) return <EmptyState icon="briefcase" title="Nessun appalto" />;
  return (
    <>
      {theme.contracts.map((c) => (
        <Card key={c.id} style={{ gap: 6 }}>
          <View style={styles.contractTop}>
            <Text style={[styles.contractAmount, { color: colors.primary }]}>
              {formatAmount(c.amount)}
            </Text>
            <Badge label={c.status} bg={colors.muted} fg={colors.mutedForeground} />
          </View>
          <Text style={[styles.docTitle, { color: colors.foreground }]}>{c.title}</Text>
          <Text style={[styles.bodyText, { color: colors.mutedForeground }]} numberOfLines={2}>
            {c.description}
          </Text>
          <View style={[styles.contractFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.docMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
              {c.supplier}
            </Text>
            <Text style={[styles.docMeta, { color: colors.mutedForeground }]}>
              {formatDate(c.awardDate)}
            </Text>
          </View>
        </Card>
      ))}
    </>
  );
}

function Emails({ theme }: { theme: { emails: any[] } }) {
  const colors = useColors();
  if (theme.emails.length === 0) return <EmptyState icon="mail" title="Nessuna corrispondenza" />;
  return (
    <>
      {theme.emails.map((e) => {
        const sent = e.direction === "inviata";
        return (
          <Card key={e.id} style={{ gap: 6 }}>
            <Badge
              label={sent ? "Inviata" : "Ricevuta"}
              bg={sent ? intentColors("active", colors).bg : intentColors("info", colors).bg}
              fg={sent ? intentColors("active", colors).fg : intentColors("info", colors).fg}
              icon={sent ? "arrow-up-right" : "arrow-down-left"}
            />
            <Text style={[styles.docTitle, { color: colors.foreground }]}>{e.subject}</Text>
            <Text style={[styles.docMeta, { color: colors.mutedForeground }]}>
              Da {e.sender} · A {e.recipient}
            </Text>
            <Text style={[styles.bodyText, { color: colors.foreground }]} numberOfLines={4}>
              {e.body}
            </Text>
            <Text style={[styles.docMeta, { color: colors.mutedForeground }]}>
              {formatDate(e.date)}
            </Text>
          </Card>
        );
      })}
    </>
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
    fontSize: 26,
    lineHeight: 33,
    letterSpacing: -0.5,
  },
  summary: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  bodyText: { fontFamily: "Inter_400Regular", fontSize: 14.5, lineHeight: 22 },
  sectionTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 19,
    letterSpacing: -0.3,
    marginTop: 26,
    marginBottom: 12,
  },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  metricItem: { width: "50%", padding: 5 },
  metricValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 22 },
  metricUnit: { fontFamily: "Inter_500Medium", fontSize: 13 },
  metricLabel: { fontFamily: "Inter_500Medium", fontSize: 12.5, marginTop: 4 },
  tabRow: { gap: 8, paddingVertical: 2 },
  tab: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1 },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  docCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  docIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  docTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, lineHeight: 20 },
  docMeta: { fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: 3 },
  contractTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contractAmount: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 19 },
  contractFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    paddingBottom: Platform.OS === "web" ? 30 : 40,
    gap: 4,
  },
  modalTitle: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 18,
    marginBottom: 10,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  shareIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  shareLabel: { fontFamily: "Inter_500Medium", fontSize: 15 },
});
