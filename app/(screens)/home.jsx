import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from "expo-router";
import axiosInstance from "../../api/axiosInstance";
import { 
  FontAwesome,
  FontAwesome5 
} from '@expo/vector-icons';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [vaultInfo, setVaultInfo] = useState(null);
  const [withdrawableDeposits, setWithdrawableDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const id = localStorage.getItem("userId");
        if (!id) {
          setError("No user ID found. Please log in again.");
          router.push("/auth");
          return;
        }

        // Fetch user profile, vault info, and withdrawable deposits
        const [userRes, vaultRes, withdrawableRes] = await Promise.all([
          axiosInstance.get(`/api/user/${id}`),
          axiosInstance.get("/api/vault-info").catch(() => ({ data: { success: false, data: null } })),
          axiosInstance.get("/api/withdrawable-deposits").catch(() => ({ data: { success: false, data: [] } }))
        ]);

        if (userRes.data.success) {
          setUser(userRes.data.data);
        }

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

    fetchUserData();
  }, []);

  const goToDeposit = async () => {
    try {
      const res = await axiosInstance.post("/momo/token");
      if (res.data.data?.access_token) {
        localStorage.setItem("momoToken", res.data.data.access_token);
      }
      router.push("/deposit");
    } catch (err) {
      console.error("Failed to generate MoMo token:", err);
      setError("Failed to generate payment token. Please try again.");
    }
  };

  const goToWithdraw = () => router.push("/withdraw");

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

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return <FontAwesome name="arrow-up" size={24} color="#16a34a" />;
      case 'withdrawal': return <FontAwesome name="arrow-down" size={24} color="#2563eb" />;
      case 'penalty': return <FontAwesome name="exclamation-triangle" size={24} color="#dc2626" />;
      default: return <FontAwesome name="exchange" size={24} color="#4b5563" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit': return 'border-l-green-500 bg-green-50';
      case 'withdrawal': return 'border-l-blue-500 bg-blue-50';
      case 'penalty': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getDepositStatusInfo = (deposit) => {
    const now = new Date();
    const depositTime = new Date(deposit.createdAt);
    const lockPeriodInHours = deposit.lockPeriodInDays * 24;
    
    // Calculate maturity date
    const maturityDate = new Date(depositTime);
    maturityDate.setHours(maturityDate.getHours() + lockPeriodInHours);
    
    const isMatured = now >= maturityDate;
    
    if (deposit.status !== 'locked') {
      return { 
        status: deposit.status === 'withdrawn-early' ? 'Withdrawn Early' : 'Withdrawn', 
        color: 'text-gray-600', 
        icon: FaCheckCircle,
        bgColor: 'bg-gray-100',
        canWithdraw: false
      };
    }
    
    if (isMatured) {
      return { 
        status: 'Matured - Ready', 
        color: 'text-green-600', 
        icon: FaCheckCircle,
        bgColor: 'bg-green-100',
        canWithdraw: true,
        penalty: 0
      };
    }
    
    // Early withdrawal with penalty
    const penalty = deposit.amount * 0.10; // 10% penalty
    return { 
      status: 'Early (10% penalty)', 
      color: 'text-yellow-600', 
      icon: FaExclamationTriangle,
      bgColor: 'bg-yellow-100',
      canWithdraw: true,
      penalty: penalty
    };
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={{ marginTop: 12, color: '#4b5563' }}>Loading your vault...</Text>
      </View>
    );
  }

  return (
    <>
   
      <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#f9fafb' }}>
        {/* Sidebar */}
        <View style={{ width: 256, backgroundColor: '#1e3a8a', padding: 24, paddingTop: 48, position: 'relative' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24', marginBottom: 32, flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome name="wallet" size={28} color="#fbbf24" style={{ marginRight: 8 }} />
            Mo Pocket
          </Text>
          <View style={{ marginBottom: 32 }}>
            {[
              { id: 'dashboard', icon: 'tachometer', label: 'Dashboard' },
              { id: 'deposits', icon: 'lock', label: 'My Deposits' },
              { id: 'transactions', icon: 'exchange', label: 'Transactions' },
              { id: 'withdrawals', icon: 'arrow-down', label: 'Withdrawals' },
            ].map(({ id, icon, label }) => (
              <TouchableOpacity
                key={id}
                onPress={() => setActiveTab(id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: activeTab === id ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                <FontAwesome5 name={icon} size={18} color={activeTab === id ? '#fbbf24' : '#e5e7eb'} style={{ marginRight: 12 }} />
                <Text style={{ color: activeTab === id ? '#fbbf24' : '#e5e7eb', fontWeight: activeTab === id ? '600' : '400' }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
            <Text style={{ color: '#e5e7eb', fontSize: 12, marginBottom: 8 }}>Version 1.0.0</Text>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <FontAwesome name="cog" size={18} color="#fbbf24" style={{ marginRight: 12 }} />
              <Text style={{ color: '#fbbf24', fontWeight: '500' }}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1, padding: 16 }}>
          {/* Header Actions */}
          <View style={{ flexDirection: 'column', marginBottom: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
              Welcome back, {user?.userName || 'User'}!
            </Text>
            <Text style={{ color: '#6b7280', marginBottom: 4 }}>
              Manage your vault and track your savings
            </Text>
            {user?.phoneNumber && (
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                Phone: {user.phoneNumber}
              </Text>
            )}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <TouchableOpacity
              onPress={goToDeposit}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fbbf24',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                elevation: 2,
                flex: 1,
                marginRight: 8
              }}
            >
              <FontAwesome5 name="arrow-up" size={18} color="#1e3a8a" style={{ marginRight: 8 }} />
              <Text style={{ color: '#1e3a8a', fontWeight: '500' }}>
                Deposit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToWithdraw}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#dc2626',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                elevation: 2,
                flex: 1
              }}
            >
              <FontAwesome5 name="arrow-down" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#ffffff', fontWeight: '500' }}>
                Withdraw
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name="times-circle" size={20} color="#dc2626" style={{ marginRight: 12 }} />
              <Text style={{ color: '#dc2626' }}>
                {error}
              </Text>
            </View>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
                <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, flex: 1, marginRight: 8, marginBottom: 8, elevation: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View>
                      <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                        Total Deposited
                      </Text>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2563eb' }}>
                        {formatCurrency(stats?.totalDeposited)}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#9ca3af' }}>
                        {stats?.depositTransactionsCount || 0} deposits
                      </Text>
                    </View>
                    <FontAwesome5 name="chart-line" size={28} color="#2563eb" />
                  </View>
                </View>

                <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, flex: 1, marginRight: 8, marginBottom: 8, elevation: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View>
                      <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                        Available to Withdraw
                      </Text>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#16a34a' }}>
                        {formatCurrency(stats?.withdrawableAmount)}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#9ca3af' }}>
                        After fees & penalties
                      </Text>
                    </View>
                    <FontAwesome5 name="money-bill-wave" size={28} color="#16a34a" />
                  </View>
                </View>

                <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, flex: 1, marginRight: 8, marginBottom: 8, elevation: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View>
                      <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                        Active Deposits
                      </Text>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ca8a04' }}>
                        {stats?.activeDepositsCount || 0}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#9ca3af' }}>
                        {formatCurrency(stats?.totalLockedAmount)} locked
                      </Text>
                    </View>
                    <FontAwesome name="lock" size={28} color="#ca8a04" />
                  </View>
                </View>

                <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, flex: 1, marginBottom: 8, elevation: 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View>
                      <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                        Total Fees Paid
                      </Text>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>
                        {formatCurrency(stats?.totalPenalties)}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#9ca3af' }}>
                        {stats?.penaltyTransactionsCount || 0} penalty transactions
                      </Text>
                    </View>
                    <FontAwesome name="exclamation-triangle" size={28} color="#dc2626" />
                  </View>
                </View>
              </View>

              {/* Quick Summary */}
              <View style={{ flexDirection: 'column', marginBottom: 24 }}>
                {/* Account Summary */}
                <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 24, elevation: 2 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1e3a8a', marginBottom: 16 }}>
                    Account Summary
                  </Text>
                  <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                      <Text style={{ color: '#6b7280' }}>Total Deposits Made:</Text>
                      <Text style={{ fontWeight: '500' }}>{stats?.depositTransactionsCount || 0}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                      <Text style={{ color: '#6b7280' }}>Total Withdrawals:</Text>
                      <Text style={{ fontWeight: '500' }}>{stats?.withdrawalTransactionsCount || 0}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                      <Text style={{ color: '#6b7280' }}>Net Position:</Text>
                      <Text style={{ fontWeight: '500', color: '#2563eb' }}>
                        {formatCurrency((stats?.totalDeposited || 0) - (stats?.totalWithdrawn || 0))}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }}>
                      <Text style={{ color: '#6b7280' }}>Vault Balance:</Text>
                      <Text style={{ fontWeight: '500', color: '#16a34a' }}>
                        {formatCurrency(stats?.vaultBalance)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Withdrawal Rules */}
                <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, elevation: 2 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#1e3a8a', marginBottom: 16 }}>
                    Withdrawal Rules
                  </Text>
                  <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 }}>
                    <View style={{ borderWidth: 2, borderColor: '#fbbf24', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <FontAwesome name="exclamation-triangle" size={20} color="#fbbf24" style={{ marginRight: 8 }} />
                        <Text style={{ fontWeight: '500', color: '#fbbf24' }}>
                          Early Withdrawal
                        </Text>
                      </View>
                      <Text style={{ color: '#6b7280', fontSize: 14 }}>
                        10% penalty + E5 fee if withdrawn before maturity
                      </Text>
                    </View>
                    <View style={{ borderWidth: 2, borderColor: '#4ade80', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <FontAwesome name="check-circle" size={20} color="#4ade80" style={{ marginRight: 8 }} />
                        <Text style={{ fontWeight: '500', color: '#4ade80' }}>
                          Matured Withdrawal
                        </Text>
                      </View>
                      <Text style={{ color: '#6b7280', fontSize: 14 }}>
                        Only E5 flat fee (no penalty) after lock period
                      </Text>
                    </View>
                    <View style={{ borderWidth: 2, borderColor: '#60a5fa', borderRadius: 8, padding: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <FontAwesome name="clock" size={20} color="#60a5fa" style={{ marginRight: 8 }} />
                        <Text style={{ fontWeight: '500', color: '#60a5fa' }}>
                          Immediate Access
                        </Text>
                      </View>
                      <Text style={{ color: '#6b7280', fontSize: 14 }}>
                        No waiting period - withdraw anytime
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Deposits Tab */}
          {activeTab === 'deposits' && (
            <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, elevation: 2, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '500', color: '#1e3a8a' }}>
                  My Locked Deposits
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {stats?.activeDepositsCount || 0} active deposits
                </Text>
              </View>
              
              {vaultInfo?.lockedDeposits?.length > 0 ? (
                <View style={{ spaceY: 16 }}>
                  {vaultInfo.lockedDeposits.map((deposit, index) => {
                    const statusInfo = getDepositStatusInfo(deposit);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <View key={deposit._id || index} style={{ borderRadius: 8, padding: 16, backgroundColor: statusInfo.bgColor, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 }}>
                        <View style={{ flex: 1, marginRight: 16 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <FontAwesome5 name="money-bill-wave" size={24} color="#16a34a" style={{ marginRight: 8 }} />
                            <Text style={{ fontSize: 18, fontWeight: '500', color: '#111827' }}>
                              {formatCurrency(deposit.amount)}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 8, backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8 }}>
                              {deposit.lockPeriodInDays} day{deposit.lockPeriodInDays !== 1 ? 's' : ''} lock
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'column', marginTop: 8 }}>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                              <Text style={{ fontWeight: '500' }}>Deposited:</Text> {formatDate(deposit.createdAt)}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                              <Text style={{ fontWeight: '500' }}>Matures:</Text> {formatDate(deposit.endDate)}
                            </Text>
                            {statusInfo.penalty > 0 && (
                              <Text style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
                                <Text style={{ fontWeight: '500' }}>Early withdrawal penalty:</Text> {formatCurrency(statusInfo.penalty)}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <StatusIcon size={20} color={statusInfo.color} style={{ marginRight: 4 }} />
                            <Text style={{ fontSize: 14, fontWeight: '500', color: statusInfo.color }}>
                              {statusInfo.status}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 12, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 16, backgroundColor: deposit.status === 'locked' ? '#fef9c3' : deposit.status === 'withdrawn-early' ? '#fee2e2' : '#e5e7eb', color: deposit.status === 'locked' ? '#856404' : deposit.status === 'withdrawn-early' ? '#dc2626' : '#374151' }}>
                            {deposit.status.replace('-', ' ')}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                  <FontAwesome name="lock" size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                  <Text style={{ fontSize: 18, fontWeight: '500', color: '#111827', marginBottom: 8 }}>
                    No deposits found
                  </Text>
                  <Text style={{ color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>
                    Start saving today and watch your money grow!
                  </Text>
                  <TouchableOpacity
                    onPress={goToDeposit}
                    style={{
                      backgroundColor: '#fbbf24',
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 8,
                      elevation: 2,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <FontAwesome5 name="arrow-up" size={18} color="#1e3a8a" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#1e3a8a', fontWeight: '500' }}>
                      Make Your First Deposit
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, elevation: 2, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '500', color: '#1e3a8a' }}>
                  Transaction History
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {stats?.totalTransactions || 0} total transactions
                </Text>
              </View>
              
              {vaultInfo?.recentTransactions?.length > 0 ? (
                <View style={{ spaceY: 12 }}>
                  {vaultInfo.recentTransactions.map((transaction, index) => (
                    <View key={transaction._id || index} style={{ borderLeftWidth: 4, borderLeftColor: getTransactionColor(transaction.type), backgroundColor: 'white', borderRadius: 8, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {getTransactionIcon(transaction.type)}
                        <View style={{ marginLeft: 12 }}>
                          <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827', textTransform: 'capitalize' }}>
                            {transaction.type}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#6b7280' }}>
                            {formatDate(transaction.createdAt)}
                          </Text>
                          {transaction.momoTransactionId && (
                            <Text style={{ fontSize: 10, color: '#6b7280', fontFamily: 'monospace' }}>
                              Ref: {transaction.momoTransactionId.substring(0, 12)}...
                            </Text>
                          )}
                          {transaction.lockPeriodInDays && (
                            <Text style={{ fontSize: 10, color: '#6b7280' }}>
                              Lock period: {transaction.lockPeriodInDays} days
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 18, fontWeight: '500', color: transaction.type === 'deposit' ? '#16a34a' : transaction.type === 'withdrawal' ? '#2563eb' : '#dc2626' }}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </Text>
                        {transaction.penaltyFee > 0 && (
                          <Text style={{ fontSize: 10, color: '#dc2626' }}>
                            Fee: {formatCurrency(transaction.penaltyFee)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                  <FontAwesome name="exchange" size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                  <Text style={{ fontSize: 18, fontWeight: '500', color: '#111827', marginBottom: 8 }}>
                    No transactions found
                  </Text>
                  <Text style={{ color: '#6b7280', textAlign: 'center' }}>
                    Your transaction history will appear here
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Withdrawals Tab */}
          {activeTab === 'withdrawals' && (
            <View style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 16, elevation: 2, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '500', color: '#1e3a8a' }}>
                  Withdrawal History & Options
                </Text>
                <TouchableOpacity
                  onPress={goToWithdraw}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#dc2626',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    elevation: 2
                  }}
                >
                  <FontAwesome5 name="arrow-down" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#ffffff', fontWeight: '500' }}>
                    New Withdrawal
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Withdrawable Deposits Summary */}
              {withdrawableDeposits.length > 0 && (
                <View style={{ marginBottom: 24, padding: 16, borderRadius: 8, backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#60a5fa' }}>
                  <Text style={{ fontWeight: '500', color: '#1e3a8a', marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome5 name="eye" size={20} color="#60a5fa" style={{ marginRight: 8 }} />
                    Available for Withdrawal
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#374151' }}>Deposits available:</Text>
                    <Text style={{ fontWeight: '500', color: '#111827' }}>
                      {withdrawableDeposits.length}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#374151' }}>Total amount:</Text>
                    <Text style={{ fontWeight: '500', color: '#111827' }}>
                      {formatCurrency(withdrawableDeposits.reduce((sum, d) => sum + d.amount, 0))}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#374151' }}>Net after fees:</Text>
                    <Text style={{ fontWeight: '500', color: '#16a34a' }}>
                      {formatCurrency(withdrawableDeposits.reduce((sum, d) => sum + d.netAmount, 0))}
                    </Text>
                  </View>
                </View>
              )}

              {/* Withdrawal History */}
              {vaultInfo?.recentTransactions?.filter(t => t.type === 'withdrawal').length > 0 ? (
                <View style={{ spaceY: 12 }}>
                  <Text style={{ fontWeight: '500', color: '#111827', marginBottom: 8 }}>
                    Recent Withdrawals
                  </Text>
                  {vaultInfo.recentTransactions
                    .filter(t => t.type === 'withdrawal')
                    .map((withdrawal, index) => (
                      <View key={withdrawal._id || index} style={{ borderRadius: 8, padding: 16, backgroundColor: '#eff6ff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <FontAwesome5 name="arrow-down" size={24} color="#2563eb" style={{ marginRight: 8 }} />
                          <View>
                            <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>
                              Withdrawal
                            </Text>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                              {formatDate(withdrawal.createdAt)}
                            </Text>
                            {withdrawal.momoTransactionId && (
                              <Text style={{ fontSize: 10, color: '#6b7280', fontFamily: 'monospace' }}>
                                Ref: {withdrawal.momoTransactionId.substring(0, 12)}...
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 18, fontWeight: '500', color: '#2563eb' }}>
                            {formatCurrency(withdrawal.amount)}
                          </Text>
                          {withdrawal.penaltyFee > 0 && (
                            <Text style={{ fontSize: 10, color: '#dc2626' }}>
                              Total fees: {formatCurrency(withdrawal.penaltyFee)}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingVertical: 48 }}>
                  <FontAwesome5 name="arrow-down" size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                  <Text style={{ fontSize: 18, fontWeight: '500', color: '#111827', marginBottom: 8 }}>
                    No withdrawals yet
                  </Text>
                  <Text style={{ color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>
                    When you are ready, you can withdraw your deposits
                  </Text>
                  <TouchableOpacity
                    onPress={goToWithdraw}
                    style={{
                      backgroundColor: '#dc2626',
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 8,
                      elevation: 2,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <FontAwesome5 name="arrow-down" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#ffffff', fontWeight: '500' }}>
                      Make a Withdrawal
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </>
  );
}