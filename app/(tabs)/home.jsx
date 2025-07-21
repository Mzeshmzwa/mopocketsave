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
import { useTheme } from "react-native-paper";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../../api/config";

const HomeScreen = () => {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [vaultInfo, setVaultInfo] = useState(null);
  const [withdrawableDeposits, setWithdrawableDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/(auth)/welcome");
      return;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch vault info and withdrawable deposits
      const [vaultRes, withdrawableRes] = await Promise.all([
        axios.get(`${API_URL}/api/vault-info`).catch(() => ({ data: { success: false, data: null } })),
        axios.get(`${API_URL}/api/withdrawable-deposits`).catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (vaultRes.data.success) {
        setVaultInfo(vaultRes.data.data);
      }

      if (withdrawableRes.data.success) {
        setWithdrawableDeposits(withdrawableRes.data.data);
      }

    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError("Failed to fetch user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToDeposit = () => {
    router.push("/(tabs)/deposits");
  };

  const goToWithdraw = () => {
    router.push("/(tabs)/withdrawals");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return "E0.00";
    return `E${amount.toFixed(2)}`;
  };

  // Calculate comprehensive statistics
  const calculateStats = () => {
    if (!vaultInfo) return null;

    const transactions = vaultInfo.recentTransactions || [];
    const deposits = vaultInfo.lockedDeposits || [];
    
    // Transaction-based calculations
    const depositTransactions = transactions.filter(t => t.type === 'deposit');
    const withdrawalTransactions = transactions.filter(t => t.type === 'withdrawal');
    const penaltyTransactions = transactions.filter(t => t.type === 'penalty');
    
    const totalDeposited = depositTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalWithdrawn = withdrawalTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalPenalties = penaltyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Active deposits calculations
    const activeDeposits = deposits.filter(d => d.status === 'locked');
    const totalLockedAmount = activeDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    // Withdrawable amount calculation
    const withdrawableAmount = withdrawableDeposits.reduce((sum, d) => sum + (d.netAmount || 0), 0);
    
    return {
      vaultBalance: vaultInfo.vault?.balance || 0,
      totalDeposited,
      totalWithdrawn,
      totalPenalties,
      totalLockedAmount,
      withdrawableAmount,
      activeDepositsCount: activeDeposits.length,
      totalDepositsCount: deposits.length,
      totalTransactions: transactions.length,
      depositTransactionsCount: depositTransactions.length,
      withdrawalTransactionsCount: withdrawalTransactions.length,
      penaltyTransactionsCount: penaltyTransactions.length
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onBackground }]}>
          Loading your vault...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Welcome back, {user?.userName || 'User'}!
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
          Manage your vault and track your savings
        </Text>
        {user?.phoneNumber && (
          <Text style={[styles.phoneText, { color: colors.onSurfaceVariant }]}>
            Phone: {user.phoneNumber}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={goToDeposit}
        >
          <MaterialIcons name="savings" size={24} color={colors.onPrimary} />
          <Text style={[styles.actionButtonText, { color: colors.onPrimary }]}>
            Deposit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={goToWithdraw}
        >
          <MaterialIcons name="account-balance-wallet" size={24} color={colors.onError} />
          <Text style={[styles.actionButtonText, { color: colors.onError }]}>
            Withdraw
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.errorContainer }]}>
          <MaterialIcons name="error" size={20} color={colors.onErrorContainer} />
          <Text style={[styles.errorText, { color: colors.onErrorContainer }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.primaryContainer }]}>
          <MaterialIcons name="trending-up" size={32} color={colors.onPrimaryContainer} />
          <Text style={[styles.statLabel, { color: colors.onPrimaryContainer }]}>
            Total Deposited
          </Text>
          <Text style={[styles.statValue, { color: colors.onPrimaryContainer }]}>
            {formatCurrency(stats?.totalDeposited)}
          </Text>
          <Text style={[styles.statSubtext, { color: colors.onPrimaryContainer }]}>
            {stats?.depositTransactionsCount || 0} deposits
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.secondaryContainer }]}>
          <MaterialIcons name="account-balance-wallet" size={32} color={colors.onSecondaryContainer} />
          <Text style={[styles.statLabel, { color: colors.onSecondaryContainer }]}>
            Available to Withdraw
          </Text>
          <Text style={[styles.statValue, { color: colors.onSecondaryContainer }]}>
            {formatCurrency(stats?.withdrawableAmount)}
          </Text>
          <Text style={[styles.statSubtext, { color: colors.onSecondaryContainer }]}>
            After fees & penalties
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.tertiaryContainer }]}>
          <MaterialIcons name="lock" size={32} color={colors.onTertiaryContainer} />
          <Text style={[styles.statLabel, { color: colors.onTertiaryContainer }]}>
            Active Deposits
          </Text>
          <Text style={[styles.statValue, { color: colors.onTertiaryContainer }]}>
            {stats?.activeDepositsCount || 0}
          </Text>
          <Text style={[styles.statSubtext, { color: colors.onTertiaryContainer }]}>
            {formatCurrency(stats?.totalLockedAmount)} locked
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.errorContainer }]}>
          <MaterialIcons name="warning" size={32} color={colors.onErrorContainer} />
          <Text style={[styles.statLabel, { color: colors.onErrorContainer }]}>
            Total Fees Paid
          </Text>
          <Text style={[styles.statValue, { color: colors.onErrorContainer }]}>
            {formatCurrency(stats?.totalPenalties)}
          </Text>
          <Text style={[styles.statSubtext, { color: colors.onErrorContainer }]}>
            {stats?.penaltyTransactionsCount || 0} penalty transactions
          </Text>
        </View>
      </View>

      {/* Account Summary */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: colors.onSurface }]}>
          Account Summary
        </Text>
        <View style={styles.summaryItems}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Total Deposits Made:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.onSurface }]}>
              {stats?.depositTransactionsCount || 0}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Total Withdrawals:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.onSurface }]}>
              {stats?.withdrawalTransactionsCount || 0}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Net Position:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {formatCurrency((stats?.totalDeposited || 0) - (stats?.totalWithdrawn || 0))}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
              Vault Balance:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {formatCurrency(stats?.vaultBalance)}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      {vaultInfo?.recentTransactions?.length > 0 && (
        <View style={[styles.transactionsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.transactionsTitle, { color: colors.onSurface }]}>
            Recent Transactions
          </Text>
          <View style={styles.transactionsList}>
            {vaultInfo.recentTransactions.slice(0, 5).map((transaction, index) => (
              <View key={transaction._id || index} style={[styles.transactionItem, { borderBottomColor: colors.outline }]}>
                <View style={styles.transactionLeft}>
                  <MaterialIcons 
                    name={transaction.type === 'deposit' ? 'arrow-upward' : 
                          transaction.type === 'withdrawal' ? 'arrow-downward' : 'warning'} 
                    size={24} 
                    color={transaction.type === 'deposit' ? colors.primary : 
                           transaction.type === 'withdrawal' ? colors.secondary : colors.error} 
                  />
                  <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionType, { color: colors.onSurface }]}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.onSurfaceVariant }]}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'deposit' ? colors.primary : 
                             transaction.type === 'withdrawal' ? colors.secondary : colors.error }
                  ]}>
                    {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  {transaction.penaltyFee > 0 && (
                    <Text style={[styles.transactionFee, { color: colors.error }]}>
                      Fee: {formatCurrency(transaction.penaltyFee)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
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
    fontSize: 24,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 10,
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryItems: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 12,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionFee: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default HomeScreen;