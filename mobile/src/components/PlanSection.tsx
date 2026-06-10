import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ErrorText } from "@/components/ui";
import { startSubscriptionCheckout } from "@/lib/api";
import { colors, fonts } from "@/lib/theme";
import type { Plan } from "@/lib/types";

export default function PlanSection({
  currentPlan,
  onCheckoutDone,
}: {
  currentPlan: Plan;
  onCheckoutDone: () => void;
}) {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upgrade(plan: "PRO" | "ELITE") {
    if (loading) return;
    setLoading(plan);
    setError(null);
    try {
      const { url } = await startSubscriptionCheckout(plan);
      await WebBrowser.openBrowserAsync(url);
      onCheckoutDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
    } finally {
      setLoading(null);
    }
  }

  if (currentPlan === "ELITE") {
    return <Text style={styles.eliteNote}>You&apos;re on the Elite plan — lowest fees, priority alerts.</Text>;
  }

  return (
    <View style={styles.wrap}>
      {currentPlan === "FREE" && (
        <Button
          title="Upgrade to Pro — $29/mo"
          variant="ghost"
          onPress={() => upgrade("PRO")}
          loading={loading === "PRO"}
          disabled={loading !== null && loading !== "PRO"}
        />
      )}
      <Button
        title="Upgrade to Elite — $99/mo"
        variant="secondary"
        onPress={() => upgrade("ELITE")}
        loading={loading === "ELITE"}
        disabled={loading !== null && loading !== "ELITE"}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  eliteNote: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.steel500,
  },
});
