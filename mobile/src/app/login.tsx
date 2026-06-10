import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import AuthForm from "@/components/AuthForm";

export default function LoginScreen() {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AuthForm mode="login" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 16, paddingTop: 24 },
});
