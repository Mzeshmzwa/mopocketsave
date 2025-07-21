import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';


// Icon mapping object for easier reference
const Icons = {
  users: props => <FontAwesome name="users" {...props} />,
  piggyBank: props => <FontAwesome name="bank" {...props} />,
  exchange: props => <FontAwesome name="exchange" {...props} />,
  home: props => <FontAwesome name="home" {...props} />,
  arrowUp: props => <FontAwesome name="arrow-up" {...props} />,
  arrowDown: props => <FontAwesome name="arrow-down" {...props} />,
  warning: props => <FontAwesome name="warning" {...props} />,
  search: props => <FontAwesome name="search" {...props} />,
  filter: props => <FontAwesome name="filter" {...props} />,
  download: props => <FontAwesome name="download" {...props} />,
  chart: props => <FontAwesome name="line-chart" {...props} />,
  money: props => <FontAwesome5 name="money-bill-wave" {...props} />,
  percent: props => <FontAwesome name="percent" {...props} />,
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [vaults, setVaults] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, txRes, vaultRes, revenueRes] = await Promise.all([
          axiosInstance.get("/api/admin/users"),
          axiosInstance.get("/api/admin/transaction"),
          axiosInstance.get("/api/admin/vault"),
          axiosInstance.get("/api/admin/revenue")
        ]);

        setUsers(userRes.data.users || []);
        setTransactions(txRes.data.transaction || []);
        setVaults(vaultRes.data.vault || []);
        setRevenueData(revenueRes.data.data || null);
      } catch (err) {
        console.error("Admin fetch error:", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return Icons.arrowUp({ color: '#059669' });
      case 'withdrawal': return Icons.arrowDown({ color: '#2563eb' });
      case 'penalty': return Icons.warning({ color: '#dc2626' });
      default: return Icons.exchange({ color: '#4b5563' });
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit': return 'bg-green-50 border-green-200';
      case 'withdrawal': return 'bg-blue-50 border-blue-200';
      case 'penalty': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const stats = {
    totalUsers: users.length,
    totalTransactions: transactions.length,
    totalVaults: vaults.length,
    totalDeposits: transactions.filter(t => t.type === 'deposit').length,
    totalWithdrawals: transactions.filter(t => t.type === 'withdrawal').length,
    totalPenalties: transactions.filter(t => t.type === 'penalty').length,
    totalDepositAmount: transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalWithdrawalAmount: transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalPenaltyAmount: transactions.filter(t => t.type === 'penalty').reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  const totalUserPages = Math.ceil(users.length / usersPerPage);
  const paginatedUsers = users.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = searchTerm === "" || 
      tx.momoTransactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || tx.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ... Sidebar, Overview, Revenue, Users, Transactions Tabs ... */}

        {/* Vaults Tab */}
        {activeTab === 'vaults' && (
          <View style={styles.vaultContainer}>
            <Text style={styles.heading}>User Vaults</Text>
            <View style={styles.vaultGrid}>
              {vaults.map((vault, index) => (
                <View key={index} style={styles.vaultCard}>
                  <View style={styles.vaultHeader}>
                    <View>
                      <Text style={styles.vaultTitle}>Vault #{vault._id?.substring(0, 8)}</Text>
                      <Text style={styles.userId}>User ID: {vault.userId?.substring(0, 8)}...</Text>
                    </View>
                    <View style={styles.balanceContainer}>
                      <Text style={styles.balance}>E{vault.balance?.toFixed(2) || '0.00'}</Text>
                      <Text style={styles.balanceLabel}>Balance</Text>
                    </View>
                  </View>

                  {vault.lockedDeposits && vault.lockedDeposits.length > 0 && (
                    <View style={styles.depositsContainer}>
                      <Text style={styles.depositsHeading}>Locked Deposits:</Text>
                      <View style={styles.depositsList}>
                        {vault.lockedDeposits.map((deposit, depositIndex) => (
                          <View key={depositIndex} style={styles.depositItem}>
                            <View>
                              <Text style={styles.depositAmount}>E{deposit.amount.toFixed(2)}</Text>
                              <Text style={styles.depositDetails}>
                                {deposit.lockPeriodInDays} days • {deposit.status}
                              </Text>
                            </View>
                            <View style={styles.dateContainer}>
                              <Text style={styles.dateText}>Start: {formatDate(deposit.startDate)}</Text>
                              <Text style={styles.dateText}>End: {formatDate(deposit.endDate)}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  vaultContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  vaultGrid: {
    gap: 16,
  },
  vaultCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vaultTitle: {
    fontWeight: '600',
    color: '#1f2937',
  },
  userId: {
    fontSize: 12,
    color: '#6b7280',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontWeight: '600',
    fontSize: 18,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  depositsContainer: {
    marginTop: 16,
  },
  depositsHeading: {
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  depositsList: {
    gap: 8,
  },
  depositItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  depositAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  depositDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
