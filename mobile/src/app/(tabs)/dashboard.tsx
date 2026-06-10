import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PlanSection from "@/components/PlanSection";
import ProfileSection from "@/components/ProfileSection";
import { Button, ErrorText, SectionTitle, Ticket } from "@/components/ui";
import { getDashboard } from "@/lib/api";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { colors, fonts } from "@/lib/theme";
import { fmtUsd, type Lead, type Profile } from "@/lib/types";

type DashboardData = {
  user: Profile;
  myLeads: Lead[];
  purchases: Lead[];
  totalEarnings: number;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    try {
      setError(null);
      setData(await getDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your dashboard.");
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (sessionLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.safety500} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Ticket>
          <Text style={styles.signInTitle}>Sign in to see your dashboard</Text>
          <Text style={styles.signInHint}>
            Track your listings, purchases, and earnings in one place.
          </Text>
          <Button title="Sign in" onPress={() => router.push("/login")} />
        </Ticket>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        {error ? <ErrorText>{error}</ErrorText> : <ActivityIndicator color={colors.safety500} />}
      </View>
    );
  }

  const sold = data.myLeads.filter((l) => l.status === "SOLD").length;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.planRow}>
        <Text style={styles.planLabel}>{data.user.subscriptionPlan} PLAN</Text>
        <Text style={styles.email}>{data.user.email}</Text>
      </View>

      <View style={styles.statRow}>
        <StatCard label="Leads posted" value={String(data.myLeads.length)} />
        <StatCard label="Leads sold" value={String(sold)} />
        <StatCard label="Earnings" value={fmtUsd(data.totalEarnings)} />
      </View>

      <SectionTitle>Plan</SectionTitle>
      <Ticket style={styles.section}>
        <PlanSection currentPlan={data.user.subscriptionPlan} onCheckoutDone={load} />
      </Ticket>

      <SectionTitle>Profile & lead alerts</SectionTitle>
      <Ticket style={styles.section}>
        <ProfileSection profile={data.user} onSaved={load} />
      </Ticket>

      <SectionTitle>Leads you bought</SectionTitle>
      {data.purchases.length === 0 ? (
        <Text style={styles.emptyText}>Nothing yet. Browse the board to find your next job.</Text>
      ) : (
        <View style={styles.leadList}>
          {data.purchases.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              subtitle={`${lead.contactName ?? ""} · ${lead.contactPhone ?? ""}`}
              onPress={() => router.push(`/lead/${lead.id}`)}
            />
          ))}
        </View>
      )}

      <SectionTitle>Leads you posted</SectionTitle>
      {data.myLeads.length === 0 ? (
        <Text style={styles.emptyText}>No listings yet. Post your first lead in under two minutes.</Text>
      ) : (
        <View style={styles.leadList}>
          {data.myLeads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              subtitle={lead.status}
              onPress={() => router.push(`/lead/${lead.id}`)}
            />
          ))}
        </View>
      )}

      {error && <ErrorText>{error}</ErrorText>}

      <View style={styles.signOut}>
        <Button title="Sign out" variant="ghost" onPress={() => supabase.auth.signOut()} />
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Ticket style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Ticket>
  );
}

function LeadRow({
  lead,
  subtitle,
  onPress,
}: {
  lead: Lead;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => pressed && { opacity: 0.85 }}
    >
      <Ticket style={styles.leadRow}>
        <View style={styles.leadRowInner}>
          <View style={styles.leadRowText}>
            <Text style={styles.leadRowTitle}>
              {lead.jobType} — ZIP {lead.locationZip}
            </Text>
            <Text style={styles.leadRowSub}>{subtitle}</Text>
          </View>
          <Text style={styles.leadRowPrice}>{fmtUsd(lead.price)}</Text>
        </View>
      </Ticket>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  signInTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    textTransform: "uppercase",
    color: colors.steel900,
  },
  signInHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.steel600,
    marginVertical: 12,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  planLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.safety600,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.steel500,
  },
  statRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.steel500,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.steel900,
    marginTop: 4,
  },
  section: {
    marginBottom: 22,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.steel500,
    marginBottom: 22,
  },
  leadList: {
    gap: 10,
    marginBottom: 22,
  },
  leadRow: {},
  leadRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  leadRowText: {
    flexShrink: 1,
  },
  leadRowTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    textTransform: "uppercase",
    color: colors.steel900,
  },
  leadRowSub: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.steel500,
    marginTop: 2,
  },
  leadRowPrice: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.steel900,
  },
  signOut: {
    marginTop: 8,
  },
});
