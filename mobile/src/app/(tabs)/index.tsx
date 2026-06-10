import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LeadCard from "@/components/LeadCard";
import { Chips, ErrorText, Field, Label, Ticket } from "@/components/ui";
import { getLeads, type LeadFilters } from "@/lib/api";
import { colors, fonts } from "@/lib/theme";
import { TRADES, URGENCIES, type Lead } from "@/lib/types";

const TRADE_OPTIONS = [{ value: "", label: "All trades" }, ...TRADES.map((t) => ({ value: t, label: t }))];
const URGENCY_OPTIONS = [{ value: "", label: "Any" }, ...URGENCIES.map((u) => ({ value: u.value, label: u.label }))];

export default function BoardScreen() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [zipDraft, setZipDraft] = useState("");
  const [maxPriceDraft, setMaxPriceDraft] = useState("");

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getLeads(filters);
      setLeads(data.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load the board. Pull to retry.");
    }
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function commitTextFilters() {
    const price = Number(maxPriceDraft);
    setFilters((f) => ({
      ...f,
      zip: zipDraft.trim(),
      // The API expects cents.
      maxPrice: maxPriceDraft.trim() && Number.isFinite(price) ? String(Math.round(price * 100)) : "",
    }));
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>The board</Text>
        {leads !== null && (
          <Text style={styles.count}>
            {leads.length} LEAD{leads.length === 1 ? "" : "S"}
          </Text>
        )}
      </View>
      <Ticket>
        <Label>Trade</Label>
        <Chips
          options={TRADE_OPTIONS}
          value={filters.trade ?? ""}
          onChange={(trade) => setFilters((f) => ({ ...f, trade }))}
        />
        <View style={styles.fieldRow}>
          <View style={styles.fieldCol}>
            <Label>ZIP area</Label>
            <Field
              value={zipDraft}
              onChangeText={setZipDraft}
              onEndEditing={commitTextFilters}
              placeholder="480xx"
              keyboardType="number-pad"
              maxLength={5}
              returnKeyType="done"
            />
          </View>
          <View style={styles.fieldCol}>
            <Label>Max lead price ($)</Label>
            <Field
              value={maxPriceDraft}
              onChangeText={setMaxPriceDraft}
              onEndEditing={commitTextFilters}
              placeholder="100"
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </View>
        </View>
        <Label>Urgency</Label>
        <Chips
          options={URGENCY_OPTIONS}
          value={filters.urgency ?? ""}
          onChange={(urgency) => setFilters((f) => ({ ...f, urgency }))}
        />
      </Ticket>
      {error && <ErrorText>{error}</ErrorText>}
    </View>
  );

  return (
    <FlatList
      data={leads ?? []}
      keyExtractor={(lead) => lead.id}
      renderItem={({ item }) => <LeadCard lead={item} />}
      contentContainerStyle={styles.list}
      ListHeaderComponent={header}
      ListEmptyComponent={
        leads === null ? (
          <ActivityIndicator color={colors.safety500} style={styles.loader} />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No leads match these filters</Text>
            <Text style={styles.emptyHint}>Widen the ZIP area or clear a filter to see more.</Text>
          </View>
        )
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.safety500} />
      }
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 12,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: colors.steel900,
  },
  count: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.steel500,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
  },
  fieldCol: {
    flex: 1,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.steel300,
    borderRadius: 8,
  },
  emptyTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    textTransform: "uppercase",
    color: colors.steel500,
  },
  emptyHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.steel500,
    marginTop: 6,
  },
});
