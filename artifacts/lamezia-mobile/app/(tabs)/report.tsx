import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Badge, Card, EmptyState, PrimaryButton, ScreenHeader, Skeleton } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import {
  REPORT_CATEGORIES,
  REPORT_STATUS,
  categoryLabel,
  formatDate,
  intentColors,
} from "@/lib/civic";
import {
  getListReportsQueryKey,
  useCreateReport,
  useListReports,
} from "@workspace/api-client-react";

type Tab = "invia" | "bacheca";

export default function ReportScreen() {
  const colors = useColors();
  const [tab, setTab] = useState<Tab>("invia");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        eyebrow="Partecipazione"
        title="Segnala"
        subtitle="Contribuisci alla vigilanza sul territorio"
      />
      <View style={styles.tabBarWrap}>
        <View style={[styles.segment, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          {(["invia", "bacheca"] as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[
                  styles.segmentItem,
                  {
                    backgroundColor: active ? colors.card : "transparent",
                    borderRadius: colors.radius - 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? colors.foreground : colors.mutedForeground },
                  ]}
                >
                  {t === "invia" ? "Nuova segnalazione" : "Bacheca"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {tab === "invia" ? <ReportForm onSent={() => setTab("bacheca")} /> : <ReportBoard />}
    </View>
  );
}

function ReportForm({ onSent }: { onSent: () => void }) {
  const colors = useColors();
  const queryClient = useQueryClient();
  const createReport = useCreateReport();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const detectLocation = async () => {
    setError(null);
    setLocating(true);
    try {
      if (Platform.OS === "web") {
        await new Promise<void>((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error("no geo"));
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setLocation(
                `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
              );
              resolve();
            },
            () => reject(new Error("denied")),
          );
        });
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permesso di geolocalizzazione negato.");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        const places = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const p = places[0];
        if (p) {
          const parts = [p.street, p.streetNumber, p.city]
            .filter(Boolean)
            .join(" ");
          setLocation(parts || `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        } else {
          setLocation(
            `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
          );
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      setError("Impossibile rilevare la posizione.");
    } finally {
      setLocating(false);
    }
  };

  const submit = () => {
    setError(null);
    if (!title.trim() || !description.trim() || !category || !location.trim()) {
      setError("Compila titolo, descrizione, categoria e luogo.");
      return;
    }
    createReport.mutate(
      {
        data: {
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          ...(citizenName.trim() ? { citizenName: citizenName.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          setTitle("");
          setDescription("");
          setCategory("");
          setLocation("");
          setCitizenName("");
          setDone(true);
          setTimeout(() => {
            setDone(false);
            onSent();
          }, 1400);
        },
        onError: () => setError("Invio non riuscito. Riprova."),
      },
    );
  };

  if (done) {
    return (
      <EmptyState
        icon="check-circle"
        title="Segnalazione inviata!"
        message="Grazie per il tuo contributo alla trasparenza."
      />
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      contentContainerStyle={styles.formContent}
      showsVerticalScrollIndicator={false}
    >
      <Field label="Titolo" required>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="Es. Buca pericolosa in Via Marconi"
        />
      </Field>

      <Field label="Categoria" required>
        <View style={styles.chipWrap}>
          {REPORT_CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <Pressable
                key={c.value}
                onPress={() => setCategory(c.value)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: 999,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    { color: active ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      <Field label="Descrizione" required>
        <Input
          value={description}
          onChangeText={setDescription}
          placeholder="Descrivi il problema nel dettaglio…"
          multiline
        />
      </Field>

      <Field label="Luogo" required>
        <Input
          value={location}
          onChangeText={setLocation}
          placeholder="Indirizzo o zona"
        />
        <Pressable
          onPress={detectLocation}
          disabled={locating}
          style={[styles.gpsBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="map-pin" size={15} color={colors.primary} />
          )}
          <Text style={[styles.gpsText, { color: colors.primary }]}>
            {locating ? "Rilevamento…" : "Usa la mia posizione"}
          </Text>
        </Pressable>
      </Field>

      <Field label="Nome (facoltativo)">
        <Input
          value={citizenName}
          onChangeText={setCitizenName}
          placeholder="Come vuoi essere identificato"
        />
      </Field>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: intentColors("alert", colors).bg }]}>
          <Feather name="alert-circle" size={15} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: 8 }}>
        <PrimaryButton
          label="Invia segnalazione"
          icon="send"
          onPress={submit}
          loading={createReport.isPending}
        />
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

function ReportBoard() {
  const colors = useColors();
  const reports = useListReports();

  if (reports.isLoading) {
    return (
      <View style={{ padding: 20, gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={120} radius={colors.radius + 2} />
        ))}
      </View>
    );
  }
  if (reports.isError) {
    return (
      <EmptyState
        icon="wifi-off"
        title="Errore di caricamento"
        onRetry={() => reports.refetch()}
      />
    );
  }
  if (!reports.data || reports.data.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="Nessuna segnalazione"
        message="Sii il primo a segnalare un problema."
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.boardContent} showsVerticalScrollIndicator={false}>
      {reports.data.map((r) => {
        const status = REPORT_STATUS[r.status] ?? { label: r.status, intent: "closed" as const };
        const sc = intentColors(status.intent, colors);
        return (
          <Card key={r.id} style={{ gap: 8 }}>
            <View style={styles.boardTop}>
              <Badge label={categoryLabel(r.category)} bg={colors.accent} fg={colors.accentForeground} />
              <Badge label={status.label} bg={sc.bg} fg={sc.fg} />
            </View>
            <Text style={[styles.boardTitle, { color: colors.foreground }]}>{r.title}</Text>
            <Text style={[styles.boardDesc, { color: colors.mutedForeground }]} numberOfLines={3}>
              {r.description}
            </Text>
            <View style={[styles.boardFooter, { borderTopColor: colors.border }]}>
              <View style={styles.boardMeta}>
                <Feather name="map-pin" size={13} color={colors.mutedForeground} />
                <Text style={[styles.boardMetaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {r.location}
                </Text>
              </View>
              <Text style={[styles.boardMetaText, { color: colors.mutedForeground }]}>
                {formatDate(r.createdAt)}
              </Text>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 7 }}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
        {label}
        {required ? <Text style={{ color: colors.primary }}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

function Input({
  multiline,
  ...props
}: React.ComponentProps<typeof TextInput> & { multiline?: boolean }) {
  const colors = useColors();
  return (
    <TextInput
      {...props}
      multiline={multiline}
      placeholderTextColor={colors.mutedForeground}
      style={[
        styles.input,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.foreground,
          borderRadius: colors.radius,
          height: multiline ? 110 : 46,
          textAlignVertical: multiline ? "top" : "center",
          paddingTop: multiline ? 12 : 0,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tabBarWrap: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
  segment: { flexDirection: "row", padding: 3 },
  segmentItem: { flex: 1, paddingVertical: 8, alignItems: "center" },
  segmentText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  formContent: {
    padding: 20,
    gap: 18,
    paddingBottom: Platform.OS === "web" ? 120 : 60,
  },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1 },
  catChipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  gpsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    borderWidth: 1,
  },
  gpsText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  errorText: { fontFamily: "Inter_500Medium", fontSize: 13.5, flex: 1 },
  boardContent: {
    padding: 20,
    gap: 12,
    paddingBottom: Platform.OS === "web" ? 110 : 40,
  },
  boardTop: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  boardTitle: { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 16, lineHeight: 22 },
  boardDesc: { fontFamily: "Inter_400Regular", fontSize: 13.5, lineHeight: 19 },
  boardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 4,
  },
  boardMeta: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  boardMetaText: { fontFamily: "Inter_500Medium", fontSize: 12 },
});
