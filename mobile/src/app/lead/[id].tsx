import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, ErrorText, Label, Ticket, UrgencyBadge } from "@/components/ui";
import { getLead, startLeadCheckout } from "@/lib/api";
import { useSession } from "@/lib/session";
import { colors, fonts } from "@/lib/theme";
import { fmtDate, fmtUsd, isMaskedContact, type Lead } from "@/lib/types";

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useSession();
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await getLead(id);
      setLead(data.lead);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load this lead.");
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function buy() {
    if (buying || !lead) return;
    setBuying(true);
    setError(null);
    try {
      const { url } = await startLeadCheckout(lead.id);
      await WebBrowser.openBrowserAsync(url);
      // The browser closed — refetch in case the purchase completed.
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
    } finally {
      setBuying(false);
    }
  }

  if (!lead) {
    return (
      <View style={styles.center}>
        {error ? <ErrorText>{error}</ErrorText> : <ActivityIndicator color={colors.safety500} />}
      </View>
    );
  }

  const isSeller = session?.user.id === lead.sellerId;
  const masked = isMaskedContact(lead);
  const purchasable =
    lead.status === "AVAILABLE" && new Date(lead.expiresAt) > new Date() && !isSeller;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Ticket>
        <View style={styles.topRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{lead.jobType}</Text>
            <Text style={styles.meta}>
              ZIP {lead.locationZip} · posted {fmtDate(lead.createdAt)}
            </Text>
          </View>
          <View style={styles.priceBlock}>
            <Label>Lead price</Label>
            <Text style={styles.price}>{fmtUsd(lead.price)}</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <UrgencyBadge urgency={lead.urgency} />
          {lead.status !== "AVAILABLE" && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{lead.status === "SOLD" ? "Sold" : "Expired"}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Label>Job description</Label>
          <Text style={styles.description}>{lead.description}</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Label>Customer budget</Label>
            <Text style={styles.statValue}>
              {fmtUsd(lead.budgetMin)} – {fmtUsd(lead.budgetMax)}
            </Text>
          </View>
          <View style={styles.statCol}>
            <Label>Listing expires</Label>
            <Text style={styles.statValue}>{fmtDate(lead.expiresAt)}</Text>
          </View>
        </View>

        <View style={styles.contactBox}>
          <Label>{masked ? "Customer contact — unlocked after purchase" : "Customer contact"}</Label>
          <View style={styles.contactRow}>
            <ContactItem label="Name" value={lead.contactName ?? "████████"} masked={masked} />
            <ContactItem label="Phone" value={lead.contactPhone ?? "███-███-████"} masked={masked} />
            <ContactItem label="Email" value={lead.contactEmail ?? "████@████.com"} masked={masked} />
          </View>
        </View>

        <View style={styles.actions}>
          {purchasable ? (
            session ? (
              <Button title={`Buy this lead — ${fmtUsd(lead.price)}`} onPress={buy} loading={buying} />
            ) : (
              <Button
                title={`Sign in to buy — ${fmtUsd(lead.price)}`}
                onPress={() => router.push("/login")}
              />
            )
          ) : isSeller ? (
            <Text style={styles.sellerNote}>
              This is your listing. You&apos;ll get an email the moment it sells.
            </Text>
          ) : null}
          {error && <ErrorText>{error}</ErrorText>}
        </View>
      </Ticket>
    </ScrollView>
  );
}

function ContactItem({ label, value, masked }: { label: string; value: string; masked: boolean }) {
  return (
    <View style={styles.contactItem}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={masked ? styles.contactMasked : styles.contactValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  scroll: {
    padding: 16,
  },
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
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.steel900,
    lineHeight: 32,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.steel500,
    marginTop: 6,
  },
  priceBlock: {
    alignItems: "flex-end",
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.steel900,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.steel200,
  },
  statusBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.steel600,
  },
  section: {
    marginTop: 18,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.steel700,
  },
  statRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 18,
  },
  statCol: {
    flex: 1,
  },
  statValue: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.steel900,
  },
  contactBox: {
    marginTop: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.steel200,
    backgroundColor: colors.steel50,
    padding: 12,
  },
  contactRow: {
    gap: 8,
    marginTop: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.steel500,
    width: 52,
  },
  contactValue: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.steel900,
    flexShrink: 1,
  },
  contactMasked: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.steel500,
  },
  actions: {
    marginTop: 22,
    gap: 10,
  },
  sellerNote: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.steel500,
  },
});
