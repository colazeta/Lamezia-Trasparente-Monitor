import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ThemeCard } from "@/components/ThemeCard";
import { Card, EmptyState, NoticeBanner, ScreenHeader, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import {
  MONITORING_NOTICE_BODY,
  MONITORING_NOTICE_TITLE,
} from "@/lib/monitoring";
import { compactAmount, formatDate, questionIcon, resolveQuestionHref } from "@/lib/civic";
import {
  useGetRecentActivity,
  useGetStatsOverview,
  useGetTopThemes,
  useListQuestions,
  type Question,
} from "@workspace/api-client-react";
import type { Href } from "expo-router";

const ACTIVITY_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  theme: "folder",
  contract: "file-text",
  act: "clipboard",
  report: "alert-triangle",
};

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const stats = useGetStatsOverview();
  const top = useGetTopThemes();
  const activity = useGetRecentActivity();
  const questions = useListQuestions();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      stats.refetch(),
      top.refetch(),
      activity.refetch(),
      questions.refetch(),
    ]);
    setRefreshing(false);
  }, [stats, top, activity, questions]);

  const homeQuestions = React.useMemo(() => {
    const list = questions.data ?? [];
    const featured = list.filter((q) => q.featured);
    const ordered = featured.length > 0 ? featured : list;
    return ordered.slice(0, 3);
  }, [questions.data]);

  const statItems = stats.data
    ? [
        { label: "Temi monitorati", value: String(stats.data.themes), icon: "folder" as const },
        { label: "Appalti", value: String(stats.data.contracts), icon: "file-text" as const },
        { label: "Atti albo", value: String(stats.data.acts), icon: "clipboard" as const },
        { label: "Segnalazioni", value: String(stats.data.reports), icon: "alert-triangle" as const },
      ]
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        eyebrow="Sorveglianza civica"
        title="Lamezia Trasparente"
        subtitle="Il controllo dei cittadini sulla cosa pubblica"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Monitored amount hero */}
        {stats.isLoading ? (
          <Skeleton height={96} radius={colors.radius + 2} />
        ) : stats.data ? (
          <Card style={{ backgroundColor: colors.foreground, borderColor: colors.foreground }}>
            <Text style={[styles.heroLabel, { color: colors.background }]}>
              VALORE PUBBLICO MONITORATO
            </Text>
            <Text style={[styles.heroValue, { color: colors.background }]}>
              {compactAmount(stats.data.monitoredAmount)}
            </Text>
            <View style={styles.heroRow}>
              <View style={styles.heroMetric}>
                <Feather name="alert-circle" size={14} color={colors.primary} />
                <Text style={[styles.heroMetricText, { color: colors.background }]}>
                  {stats.data.totalRelevance} segnalazioni di rilevanza
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        {/* Avviso data inizio monitoraggio */}
        <View style={{ marginTop: 14 }}>
          <NoticeBanner
            title={MONITORING_NOTICE_TITLE}
            message={MONITORING_NOTICE_BODY}
          />
        </View>

        {/* Questions entry point */}
        {questions.isLoading ? (
          <View style={{ marginTop: 22, gap: 12 }}>
            <Skeleton height={24} width="60%" />
            <Skeleton height={88} radius={colors.radius + 2} />
          </View>
        ) : homeQuestions.length > 0 ? (
          <>
            <SectionTitle
              title="Cosa vuoi scoprire?"
              actionLabel="Tutte le domande"
              onAction={() => router.push("/domande")}
            />
            <View style={{ gap: 12 }}>
              {homeQuestions.map((q) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  onPress={() => router.push(resolveQuestionHref(q.destinationPath) as Href)}
                />
              ))}
            </View>
          </>
        ) : null}

        {/* Stat grid */}
        <View style={styles.grid}>
          {stats.isLoading
            ? [0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.gridItem}>
                  <Skeleton height={84} radius={colors.radius + 2} />
                </View>
              ))
            : statItems.map((s) => (
                <View key={s.label} style={styles.gridItem}>
                  <Card style={{ padding: 14 }}>
                    <Feather name={s.icon} size={18} color={colors.primary} />
                    <Text style={[styles.statValue, { color: colors.foreground }]}>
                      {s.value}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                      {s.label}
                    </Text>
                  </Card>
                </View>
              ))}
        </View>

        {/* Top themes */}
        <SectionTitle
          title="Temi più rilevanti"
          actionLabel="Tutti i temi"
          onAction={() => router.push("/themes")}
        />
        {top.isLoading ? (
          <View style={{ gap: 12 }}>
            <Skeleton height={140} radius={colors.radius + 2} />
            <Skeleton height={140} radius={colors.radius + 2} />
          </View>
        ) : top.data && top.data.byRelevance.length > 0 ? (
          <View style={{ gap: 12 }}>
            {top.data.byRelevance.slice(0, 3).map((t) => (
              <ThemeCard key={t.id} theme={t} />
            ))}
          </View>
        ) : (
          <EmptyState icon="inbox" title="Nessun tema" message="Non ci sono ancora temi monitorati." />
        )}

        {/* Recent activity */}
        <SectionTitle title="Attività recente" />
        {activity.isLoading ? (
          <Card style={{ gap: 14 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={18} />
            ))}
          </Card>
        ) : activity.data && activity.data.length > 0 ? (
          <Card style={{ padding: 0 }}>
            {activity.data.slice(0, 6).map((item, idx) => {
              const clickable = item.type === "theme" && item.themeId != null;
              return (
                <Pressable
                  key={item.id}
                  disabled={!clickable}
                  onPress={() => clickable && router.push(`/theme/${item.themeId}`)}
                  style={({ pressed }) => [
                    styles.activityRow,
                    {
                      borderTopColor: colors.border,
                      borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                      opacity: pressed && clickable ? 0.7 : 1,
                    },
                  ]}
                >
                  <View style={[styles.activityIcon, { backgroundColor: colors.muted }]}>
                    <Feather
                      name={ACTIVITY_ICON[item.type] ?? "circle"}
                      size={15}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.activityTitle, { color: colors.foreground }]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>
                      {formatDate(item.date)}
                    </Text>
                  </View>
                  {clickable ? (
                    <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                  ) : null}
                </Pressable>
              );
            })}
          </Card>
        ) : (
          <EmptyState icon="activity" title="Nessuna attività" />
        )}
      </ScrollView>
    </View>
  );
}

