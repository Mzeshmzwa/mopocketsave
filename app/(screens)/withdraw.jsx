import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/card";

const WithdrawScreen = () => {
  return (
    <View style={styles.container}>
      <Card className="w-full max-w-md">
        <CardHeader className="flex-row items-center justify-between">
          <View style={styles.headerLeft}>
            <FontAwesome5 name="money-bill-wave" size={24} color="#0f172a" />
            <CardTitle className="ml-2">Withdraw Funds</CardTitle>
          </View>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Safely withdraw your funds from the Mo Pocket Vault. A E5 fee applies.
          </CardDescription>

          {/* You can place your Withdraw Form or Button here */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>💡 Withdrawals only allowed after 24 hours.</Text>
            <Text style={styles.infoText}>⚠️ Early withdrawal may attract a penalty.</Text>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

export default WithdrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 4,
  },
});
