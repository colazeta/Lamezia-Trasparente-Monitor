import { Feather } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Card, ChipRow, EmptyState, SearchBar, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { questionIcon, resolveQuestionHref } from "@/lib/civic";
import { useListQuestions, type Question } from "@workspace/api-client-react";

export default function DomandeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState<string | undefined>(undefined);

  const questions = useListQuestions();
  const data = questions.data ?? [];

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const q of data) {
      if (q.topic) set.add(q.topic);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "it"));
  }, [data]);

  const topicOptions = useMemo(
    () => [
      { label: "Tutti", value: undefined as string | undefined },
      ...topics.map((t) => ({ label: t, value: t as string | undefined })),
    ],
    [topics],
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return data.filter((q) => {
      if (topic != null && q.topic !== topic) return false;
      if (!normalizedSearch) return true;
      const haystack = `${q.text} ${q.teaser ?? ""} ${q.topic}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [data, topic, normalizedSearch]);

  const isFiltering = normalizedSearch.length > 0 || topic != null;

  const featured = useMemo(
    () => filtered.filter((q) => q.featured),
    [filtered],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Question[]>();
    for (const q of filtered) {
      const key = q.topic || "Altro";
      const list = map.get(key) ?? [];
      list.push(q);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], "it"),
    );
  }, [filtered]);

  const onOpen = (q: Question) => {
    router.push(resolveQuestionHref(q.destinationPath) as Href);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.controls}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Cerca una domanda…"
        />
        {topics.length > 0 ? (
          <ChipRow
            options={topicOptions}
            selected={topic}
            getLabel={(o) => o.label}
            getValue={(o) => o.value}
            onSelect={(v) => setTopic(v as string | undefined)}
          />
        ) : null}
      </View>

      {questions.isLoading ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={92} radius={colors.radius + 2} />
          ))}
        </View>
      ) : questions.isError ? (
        <EmptyState
          icon="wifi-off"
          title="Errore di caricamento"
          message="Non è stato possibile recuperare le domande."
          onRetry={() => questions.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={isFiltering ? "search" : "help-circle"}
          title={isFiltering ? "Nessun risultato" : "Nessuna domanda"}
          message={
            isFiltering
              ? "Prova a modificare la ricerca o l'argomento."
              : "Le domande curate appariranno qui."
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Featured (only when not filtering, to avoid duplicates) */}
          {!isFiltering && featured.length > 0 ? (
            <View style={{ gap: 12 }}>
              <SectionLabel icon="star" title="In evidenza" color={colors.primary} />
              {featured.map((q) => (
                <QuestionCard key={q.id} question={q} featured onPress={() => onOpen(q)} />
              ))}
            </View>
          ) : null}

          {/* Grouped by topic */}
          {grouped.map(([topicName, items]) => {
            const list =
              !isFiltering && featured.length > 0
                ? items.filter((q) => !q.featured)
                : items;
            if (list.length === 0) return null;
            return (
              <View key={topicName} style={{ gap: 12, marginTop: 22 }}>
                <SectionLabel icon="tag" title={topicName} color={colors.mutedForeground} />
                {list.map((q) => (
                  <QuestionCard key={q.id} question={q} onPress={() => onOpen(q)} />
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function SectionLabel({
  icon,
  title,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionLabel}>
      <Feather name={icon} size={14} color={color} />
      <Text style={[styles.sectionLabelText, { color: colors.foreground }]}>
        {title}
      </Text>
    </View>
  );
}

function QuestionCard({
  question,
  featured = false,
  onPress,
}: {
  question: Question;
  featured?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const icon = questionIcon(question.destinationPath);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card
        style={[
          styles.card,
          featured ? { borderColor: colors.primary } : undefined,
        ]}
      >
        <View style={styles.cardTop}>
          <View
            style={[
              styles.cardIcon,
              { backgroundColor: featured ? colors.primary : colors.accent },
            ]}
          >
            <Feather
              name={icon}
              size={18}
              color={featured ? colors.primaryForeground : colors.accentForeground}
            />
          </View>
          <Text style={[styles.cardQuestion, { color: colors.foreground }]}>
            {question.text}
          </Text>
        </View>
        {question.teaser ? (
          <Text style={[styles.cardTeaser, { color: colors.mutedForeground }]}>
            {question.teaser}
          </Text>
        ) : null}
        <View style={[styles.cardCta, { borderTopColor: colors.border }]}>
          <Text style={[styles.cardCtaText, { color: colors.primary }]} numberOfLines={1}>
            {question.ctaLabel}
          </Text>
          <Feather name="arrow-right" size={16} color={colors.primary} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 10 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: Platform.OS === "web" ? 60 : 40,
  },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionLabelText: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  card: { gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardQuestion: {
    flex: 1,
    fontFamily: "SpaceGrotesk_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  cardTeaser: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19 },
  cardCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 2,
  },
  cardCtaText: { fontFamily: "Inter_600SemiBold", fontSize: 13.5, flex: 1 },
});
