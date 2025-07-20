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
import { useTheme, TextInput, Checkbox } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";
import { useRouter } from "expo-router";
import axios from "axios";

const WithdrawScreen = () => {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [withdrawableDeposits, setWithdrawableDeposits] = useState([]);
  const [selectedDeposits, setSelectedDeposits] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/(auth)/sign-in");
      return;
    }
    fetchWithdrawableDeposits();
  }, []);

  const fetchWithdrawableDeposits = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/withdrawable-deposits");
      
      if (response.data.success) {
        setWithdrawableDeposits(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawable deposits:", error);
      Alert.alert("Error", "Failed to load withdrawable deposits");
    } finally {
      setLoading(false);
    }
  };

  const handleDepositSelection = (depositId) => {
    setSelectedDeposits(prev => {
      if (prev.includes(depositId)) {
        return prev.filter(id => id !== depositId);
      } else {
        return [...prev, depositId];
      }
    });
  };

  const selectAllDeposits = () => {
    const allDepositIds = withdrawableDeposits
      .filter(deposit => deposit.canWithdraw)
      .map(deposit => deposit.depositId);
    setSelectedDeposits(allDepositIds);
  };

  const clearAllSelections = () => {
    setSelectedDeposits([]);
  };

  const calculateTotals = () => {
    const selectedDepositData = withdrawableDeposits.filter(deposit => 
      selectedDeposits.includes(deposit.depositId)
    );

    const totalOriginal = selectedDepositData.reduce((sum, deposit) => sum + deposit.amount, 0);
    const totalFees = selectedDepositData.length * 5; // E5 per deposit
    const totalPenalties = selectedDepositData.reduce((sum, deposit) => sum + deposit.penalty, 0);
    const totalNet = selectedDepositData.reduce((sum, deposit) => sum + deposit.netAmount, 0);

    return {
      totalOriginal,
      totalFees,
      totalPenalties,
      totalNet,
      depositsCount: selectedDepositData.length
    };
  };

  const handleWithdraw = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Phone number is required");
      return;
    }
    
    if (selectedDeposits.length === 0) {
      Alert.alert("Error", "Please select at least one deposit to withdraw");
      return;
    }

    const totals = calculateTotals();
    
    Alert.alert(
      "Confirm Withdrawal",
      `You will receive E${totals.totalNet.toFixed(2)} after fees and penalties.\n\nProceed with withdrawal?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: processWithdrawal }
      ]
    );
  };

  const processWithdrawal = async () => {
    setWithdrawing(true);
    try {
      const response = await axios.post("/api/withdraw", {
        phoneNumber: phoneNumber.trim(),
        depositIds: selectedDeposits
      });

      if (response.data.success) {
        const { data } = response.data;
        Alert.alert(
          "Success",
          `Withdrawal processed successfully!\n\nTotal Withdrawn: E${data.totalWithdrawn}\nDeposits Processed: ${data.depositsProcessed}`,
          [
            {
              text: "OK",
              onPress: () => {
                setPhoneNumber("");
                setSelectedDeposits([]);
                fetchWithdrawableDeposits();
                router.push("/(tabs)/home");
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      Alert.alert("Error", error.response?.data?.message || "Withdrawal failed. Please try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return "E0.00";
    return `E${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onBackground }]}>
          Loading withdrawable deposits...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Withdraw Funds
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
          Select deposits to withdraw from
        </Text>
      </View>

      {/* Phone Number Input */}
      <View style={styles.phoneSection}>
        <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
          Phone Number
        </Text>
        <TextInput
          mode="outlined"
          placeholder="76123456 or 26876123456"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          style={styles.input}
          left={<TextInput.Icon icon="phone" />}
        />
        <Text style={[styles.inputHint, { color: colors.onSurfaceVariant }]}>
          Enter Eswatini mobile number (76, 78, or 79 prefix)
        </Text>
      </View>

      {/* Deposit Selection */}
      <View style={styles.depositsSection}>
        <View style={styles.depositsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
            Select Deposits to Withdraw
          </Text>
          <View style={styles.selectionButtons}>
            <TouchableOpacity onPress={selectAllDeposits} disabled={withdrawing}>
              <Text style={[styles.selectionButtonText, { color: colors.primary }]}>
                Select All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAllSelections} disabled={withdrawing}>
              <Text style={[styles.selectionButtonText, { color: colors.onSurfaceVariant }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {withdrawableDeposits.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="account-balance-wallet" size={64} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyStateTitle, { color: colors.onSurfaceVariant }]}>
              No withdrawable deposits
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
              Make a deposit first or wait for the lock period to mature
            </Text>
          </View>
        ) : (
          <View style={styles.depositsList}>
            {withdrawableDeposits.map((deposit) => (
              <TouchableOpacity
                key={deposit.depositId}
                style={[
                  styles.depositItem,
                  { 
                    backgroundColor: selectedDeposits.includes(deposit.depositId) 
                      ? colors.primaryContainer 
                      : colors.surface,
                    borderColor: selectedDeposits.includes(deposit.depositId) 
                      ? colors.primary 
                      : colors.outline,
                    opacity: deposit.canWithdraw ? 1 : 0.6
                  }
                ]}
                onPress={() => deposit.canWithdraw && handleDepositSelection(deposit.depositId)}
                disabled={!deposit.canWithdraw || withdrawing}
              >
                <View style={styles.depositLeft}>
                  <Checkbox
                    status={selectedDeposits.includes(deposit.depositId) ? 'checked' : 'unchecked'}
                    onPress={() => deposit.canWithdraw && handleDepositSelection(deposit.depositId)}
                    disabled={!deposit.canWithdraw || withdrawing}
                  />
                  <View style={styles.depositDetails}>
                    <View style={styles.depositHeader}>
                      <MaterialIcons name="savings" size={20} color={colors.primary} />
                      <Text style={[styles.depositAmount, { color: colors.onSurface }]}>
                        {formatCurrency(deposit.amount)}
                      </Text>
                      <Text style={[styles.depositPeriod, { color: colors.onSurfaceVariant }]}>
                        ({deposit.lockPeriodInDays} day{deposit.lockPeriodInDays !== 1 ? 's' : ''})
                      </Text>
                    </View>
                    <Text style={[styles.depositDate, { color: colors.onSurfaceVariant }]}>
                      Deposited: {formatDate(deposit.depositDate)}
                    </Text>
                    {deposit.isEarlyWithdrawal && (
                      <Text style={[styles.earlyWithdrawal, { color: colors.error }]}>
                        Early withdrawal
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.depositRight}>
                  <Text style={[styles.netAmount, { color: colors.primary }]}>
                    {formatCurrency(deposit.netAmount)}
                  </Text>
                  <View style={styles.fees}>
                    {deposit.penalty > 0 && (
                      <Text style={[styles.feeText, { color: colors.error }]}>
                        Penalty: {formatCurrency(deposit.penalty)}
                      </Text>
                    )}
                    <Text style={[styles.feeText, { color: colors.onSurfaceVariant }]}>
                      Fee: E{deposit.flatFee}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Selection Summary */}
      {selectedDeposits.length > 0 && (
        <View style={[styles.summarySection, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[styles.summaryTitle, { color: colors.onPrimaryContainer }]}>
            Withdrawal Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.onPrimaryContainer }]}>
                Deposits Selected
              </Text>
              <Text style={[styles.summaryValue, { color: colors.onPrimaryContainer }]}>
                {totals.depositsCount}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.onPrimaryContainer }]}>
                Total Original
              </Text>
              <Text style={[styles.summaryValue, { color: colors.onPrimaryContainer }]}>
                {formatCurrency(totals.totalOriginal)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.onPrimaryContainer }]}>
                Total Fees
              </Text>
              <Text style={[styles.summaryValue, { color: colors.error }]}>
                -{formatCurrency(totals.totalFees)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.onPrimaryContainer }]}>
                Total Penalties
              </Text>
              <Text style={[styles.summaryValue, { color: colors.error }]}>
                -{formatCurrency(totals.totalPenalties)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryTotal}>
            <Text style={[styles.summaryTotalLabel, { color: colors.onPrimaryContainer }]}>
              You will receive:
            </Text>
            <Text style={[styles.summaryTotalValue, { color: colors.onPrimaryContainer }]}>
              {formatCurrency(totals.totalNet)}
            </Text>
          </View>
        </View>
      )}

      {/* Withdraw Button */}
      <TouchableOpacity
        style={[
          styles.withdrawButton,
          { 
            backgroundColor: (withdrawing || selectedDeposits.length === 0) 
              ? colors.surfaceVariant 
              : colors.error,
            opacity: (withdrawing || selectedDeposits.length === 0) ? 0.6 : 1
          }
        ]}
        onPress={handleWithdraw}
        disabled={withdrawing || selectedDeposits.length === 0}
      >
        {withdrawing ? (
          <ActivityIndicator size="small" color={colors.onError} />
        ) : (
          <>
            <MaterialIcons name="account-balance-wallet" size={24} color={colors.onError} />
            <Text style={[styles.withdrawButtonText, { color: colors.onError }]}>
              Withdraw Selected Deposits ({selectedDeposits.length})
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Fee Information */}
      <View style={[styles.infoSection, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.infoTitle, { color: colors.onSurfaceVariant }]}>
          Withdrawal Information
        </Text>
        <View style={styles.infoList}>
          <Text style={[styles.infoItem, { color: colors.onSurfaceVariant }]}>
            • Each deposit processed individually
          </Text>
          <Text style={[styles.infoItem, { color: colors.onSurfaceVariant }]}>
            • Flat fee: E5 per deposit withdrawal
          </Text>
          <Text style={[styles.infoItem, { color: colors.onSurfaceVariant }]}>
            • Early withdrawal penalty: 10% of deposit amount
          </Text>
          <Text style={[styles.infoItem, { color: colors.onSurfaceVariant }]}>
            • No waiting period - withdraw immediately
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  phoneSection: {
    paddingHorizontal: 20,
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
  depositsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  depositsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  depositsList: {
    gap: 12,
  },
  depositItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  depositLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  depositDetails: {
    flex: 1,
    marginLeft: 12,
  },
  depositHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  depositAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  depositPeriod: {
    fontSize: 12,
    marginLeft: 8,
  },
  depositDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  earlyWithdrawal: {
    fontSize: 12,
    fontWeight: '500',
  },
  depositRight: {
    alignItems: 'flex-end',
  },
  netAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fees: {
    alignItems: 'flex-end',
  },
  feeText: {
    fontSize: 10,
  },
  summarySection: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default WithdrawScreen;