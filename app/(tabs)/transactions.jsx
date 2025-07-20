import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";

const TransactionsScreen = () => {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock transaction data - replace with actual API call
  useEffect(() => {
    const mockTransactions = [
      {
        id: '1',
        type: 'deposit',
        amount: 500,
        date: new Date().toISOString(),
        status: 'completed',
        description: 'Deposit to savings'
      },
      {
        id: '2',
        type: 'withdrawal',
        amount: 200,
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed',
        description: 'ATM withdrawal'
      },
      {
        id: '3',
        type: 'transfer',
        amount: 150,
        date: new Date(Date.now() - 172800000).toISOString(),
        status: 'pending',
        description: 'Transfer to John Doe'
      }
    ];

    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <Ionicons name="arrow-down-circle" size={24} color="#4CAF50" />;
      case 'withdrawal':
        return <Ionicons name="arrow-up-circle" size={24} color="#F44336" />;
      case 'transfer':
        return <Ionicons name="swap-horizontal" size={24} color="#2196F3" />;
      default:
        return <Ionicons name="card" size={24} color={colors.primary} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount, type) => {
    const sign = type === 'deposit' ? '+' : '-';
    return `${sign}E${amount.toFixed(2)}`;
  };

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
      <View style={styles.transactionLeft}>
        {getTransactionIcon(item.type)}
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionDescription, { color: colors.onSurface }]}>
            {item.description}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.onSurfaceVariant }]}>
            {formatDate(item.date)}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          {
            color: item.type === 'deposit' ? '#4CAF50' : 
                   item.type === 'withdrawal' ? '#F44336' : colors.primary
          }
        ]}>
          {formatAmount(item.amount, item.type)}
        </Text>
        <Text style={[
          styles.transactionStatus,
          {
            color: item.status === 'completed' ? '#4CAF50' : '#FF9800'
          }
        ]}>
          {item.status}
        </Text>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Transactions
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[styles.summaryLabel, { color: colors.onPrimaryContainer }]}>
            Total Balance
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.onPrimaryContainer }]}>
            E1,250.00
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.secondaryContainer }]}>
          <Text style={[styles.summaryLabel, { color: colors.onSecondaryContainer }]}>
            This Month
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.onSecondaryContainer }]}>
            +E850.00
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.tertiaryContainer }]}>
          <Text style={[styles.summaryLabel, { color: colors.onTertiaryContainer }]}>
            Pending
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.onTertiaryContainer }]}>
            E150.00
          </Text>
        </View>
      </ScrollView>

      {/* Transactions List */}
      <View style={styles.transactionsContainer}>
        <Text style={[styles.sectionTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Recent Transactions
        </Text>
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.transactionsList}
        />
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
  },
  filterButton: {
    padding: 8,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 120,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
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
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

export default TransactionsScreen;