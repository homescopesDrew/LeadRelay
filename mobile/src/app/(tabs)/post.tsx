import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Chips, ErrorText, Field, Label, Ticket } from "@/components/ui";
import { createLead } from "@/lib/api";
import { useSession } from "@/lib/session";
import { colors, fonts } from "@/lib/theme";
import { TRADES, URGENCIES, type Urgency } from "@/lib/types";

const EMPTY_FORM = {
  jobType: TRADES[0] as string,
  locationZip: "",
  budgetMin: "",
  budgetMax: "",
  description: "",
  urgency: "MEDIUM" as Urgency,
  price: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

export default function PostLeadScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { lead } = await createLead({
        jobType: form.jobType,
        locationZip: form.locationZip.trim(),
        budgetMin: Math.round(Number(form.budgetMin) * 100),
        budgetMax: Math.round(Number(form.budgetMax) * 100),
        description: form.description.trim(),
        urgency: form.urgency,
        price: Math.round(Number(form.price) * 100),
        contactName: form.contactName.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim(),
      });
      setForm(EMPTY_FORM);
      router.push(`/lead/${lead.id}`);
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Something went wrong. Try again."
          ? err.message
          : "Check the fields and try again. Description needs 20+ characters; price is $5–$1,000."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Ticket>
          <Text style={styles.signInTitle}>Sign in to post a lead</Text>
          <Text style={styles.signInHint}>
            Post the jobs you can&apos;t take and get paid when another contractor buys them.
          </Text>
          <Button title="Sign in" onPress={() => router.push("/login")} />
        </Ticket>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Ticket>
          <View style={styles.group}>
            <Label>Trade / job type</Label>
            <Chips
              options={TRADES.map((t) => ({ value: t, label: t }))}
              value={form.jobType}
              onChange={(v) => set("jobType", v)}
            />
          </View>

          <View style={styles.group}>
            <Label>Job ZIP code</Label>
            <Field
              value={form.locationZip}
              onChangeText={(v) => set("locationZip", v)}
              placeholder="48080"
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Label>Budget min ($)</Label>
              <Field
                value={form.budgetMin}
                onChangeText={(v) => set("budgetMin", v)}
                placeholder="500"
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.col}>
              <Label>Budget max ($)</Label>
              <Field
                value={form.budgetMax}
                onChangeText={(v) => set("budgetMax", v)}
                placeholder="2500"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.group}>
            <Label>Urgency</Label>
            <Chips
              options={URGENCIES.map((u) => ({ value: u.value, label: u.label }))}
              value={form.urgency}
              onChange={(v) => set("urgency", v as Urgency)}
            />
          </View>

          <View style={styles.group}>
            <Label>Job description</Label>
            <Field
              value={form.description}
              onChangeText={(v) => set("description", v)}
              placeholder="What the customer needs, scope, materials, access notes — the more detail, the faster it sells."
              multiline
              numberOfLines={4}
              style={styles.textarea}
            />
          </View>

          <View style={styles.divider} />
          <Label>Customer contact — hidden until purchased</Label>

          <View style={styles.group}>
            <Label>Name</Label>
            <Field value={form.contactName} onChangeText={(v) => set("contactName", v)} />
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Label>Phone</Label>
              <Field
                value={form.contactPhone}
                onChangeText={(v) => set("contactPhone", v)}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.col}>
              <Label>Email</Label>
              <Field
                value={form.contactEmail}
                onChangeText={(v) => set("contactEmail", v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.group}>
            <Label>Your asking price ($5–$1,000)</Label>
            <Field
              value={form.price}
              onChangeText={(v) => set("price", v)}
              placeholder="45"
              keyboardType="decimal-pad"
            />
          </View>

          <Button title="Post lead" onPress={submit} loading={submitting} />
          {error && <ErrorText>{error}</ErrorText>}
        </Ticket>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
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
  group: {
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  col: {
    flex: 1,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  divider: {
    borderTopWidth: 1,
    borderColor: colors.steel200,
    marginBottom: 14,
    marginTop: 4,
  },
});
