import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/appstate/AuthContext";
import axios from "axios";

const DashboardScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [vaultInfo, setVaultInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/(auth)/sign-in");
      return;
    }
    fetchVaultInfo();
  }, []);

  const fetchVaultInfo = async () => {
    try {
      setError("");
      const response = await axios.get("/api/vault-info");
      
      if (response.data.success) {
        setVaultInfo(response.data.data);
      } else {
        setError("Failed to load vault information");
      }
    } catch (err) {
      console.error("Vault info fetch error:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVaultInfo();
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return "E0.00";
    return `E${amount.toFixed(2)}`;
  };

  const calculateStats = () => {
    if (!vaultInfo) return null;

    const transactions = vaultInfo.recentTransactions || [];
    const deposits = vaultInfo.lockedDeposits || [];
    
    const depositTransactions = transactions.filter(t => t.type === 'deposit');
    const withdrawalTransactions = transactions.filter(t => t.type === 'withdrawal');
    const penaltyTransactions = transactions.filter(t => t.type === 'penalty');
    
    const totalDeposited = depositTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalWithdrawn = withdrawalTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalPenalties = penaltyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const activeDeposits = deposits.filter(d => d.status === 'locked');
    const totalLockedAmount = activeDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    return {
      vaultBalance: vaultInfo.vault?.balance || 0,
      totalDeposited,
      totalWithdrawn,
      totalPenalties,
      totalLockedAmount,
      activeDepositsCount: activeDeposits.length,
      totalDepositsCount: deposits.length,
      totalTransactions: transactions.length,
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
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.onBackground }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, typography.robotoBold, { color: colors.primary }]}>
            {currentUser?.userName || 'User'}!
          </Text>
        </View>
        <MaterialIcons name="account-balance-wallet" size={32} color={colors.primary} />
      </View>

      {/* Error Message */}
      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: colors.errorContainer }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity onPress={fetchVaultInfo} style={styles.retryButton}>
            <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/deposits")}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.actionButtonText}>Deposit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/withdrawals")}
        >
          <MaterialIcons name="remove" size={24} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="account-balance" size={24} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              Vault Balance
            </Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {formatCurrency(stats.vaultBalance)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              Total Deposited
            </Text>
            <Text style={[styles.statValue, { color: "#4CAF50" }]}>
              {formatCurrency(stats.totalDeposited)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="lock" size={24} color="#FF9800" />
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              Active Deposits
            </Text>
            <Text style={[styles.statValue, { color: "#FF9800" }]}>
              {stats.activeDepositsCount}
            </Text>
            <Text style={[styles.statSubValue, { color: colors.onSurfaceVariant }]}>
              {formatCurrency(stats.totalLockedAmount)} locked
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="receipt" size={24} color="#F44336" />
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
              Total Fees
            </Text>
            <Text style={[styles.statValue, { color: "#F44336" }]}>
              {formatCurrency(stats.totalPenalties)}
            </Text>
          </View>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            Recent Transactions
          </Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {vaultInfo?.recentTransactions?.length > 0 ? (
          vaultInfo.recentTransactions.slice(0, 3).map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <MaterialIcons 
                  name={transaction.type === 'deposit' ? 'add-circle' : 
                        transaction.type === 'withdrawal' ? 'remove-circle' : 'warning'} 
                  size={24} 
                  color={transaction.type === 'deposit' ? '#4CAF50' : 
                         transaction.type === 'withdrawal' ? '#2196F3' : '#F44336'} 
                />
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionType, { color: colors.onSurface }]}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Text>
                  <Text style={[styles.transactionDate, { color: colors.onSurfaceVariant }]}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'deposit' ? '#4CAF50' : 
                         transaction.type === 'withdrawal' ? '#2196F3' : '#F44336' }
              ]}>
                {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={48} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
              No transactions yet
            </Text>
          </View>
        )}
      </View>

      {/* Tips Section */}
      <View style={[styles.section, { backgroundColor: colors.primaryContainer }]}>
        <Text style={[styles.sectionTitle, { color: colors.onPrimaryContainer }]}>
          💡 Savings Tips
        </Text>
        <Text style={[styles.tipText, { color: colors.onPrimaryContainer }]}>
          • Lock funds for longer periods to avoid early withdrawal penalties
        </Text>
        <Text style={[styles.tipText, { color: colors.onPrimaryContainer }]}>
          • Minimum deposit is E10
        </Text>
        <Text style={[styles.tipText, { color: colors.onPrimaryContainer }]}>
          • Early withdrawal incurs 10% penalty + E5 fee
        </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    marginTop: 4,
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
  },
  retryButton: {
    marginLeft: 12,
  },
  retryText: {
    fontWeight: 'bold',
  },
  quickActions: {
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
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  statSubValue: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
  },
  tipText: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
});

export default DashboardScreen;