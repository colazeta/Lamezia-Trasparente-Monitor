import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { sendAssistantMessage, webRouteToMobile } from "@/lib/helper";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Ciao! Sono l'assistente di Lamezia Trasparente. Puoi chiedermi come funziona l'app, dove trovare un documento, cosa significano certi dati o come segnalare qualcosa. Come posso aiutarti?",
};

// ---------------------------------------------------------------------------
// Estrazione route dall'assistente
// Il backend usa il pattern: "sezione Appalti (/contratti)"
// o route bare: "vai su /temi".
// ---------------------------------------------------------------------------
function extractRoutes(text: string): string[] {
  const ROUTE_RE = /\/[a-z][a-z0-9/_-]*/g;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = ROUTE_RE.exec(text)) !== null) {
    const raw = m[0].replace(/[).,;:]+$/, "");
    const mobile = webRouteToMobile(raw);
    if (mobile) found.add(mobile);
  }
  return Array.from(found);
}

const ROUTE_LABEL: Record<string, string> = {
  "/": "Home",
  "/themes": "Temi",
  "/monitor": "Atti",
  "/report": "Segnala",
  "/contratti": "Appalti",
  "/delibere": "Delibere",
  "/albo": "Albo Pretorio",
  "/pnrr": "PNRR",
  "/organi": "Organi",
  "/legality": "Legalità",
  "/performance": "Performance",
  "/opendata": "Opendata",
  "/domande": "Domande",
};

function routeLabel(route: string): string {
  return ROUTE_LABEL[route] ?? route;
}

export default function AssistenteScreen() {
  const colors = useColors();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (params.q) setInput(params.q);
  }, [params.q]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: text };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const reply = await sendAssistantMessage(text, pathname);
      const assistantMsg: ChatMessage = { role: "assistant", content: reply };
      setMessages([...updatedHistory, assistantMsg]);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Non riesco a rispondere adesso. Controlla la connessione e riprova.";
      setError(msg);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 14),
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={[styles.avatarDot, { backgroundColor: colors.primary }]}>
            <Feather name="message-circle" size={14} color={colors.primaryForeground} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Assistente</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Lamezia Trasparente
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            onNavigate={(route) => router.push(route as any)}
          />
        ))}
        {loading ? <TypingBubble /> : null}
        {error ? (
          <View
            style={[
              styles.errorBubble,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.muted,
              color: colors.foreground,
              borderRadius: colors.radius,
            },
          ]}
          placeholder="Scrivi un messaggio…"
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          multiline
          maxLength={600}
        />
        <Pressable
          onPress={send}
          disabled={!input.trim() || loading}
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor: input.trim() && !loading ? colors.primary : colors.muted,
              borderRadius: colors.radius,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name="send"
            size={18}
            color={input.trim() && !loading ? colors.primaryForeground : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  onNavigate,
}: {
  message: ChatMessage;
  onNavigate: (route: string) => void;
}) {
  const colors = useColors();
  const isUser = message.role === "user";

  const navRoutes = !isUser ? extractRoutes(message.content) : [];

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      {!isUser ? (
        <View style={[styles.avatarSmall, { backgroundColor: colors.accent }]}>
          <Feather name="message-circle" size={13} color={colors.primary} />
        </View>
      ) : null}
      <View style={{ flexShrink: 1, gap: 8 }}>
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              { color: isUser ? colors.primaryForeground : colors.foreground },
            ]}
          >
            {message.content}
          </Text>
        </View>
        {navRoutes.length > 0 ? (
          <View style={styles.navChips}>
            {navRoutes.map((route) => (
              <Pressable
                key={route}
                onPress={() => onNavigate(route)}
                style={({ pressed }) => [
                  styles.navChip,
                  {
                    backgroundColor: colors.accent,
                    borderRadius: colors.radius - 2,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather name="arrow-right-circle" size={14} color={colors.primary} />
                <Text style={[styles.navChipText, { color: colors.primary }]}>
                  {routeLabel(route)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function TypingBubble() {
  const colors = useColors();
  return (
    <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
      <View style={[styles.avatarSmall, { backgroundColor: colors.accent }]}>
        <Feather name="message-circle" size={13} color={colors.primary} />
      </View>
      <View
        style={[
          styles.bubble,
          { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 },
        ]}
      >
        <Text style={[styles.bubbleText, { color: colors.mutedForeground }]}>
          Sto elaborando…
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 16, letterSpacing: -0.2 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    maxWidth: "90%",
  },
  bubbleRowUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  bubbleRowAssistant: { alignSelf: "flex-start" },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  bubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  navChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  navChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  navChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  errorBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "stretch",
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 13.5, flex: 1 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 110,
  },
  sendBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
