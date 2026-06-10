/**
 * Brand primitives — RN equivalents of the web app's .ticket / .label /
 * .field / .btn-* classes and the urgency badge.
 */
import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors, fonts, ticketShadow } from "@/lib/theme";
import type { Urgency } from "@/lib/types";

/** Job-ticket card with the signature perforated stub edge. */
export function Ticket({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.ticket, style]}>
      <View style={styles.stub} />
      <View style={styles.ticketBody}>{children}</View>
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.steel300} {...props} style={[styles.field, props.style]} />;
}

type ButtonVariant = "primary" | "secondary" | "ghost";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const blocked = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && { backgroundColor: pressed ? colors.safety600 : colors.safety500 },
        variant === "secondary" && { backgroundColor: pressed ? colors.steel800 : colors.steel900 },
        variant === "ghost" && [
          styles.buttonGhost,
          pressed && { borderColor: colors.steel500 },
        ],
        blocked && { opacity: 0.5 },
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator size="small" color={variant === "ghost" ? colors.steel700 : colors.white} />
      )}
      <Text style={[styles.buttonText, variant === "ghost" && { color: colors.steel700 }]}>{title}</Text>
    </Pressable>
  );
}

/** Horizontal chip picker — RN stand-in for the web's <select> filters. */
export function Chips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value || "__all"}
            onPress={() => onChange(opt.value)}
            hitSlop={{ top: 8, bottom: 8 }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const URGENCY_STYLES: Record<Urgency, { bg: string; fg: string }> = {
  EMERGENCY: { bg: colors.safety500, fg: colors.white },
  HIGH: { bg: "#ff8a3d33", fg: colors.safety600 },
  MEDIUM: { bg: "#2f6db526", fg: colors.blueprint700 },
  LOW: { bg: colors.steel200, fg: colors.steel600 },
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const s = URGENCY_STYLES[urgency] ?? URGENCY_STYLES.LOW;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.fg }]}>{urgency}</Text>
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="alert" style={styles.errorText}>
      {children}
    </Text>
  );
}

export function NoticeText({ children }: { children: ReactNode }) {
  return <Text style={styles.noticeText}>{children}</Text>;
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.steel200,
    ...ticketShadow,
  },
  stub: {
    position: "absolute",
    left: 14,
    top: 10,
    bottom: 10,
    width: 0,
    borderLeftWidth: 2,
    borderColor: colors.steel200,
    borderStyle: "dashed",
  },
  ticketBody: {
    padding: 16,
    paddingLeft: 30,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.steel500,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.steel900,
    marginBottom: 10,
  },
  field: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.steel300,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.steel900,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 13,
    minHeight: 48,
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.steel300,
  },
  buttonText: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.white,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.steel300,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: colors.steel900,
    borderColor: colors.steel900,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.steel700,
  },
  chipTextSelected: {
    color: colors.white,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.safety600,
  },
  noticeText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.blueprint700,
  },
});
