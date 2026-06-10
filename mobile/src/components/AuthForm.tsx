import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ErrorText, Field, Label, NoticeText, Ticket } from "@/components/ui";
import { API_URL } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { colors, fonts } from "@/lib/theme";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (loading) return;
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${API_URL}/api/auth/callback` },
      });
      setLoading(false);
      if (signUpError) return setError(signUpError.message);
      setNotice("Check your email to confirm your account, then sign in.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) return setError(signInError.message);
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  const switchTarget = mode === "login" ? "/signup" : "/login";
  const switchLabel = mode === "login" ? "New here? Create an account" : "Have an account? Sign in";

  return (
    <Ticket>
      <View style={styles.fieldGroup}>
        <Label>Email</Label>
        <Field
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
      </View>
      <View style={styles.fieldGroup}>
        <Label>Password</Label>
        <Field
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          textContentType={mode === "signup" ? "newPassword" : "password"}
        />
      </View>
      <Button
        title={mode === "signup" ? "Create account" : "Sign in"}
        onPress={submit}
        loading={loading}
      />
      {error && <ErrorText>{error}</ErrorText>}
      {notice && <NoticeText>{notice}</NoticeText>}
      <Text style={styles.switchLink} onPress={() => router.replace(switchTarget)}>
        {switchLabel}
      </Text>
    </Ticket>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 14,
  },
  switchLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.blueprint700,
    marginTop: 14,
    paddingVertical: 8,
  },
});