function QuestionRow({
  question,
  onPress,
}: {
  question: Question;
  onPress: () => void;
}) {
  const colors = useColors();
  const icon = questionIcon(question.destinationPath);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card style={styles.questionCard}>
        <View style={[styles.questionIcon, { backgroundColor: colors.accent }]}>
          <Feather name={icon} size={18} color={colors.accentForeground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.questionText, { color: colors.foreground }]} numberOfLines={2}>
            {question.text}
          </Text>
          {question.teaser ? (
            <Text
              style={[styles.questionTeaser, { color: colors.mutedForeground }]}
              numberOfLines={2}
            >
              {question.teaser}
            </Text>
          ) : null}
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </Card>
    </Pressable>
  );
}

function SectionTitle({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionTitleText, { color: colors.foreground }]}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.sectionAction}>
          <Text style={[styles.sectionActionText, { color: colors.primary }]}>{actionLabel}</Text>
          <Feather name="arrow-right" size={14} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: Platform.OS === "web" ? 110 : 40,
    gap: 8,
  },
  heroLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
    opacity: 0.8,
  },
  heroValue: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 34,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  heroRow: { marginTop: 10 },
  heroMetric: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroMetricText: { fontFamily: "Inter_500Medium", fontSize: 12.5, opacity: 0.9 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
    marginTop: 8,
  },
  gridItem: {
    width: "50%",
    padding: 5,
  },
  statValue: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 24,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitleText: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 20,
    letterSpacing: -0.4,
  },
  sectionAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  sectionActionText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  questionCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  questionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  questionText: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 14.5,
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  questionTeaser: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 3,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  activityTitle: { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 19 },
  activityDate: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
});
