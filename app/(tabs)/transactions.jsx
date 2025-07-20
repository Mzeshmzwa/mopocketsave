import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";
import { useRouter } from "expo-router";
import axios from "axios";

const TransactionsScreen = () => {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/(auth)/sign-in");
      return;
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/api/vault-info");
      
      if (response.data.success) {
        const vaultInfo = response.data.data;
        setTransactions(vaultInfo.recentTransactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <MaterialIcons name="add-circle" size={24} color="#4CAF50" />;
      case 'withdrawal':
        return <MaterialIcons name="remove-circle" size={24} color="#2196F3" />;
      case 'penalty':
        return <MaterialIcons name="warning" size={24} color="#F44336" />;
      default:
        return <MaterialIcons name="receipt" size={24} color={colors.primary} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
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

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  };

  const filteredTransactions = getFilteredTransactions();

  const calculateStats = () => {
    const deposits = transactions.filter(t => t.type === 'deposit');
    const withdrawals = transactions.filter(t => t.type === 'withdrawal');
    const penalties = transactions.filter(t => t.type === 'penalty');
    
    return {
      totalDeposited: deposits.reduce((sum, t) => sum + (t.amount || 0), 0),
      totalWithdrawn: withdrawals.reduce((sum, t) => sum + (t.amount || 0), 0),
      totalPenalties: penalties.reduce((sum, t) => sum + (t.amount || 0), 0),
      depositsCount: deposits.length,
      withdrawalsCount: withdrawals.length,
      penaltiesCount: penalties.length,
    };
  };

  const stats = calculateStats();

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionItem, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
      <View style={styles.transactionLeft}>
        {getTransactionIcon(item.type)}
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionDescription, { color: colors.onSurface }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.onSurfaceVariant }]}>
            {formatDate(item.createdAt)}
          </Text>
          {item.momoTransactionId && (
            <Text style={[styles.transactionRef, { color: colors.onSurfaceVariant }]}>
              Ref: {item.momoTransactionId.substring(0, 8)}...
            </Text>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          {
            color: item.type === 'deposit' ? '#4CAF50' : 
                   item.type === 'withdrawal' ? '#2196F3' : '#F44336'
          }
        ]}>
          {item.type === 'deposit' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
        {item.penaltyFee > 0 && (
          <Text style={[styles.transactionFee, { color: '#F44336' }]}>
            Fee: {formatCurrency(item.penaltyFee)}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onBackground }]}>
          Loading transactions...
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
        <Text style={[styles.headerTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Transactions
        </Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
          <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
            Total Deposited
          </Text>
          <Text style={[styles.summaryAmount, { color: "#4CAF50" }]}>
            {formatCurrency(stats.totalDeposited)}
          </Text>
          <Text style={[styles.summaryCount, { color: colors.onSurfaceVariant }]}>
            {stats.depositsCount} deposits
          </Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="trending-down" size={24} color="#2196F3" />
          <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
            Total Withdrawn
          </Text>
          <Text style={[styles.summaryAmount, { color: "#2196F3" }]}>
            {formatCurrency(stats.totalWithdrawn)}
          </Text>
          <Text style={[styles.summaryCount, { color: colors.onSurfaceVariant }]}>
            {stats.withdrawalsCount} withdrawals
          </Text>
        </View>
        
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="receipt" size={24} color="#F44336" />
          <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>
            Total Fees
          </Text>
          <Text style={[styles.summaryAmount, { color: "#F44336" }]}>
            {formatCurrency(stats.totalPenalties)}
          </Text>
          <Text style={[styles.summaryCount, { color: colors.onSurfaceVariant }]}>
            {stats.penaltiesCount} fees
          </Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['all', 'deposit', 'withdrawal', 'penalty'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              { 
                backgroundColor: filter === filterType ? colors.primary : colors.surface,
                borderColor: colors.outline
              }
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[
              styles.filterButtonText,
              { color: filter === filterType ? colors.onPrimary : colors.onSurface }
            ]}>
              {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsContainer}>
        <Text style={[styles.sectionTitle, typography.robotoBold, { color: colors.onBackground }]}>
          {filter === 'all' ? 'All Transactions' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Transactions`}
        </Text>
        
        {filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item, index) => item._id || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.transactionsList}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={64} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyStateTitle, { color: colors.onSurfaceVariant }]}>
              No {filter === 'all' ? '' : filter} transactions
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
              Your transaction history will appear here
            </Text>
          </View>
        )}
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
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryCount: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionRef: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionFee: {
    fontSize: 12,
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
  },
});

export default TransactionsScreen;