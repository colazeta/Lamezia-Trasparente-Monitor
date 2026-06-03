import { Feather } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type MenuOption = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  sublabel: string;
  onPress: () => void;
};

export function HelperMenuButton() {
  const colors = useColors();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const options: MenuOption[] = [
    {
      icon: "play-circle",
      label: "Tour introduttivo",
      sublabel: "Riprendi la presentazione dell'app",
      onPress: () => {
        setVisible(false);
        router.push("/walkthrough" as Href);
      },
    },
    {
      icon: "message-circle",
      label: "Assistente",
      sublabel: "Fai domande in italiano sull'app e sui dati",
      onPress: () => {
        setVisible(false);
        router.push("/assistente" as Href);
      },
    },
    {
      icon: "book-open",
      label: "Guida e storia",
      sublabel: "Scopri il progetto e tutte le sezioni",
      onPress: () => {
        setVisible(false);
        router.push("/guida" as Href);
      },
    },
  ];

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        hitSlop={8}
        style={[
          styles.triggerBtn,
          { backgroundColor: colors.muted, borderRadius: colors.radius },
        ]}
      >
        <Feather name="help-circle" size={18} color={colors.foreground} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.menu,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    borderRadius: colors.radius + 4,
                  },
                ]}
              >
                <View style={styles.menuHeader}>
                  <View
                    style={[styles.menuIconWrap, { backgroundColor: colors.accent }]}
                  >
                    <Feather name="compass" size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.foreground }]}>
                    Cittadinanza Civica
                  </Text>
                </View>

                {options.map((opt, i) => (
                  <Pressable
                    key={opt.label}
                    onPress={opt.onPress}
                    style={({ pressed }) => [
                      styles.menuItem,
                      {
                        borderTopColor: colors.border,
                        borderTopWidth: i === 0 ? StyleSheet.hairlineWidth : StyleSheet.hairlineWidth,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.menuItemIcon,
                        { backgroundColor: colors.accent, borderRadius: colors.radius - 4 },
                      ]}
                    >
                      <Feather name={opt.icon} size={17} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.menuItemSub, { color: colors.mutedForeground }]}>
                        {opt.sublabel}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
                  </Pressable>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 16,
  },
  menu: {
    width: 290,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  menuItemLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  menuItemSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
});
