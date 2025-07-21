import { StatusBar } from "expo-status-bar";
import { Tabs, usePathname, useRouter } from "expo-router";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useTheme } from "react-native-paper";
import Feather from "@expo/vector-icons/Feather";
 // Import AuthContext

const TabIcon = ({ icon, color, label, isActive }) => (
  <View style={{ alignItems: "center", width: 70 }}>
    {icon({ color })}
    {isActive && (
      <Text
        style={{ color, fontSize: 12, textAlign: "center", flexWrap: "wrap" }}
      >
        {label}
      </Text>
    )}
  </View>
);

const TabLayout = () => {
  const { colors, dark } = useTheme();
  const pathname = usePathname(); // Get current active route
  useAuth(); // Get user state from AuthContext
  const router = useRouter();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tertiary,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 60,
            borderTopWidth: 0,
            backgroundColor: colors.background,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Dashboard",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabIcon
                icon={() => <AntDesign name="home" size={24} color={color} />}
                color={color}
                label="Dashboard"
                isActive={pathname === "/home"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="deposits"
          options={{
            title: "Deposits",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabIcon
                icon={() => (
                  <MaterialIcons name="savings" size={24} color={color} />
                )}
                color={color}
                label="Deposits"
                isActive={pathname === "/deposits"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="withdrawals"
          options={{
            title: "Withdrawals",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabIcon
                icon={() => (
                  <MaterialIcons name="account-balance-wallet" size={24} color={color} />
                )}
                color={color}
                label="Withdrawals"
                isActive={pathname === "/withdrawals"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: "Transactions",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabIcon
                icon={() => (
                  <AntDesign name="swap" size={24} color={color} />
                )}
                color={color}
                label="Transactions"
                isActive={pathname === "/transactions"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabIcon
                icon={() => (
                  <AntDesign name="setting" size={24} color={color} />
                )}
                color={color}
                label="Settings"
                isActive={pathname === "/settings"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <TabIcon
                icon={() => (
                  <>
                    <Feather name="map-pin" size={24} color={color} />
                    <AntDesign name="user" size={24} color={color} />
                  </>
                )}
                color={color}
                label="Profile"
                isActive={pathname === "/profile"}
              />
            ),
          }}
        />
      </Tabs>
      <StatusBar backgroundColor={colors.background} style="standard" />
    </>
  );
};

export default TabLayout;
