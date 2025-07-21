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
import { useTheme, Searchbar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../../api/config";

const TransactionsScreen = () => {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "deposit", label: "Deposits" },
    { value: "withdrawal", label: "Withdrawals" },
    { value: "penalty", label: "Penalties" },
  ];

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/(auth)/welcome");
      return;
    }
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, filterType]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/vault-info`);
      
      if (response.data.success) {
        const vaultData = response.data.data;
        setTransactions(vaultData.recentTransactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(tx => 
        tx.momoTransactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const formatDate = (dateString) => {
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

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return 'arrow-upward';
      case 'withdrawal': return 'arrow-downward';
      case 'penalty': return 'warning';
      default: return 'swap-horiz';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit': return colors.primary;
      case 'withdrawal': return colors.secondary;
      case 'penalty': return colors.error;
      default: return colors.onSurfaceVariant;
    }
  };

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Transaction History
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search transactions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: colors.surface }]}
        />
      </View>

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterButton,
              {
                backgroundColor: filterType === option.value ? colors.primary : colors.surface,
                borderColor: colors.outline,
              }
            ]}
            onPress={() => setFilterType(option.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                {
                  color: filterType === option.value ? colors.onPrimary : colors.onSurface,
                }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={64} color={colors.onSurfaceVariant} />
            <Text style={[styles.emptyStateTitle, { color: colors.onSurfaceVariant }]}>
              No transactions found
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.onSurfaceVariant }]}>
              {searchQuery || filterType !== "all" 
                ? "Try adjusting your search or filter" 
                : "Your transaction history will appear here"}
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsContainer}>
            {filteredTransactions.map((transaction, index) => (
              <View
                key={transaction._id || index}
                style={[styles.transactionItem, { backgroundColor: colors.surface, borderColor: colors.outline }]}
              >
                <View style={styles.transactionLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${getTransactionColor(transaction.type)}20` }]}>
                    <MaterialIcons 
                      name={getTransactionIcon(transaction.type)} 
                      size={24} 
                      color={getTransactionColor(transaction.type)} 
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionType, { color: colors.onSurface }]}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.onSurfaceVariant }]}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                    {transaction.momoTransactionId && (
                      <Text style={[styles.transactionId, { color: colors.onSurfaceVariant }]}>
                        Ref: {transaction.momoTransactionId.substring(0, 12)}...
                      </Text>
                    )}
                    {transaction.lockPeriodInDays && (
                      <Text style={[styles.lockPeriod, { color: colors.onSurfaceVariant }]}>
                        Lock period: {transaction.lockPeriodInDays} days
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(transaction.type) }
                  ]}>
                    {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  {transaction.penaltyFee > 0 && (
                    <Text style={[styles.transactionFee, { color: colors.error }]}>
                      Fee: {formatCurrency(transaction.penaltyFee)}
                    </Text>
                  )}
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getTransactionColor(transaction.type)}20` }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getTransactionColor(transaction.type) }
                    ]}>
                      {transaction.status || 'Completed'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
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
  transactionsList: {
    flex: 1,
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  transactionId: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  lockPeriod: {
    fontSize: 10,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionFee: {
    fontSize: 10,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
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
});

export default TransactionsScreen;