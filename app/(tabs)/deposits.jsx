import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme, TextInput } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";
import { useRouter } from "expo-router";
import axios from "axios";

const DepositScreen = () => {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    amount: "",
    lockDays: "",
    phoneNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [vaultInfo, setVaultInfo] = useState(null);

  // Predefined lock period options
  const lockPeriodOptions = [
    { days: 1, label: "1 Day", penalty: "10% penalty if early", color: "#FFEB3B" },
    { days: 2, label: "2 Days", penalty: "10% penalty if early", color: "#FF9800" },
    { days: 3, label: "3 Days", penalty: "10% penalty if early", color: "#FF5722" },
    { days: 7, label: "1 Week", penalty: "No penalty", color: "#4CAF50" },
    { days: 30, label: "1 Month", penalty: "No penalty", color: "#2196F3" },
  ];

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/(auth)/sign-in");
      return;
    }
    fetchVaultInfo();
  }, []);

  const fetchVaultInfo = async () => {
    try {
      const response = await axios.get("/api/vault-info");
      if (response.data.success) {
        setVaultInfo(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch vault info:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLockPeriodSelect = (days) => {
    setFormData(prev => ({
      ...prev,
      lockDays: days.toString()
    }));
  };

  const validateForm = () => {
    const { amount, lockDays, phoneNumber } = formData;
    
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount greater than 0.");
      return false;
    }

    if (parseFloat(amount) < 10) {
      Alert.alert("Error", "Minimum deposit amount is E10.");
      return false;
    }

    if (!lockDays || parseInt(lockDays) <= 0) {
      Alert.alert("Error", "Please select a lock period.");
      return false;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number.");
      return false;
    }

    return true;
  };

  const handleDeposit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const depositData = {
        amount: parseFloat(formData.amount),
        lockPeriodInDays: parseInt(formData.lockDays),
        phoneNumber: formData.phoneNumber.trim(),
      };

      const response = await axios.post("/api/deposit", depositData);

      if (response.data.success) {
        Alert.alert(
          "Success", 
          `Deposit of E${formData.amount} for ${formData.lockDays} days has been initiated!`,
          [
            {
              text: "OK",
              onPress: () => {
                setFormData({ amount: "", lockDays: "", phoneNumber: "" });
                fetchVaultInfo();
                router.push("/(tabs)/home");
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", response.data.message || "Failed to process deposit");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      Alert.alert("Error", error.response?.data?.message || "Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return "E0.00";
    return `E${amount.toFixed(2)}`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Make a Deposit
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
          Secure your funds with our vault system
        </Text>
      </View>

      {/* Vault Info */}
      {vaultInfo && (
        <View style={[styles.vaultInfo, { backgroundColor: colors.primaryContainer }]}>
          <View style={styles.vaultInfoHeader}>
            <MaterialIcons name="account-balance" size={24} color={colors.onPrimaryContainer} />
            <Text style={[styles.vaultInfoTitle, { color: colors.onPrimaryContainer }]}>
              Your Vault
            </Text>
          </View>
          <View style={styles.vaultStats}>
            <View style={styles.vaultStat}>
              <Text style={[styles.vaultStatLabel, { color: colors.onPrimaryContainer }]}>
                Current Balance
              </Text>
              <Text style={[styles.vaultStatValue, { color: colors.onPrimaryContainer }]}>
                {formatCurrency(vaultInfo.vault?.balance)}
              </Text>
            </View>
            <View style={styles.vaultStat}>
              <Text style={[styles.vaultStatLabel, { color: colors.onPrimaryContainer }]}>
                Active Deposits
              </Text>
              <Text style={[styles.vaultStatValue, { color: colors.onPrimaryContainer }]}>
                {vaultInfo.lockedDeposits?.length || 0}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Form */}
      <View style={styles.form}>
        {/* Amount Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
            Deposit Amount (E)
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Enter amount (min. E10)"
            value={formData.amount}
            onChangeText={(value) => handleInputChange("amount", value)}
            keyboardType="numeric"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />
          <Text style={[styles.inputHint, { color: colors.onSurfaceVariant }]}>
            Minimum deposit: E10
          </Text>
        </View>

        {/* Lock Period Selection */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
            Lock Period
          </Text>
          <View style={styles.lockPeriodGrid}>
            {lockPeriodOptions.map((option) => (
              <TouchableOpacity
                key={option.days}
                style={[
                  styles.lockPeriodOption,
                  { 
                    backgroundColor: formData.lockDays === option.days.toString() 
                      ? colors.primary 
                      : colors.surface,
                    borderColor: formData.lockDays === option.days.toString() 
                      ? colors.primary 
                      : colors.outline
                  }
                ]}
                onPress={() => handleLockPeriodSelect(option.days)}
                disabled={loading}
              >
                <MaterialIcons 
                  name="lock" 
                  size={20} 
                  color={formData.lockDays === option.days.toString() 
                    ? colors.onPrimary 
                    : colors.onSurface} 
                />
                <Text style={[
                  styles.lockPeriodLabel,
                  { color: formData.lockDays === option.days.toString() 
                      ? colors.onPrimary 
                      : colors.onSurface }
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.lockPeriodPenalty,
                  { color: formData.lockDays === option.days.toString() 
                      ? colors.onPrimary 
                      : colors.onSurfaceVariant }
                ]}>
                  {option.penalty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Lock Period */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
            Or Enter Custom Days
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Custom lock period (1-365 days)"
            value={formData.lockDays}
            onChangeText={(value) => handleInputChange("lockDays", value)}
            keyboardType="numeric"
            style={styles.input}
            left={<TextInput.Icon icon="calendar" />}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
            Phone Number
          </Text>
          <TextInput
            mode="outlined"
            placeholder="76123456 or 26876123456"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange("phoneNumber", value)}
            keyboardType="phone-pad"
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
          />
          <Text style={[styles.inputHint, { color: colors.onSurfaceVariant }]}>
            Enter your Eswatini mobile number
          </Text>
        </View>

        {/* Deposit Button */}
        <TouchableOpacity
          style={[
            styles.depositButton,
            { 
              backgroundColor: loading ? colors.surfaceVariant : colors.primary,
              opacity: loading ? 0.6 : 1
            }
          ]}
          onPress={handleDeposit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <>
              <MaterialIcons name="savings" size={24} color={colors.onPrimary} />
              <Text style={[styles.depositButtonText, { color: colors.onPrimary }]}>
                Deposit Funds
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Important Information */}
        <View style={[styles.infoSection, { backgroundColor: colors.surfaceVariant }]}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={20} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.onSurfaceVariant }]}>
              Important Information
            </Text>
          </View>
          <View style={styles.infoList}>
            <Text style={[styles.infoItem, { color: colors.onSurfaceVariant }]}>
              • Minimum deposit: E10
            </Text>
            <Text style={[styles.infoItem, { color: colors.onSurfaceVariant }]}>
              • Funds are locked for the selected period
            </Text>
            <Text style={[styles.infoItem, { color: colors.onSurfaceVariant }]}>
              • Early withdrawal: 10% penalty + E5 fee
            </Text>
            <Text style={[styles.infoItem, { color: colors.onSurfaceVariant }]}>
              • All transactions secured by MoMo API
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  vaultInfo: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  vaultInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaultInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  vaultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vaultStat: {
    alignItems: 'center',
  },
  vaultStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  vaultStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  form: {
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputHint: {
    fontSize: 12,
    marginTop: 4,
  },
  lockPeriodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  lockPeriodOption: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  lockPeriodLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  lockPeriodPenalty: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  depositButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DepositScreen;