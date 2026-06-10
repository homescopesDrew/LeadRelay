import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ticket, UrgencyBadge } from "@/components/ui";
import { colors, fonts } from "@/lib/theme";
import { fmtDate, fmtUsd, type Lead } from "@/lib/types";

export default function LeadCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/lead/${lead.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${lead.jobType} lead in ZIP ${lead.locationZip}, ${fmtUsd(lead.price)}`}
      style={({ pressed }) => pressed && { opacity: 0.85 }}
    >
      <Ticket>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{lead.jobType}</Text>
            <Text style={styles.meta}>
              ZIP {lead.locationZip} · posted {fmtDate(lead.createdAt)}
            </Text>
          </View>
          <UrgencyBadge urgency={lead.urgency} />
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {lead.description}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.budget}>
            Job budget {fmtUsd(lead.budgetMin)}–{fmtUsd(lead.budgetMax)}
          </Text>
          <Text style={styles.price}>{fmtUsd(lead.price)}</Text>
        </View>
      </Ticket>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBlock: {
    flexShrink: 1,
  },
  title: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.steel900,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.steel500,
    marginTop: 2,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.steel600,
    marginTop: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  budget: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.steel500,
    flexShrink: 1,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.steel900,
  },
});
