import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";

function BrandTitle() {
  return (
    <View style={styles.brandRow}>
      <Text style={[styles.brand, { color: colors.safety500 }]}>LEAD</Text>
      <Text style={[styles.brand, { color: colors.white }]}>RELAY</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.steel900 },
        headerTintColor: colors.white,
        headerTitleStyle: { fontFamily: fonts.displaySemi, fontSize: 20 },
        tabBarStyle: { backgroundColor: colors.steel900, borderTopColor: colors.steel800 },
        tabBarActiveTintColor: colors.safety500,
        tabBarInactiveTintColor: colors.steel400,
        tabBarLabelStyle: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.5 },
        sceneStyle: { backgroundColor: colors.steel50 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "The Board",
          headerTitle: () => <BrandTitle />,
          tabBarLabel: "BOARD",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post a lead",
          tabBarLabel: "POST",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hammer" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Your dashboard",
          tabBarLabel: "DASHBOARD",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: "row",
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 1,
  },
});
