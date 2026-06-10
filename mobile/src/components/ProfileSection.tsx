import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Chips, ErrorText, Field, Label, NoticeText } from "@/components/ui";
import { updateProfile } from "@/lib/api";
import { TRADES, type Profile } from "@/lib/types";

export default function ProfileSection({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: () => void;
}) {
  const [companyName, setCompanyName] = useState(profile.companyName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [trade, setTrade] = useState(profile.trade ?? "");
  const [zips, setZips] = useState(profile.zipCodes.join(", "));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    const zipCodes = zips
      .split(/[,\s]+/)
      .map((z) => z.trim())
      .filter(Boolean);
    try {
      await updateProfile({ companyName, phone, trade, zipCodes });
      setSaved(true);
      onSaved();
    } catch {
      setError("ZIP codes must be 5 digits, separated by commas.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <View>
        <Label>Company name</Label>
        <Field value={companyName} onChangeText={setCompanyName} autoComplete="organization" />
      </View>
      <View>
        <Label>Phone</Label>
        <Field value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
      </View>
      <View>
        <Label>Primary trade</Label>
        <Chips
          options={TRADES.map((t) => ({ value: t, label: t }))}
          value={trade}
          onChange={setTrade}
        />
      </View>
      <View>
        <Label>Service area ZIPs (comma-separated)</Label>
        <Field value={zips} onChangeText={setZips} placeholder="48080, 48081, 48082" />
      </View>
      <Button title="Save profile" variant="secondary" onPress={save} loading={saving} />
      {saved && <NoticeText>Profile saved. Lead alerts now use these settings.</NoticeText>}
      {error && <ErrorText>{error}</ErrorText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
});
