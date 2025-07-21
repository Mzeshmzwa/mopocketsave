import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { 
  FontAwesome,
  FontAwesome5 
} from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';

export default function DepositPage() {
  const [formData, setFormData] = useState({
    amount: "",
    lockDays: "",
    phoneNumber: ""
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [momoToken, setMomoToken] = useState(null);
  const [vaultInfo, setVaultInfo] = useState(null);

  // Predefined lock period options with benefits
  const lockPeriodOptions = [
    { days: 1, label: "1 Day", penalty: "10% if withdrawn early", color: "bg-yellow-100 border-yellow-300" },
    { days: 2, label: "2 Days", penalty: "10% if withdrawn early", color: "bg-orange-100 border-orange-300" },
    { days: 3, label: "3 Days", penalty: "10% if withdrawn early", color: "bg-red-100 border-red-300" },
    { days: 7, label: "1 Week", penalty: "No penalty", color: "bg-green-100 border-green-300" },
    { days: 30, label: "1 Month", penalty: "No penalty", color: "bg-blue-100 border-blue-300" },
  ];

  useEffect(() => {
    const initializePage = async () => {
      await Promise.all([
        fetchMomoToken(),
        fetchVaultInfo()
      ]);
    };
    initializePage();
  }, []);

  const fetchMomoToken = async () => {
    try {
      setTokenLoading(true);
      const res = await axiosInstance.post("/momo/token");
      const token = res.data?.data?.access_token;
      if (token) {
        setMomoToken(token);
        console.log("MoMo token fetched successfully");
      } else {
        console.warn("No MoMo token returned:", res.data);
        setMessage({
          type: "error",
          text: "Failed to initialize payment system. Please refresh the page."
        });
      }
    } catch (error) {
      console.error("MoMo token fetch failed:", error);
      setMessage({
        type: "error",
        text: "Failed to connect to payment system. Please check your connection."
      });
    } finally {
      setTokenLoading(false);
    }
  };

  const fetchVaultInfo = async () => {
    try {
      const response = await axiosInstance.get("/api/vault-info");
      setVaultInfo(response.data.data);
    } catch (error) {
      console.error("Failed to fetch vault info:", error);
      // Don't show error for vault info as it might not exist yet
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const handleLockPeriodSelect = (days) => {
    setFormData(prev => ({
      ...prev,
      lockDays: days.toString()
    }));
    if (message) {
      setMessage(null);
    }
  };

  const validateForm = () => {
    const { amount, lockDays, phoneNumber } = formData;
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount greater than 0." });
      return false;
    }

    if (parseFloat(amount) < 10) {
      setMessage({ type: "error", text: "Minimum deposit amount is E10." });
      return false;
    }

    if (!lockDays || parseInt(lockDays) <= 0) {
      setMessage({ type: "error", text: "Please select a lock period." });
      return false;
    }

    if (!phoneNumber.trim()) {
      setMessage({ type: "error", text: "Please enter your phone number." });
      return false;
    }

    // Basic phone validation for Eswatini
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setMessage({ type: "error", text: "Please enter a valid phone number." });
      return false;
    }

    return true;
  };

  const handleDeposit = async () => {
    if (!validateForm()) return;

    if (!momoToken) {
      setMessage({
        type: "error",
        text: "Payment system not ready. Please refresh the page and try again."
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const depositData = {
        userId: localStorage.getItem("userId"),
        amount: parseFloat(formData.amount),
        lockPeriodInDays: parseInt(formData.lockDays),
        phoneNumber: formData.phoneNumber.trim(),
        orderId: `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      console.log("Sending deposit request:", depositData);

      const res = await axiosInstance.post("/momo/money-collect", depositData);

      console.log("Deposit response:", res.data);

      if (res.data.status === "SUCCESSFUL" || res.data.status === "PENDING" || res.data.message) {
        setMessage({ 
          type: "success", 
          text: `Deposit initiated successfully!\nAmount: E${formData.amount}\nLock Period: ${formData.lockDays} days\nReference: ${res.data.referenceId || 'N/A'}`
        });
        
        // Reset form
        setFormData({
          amount: "",
          lockDays: "",
          phoneNumber: ""
        });

        // Refresh vault info
        setTimeout(() => {
          fetchVaultInfo();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: res.data.error || "Failed to process deposit. Please try again."
        });
      }
    } catch (err) {
      console.error("Deposit error:", err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          "Deposit failed. Please check your details and try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (tokenLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBox}>
          <FontAwesome name="spinner" size={24} color="#0066cc" />
          <Text style={styles.loadingText}>Initializing payment system...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <FontAwesome5 name="money-bill-wave" size={24} color="#0066cc" />
          <Text style={styles.title}>Make a Deposit</Text>
          <Text style={styles.subtitle}>Secure your funds with our vault system</Text>
        </View>

        {/* Vault Info Display */}
        {vaultInfo && (
          <View style={styles.vaultInfo}>
            <View style={styles.vaultInfoHeader}>
              <FontAwesome name="info-circle" size={16} color="#0066cc" />
              <Text style={styles.vaultInfoTitle}>Your Vault</Text>
            </View>
            <View style={styles.vaultInfoContent}>
              <View style={styles.vaultInfoItem}>
                <Text style={styles.vaultInfoLabel}>Current Balance:</Text>
                <Text style={styles.vaultInfoValue}>E{vaultInfo.vault?.balance?.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.vaultInfoItem}>
                <Text style={styles.vaultInfoLabel}>Active Deposits:</Text>
                <Text style={styles.vaultInfoValue}>{vaultInfo.lockedDeposits?.length || 0}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Message Display */}
        {message && (
          <View style={[styles.messageBox, message.type === "success" ? styles.successMessage : styles.errorMessage]}>
            <View style={styles.messageContent}>
              {message.type === "success" ? (
                <FontAwesome name="check-circle" size={16} color="#28a745" />
              ) : (
                <FontAwesome name="exclamation-triangle" size={16} color="#dc3545" />
              )}
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deposit Amount (E)</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="money-bill-wave" size={16} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter amount (min. E10)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                disabled={loading}
              />
            </View>
            <Text style={styles.helperText}>Minimum deposit: E10</Text>
          </View>

          {/* Lock Period Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lock Period</Text>
            <View style={styles.lockPeriodContainer}>
              {lockPeriodOptions.map((option) => (
                <TouchableOpacity
                  key={option.days}
                  onPress={() => handleLockPeriodSelect(option.days)}
                  disabled={loading}
                  style={[styles.lockPeriodButton, formData.lockDays === option.days.toString() ? styles.lockPeriodButtonActive : { borderColor: option.color }]}
                >
                  <View style={styles.lockPeriodContent}>
                    <Text style={styles.lockPeriodLabel}>{option.label}</Text>
                    <Text style={styles.lockPeriodPenalty}>{option.penalty}</Text>
                  </View>
                  <FontAwesome name="lock" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helperText}>
              Early withdrawal from 1-3 day locks incurs a 10% penalty + E5 fee
            </Text>
          </View>

          {/* Custom Lock Period */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Or Enter Custom Days</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="lock" size={16} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Custom lock period (days)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                name="lockDays"
                value={formData.lockDays}
                onChange={handleInputChange}
                disabled={loading}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome name="credit-card" size={16} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="76123456 or 26876123456"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={loading}
              />
            </View>
            <Text style={styles.helperText}>
              Enter your Eswatini mobile number (76, 78, or 79)
            </Text>
          </View>

          {/* Deposit Button */}
          <TouchableOpacity
            onPress={handleDeposit}
            disabled={loading || !momoToken}
            style={[styles.depositButton, (loading || !momoToken) && styles.depositButtonDisabled]}
          >
            {loading ? (
              <>
                <FontAwesome name="spinner" size={16} color="#fff" style={styles.spinner} />
                <Text style={styles.depositButtonText}>Processing Deposit...</Text>
              </>
            ) : (
              <>
                <FontAwesome5 name="money-bill-wave" size={16} color="#fff" />
                <Text style={styles.depositButtonText}>Deposit Funds</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Important Information */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Important Information</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Minimum deposit: E10</Text>
            <Text style={styles.infoItem}>• Funds are locked for the selected period</Text>
            <Text style={styles.infoItem}>• Early withdrawal from 1-3 day locks: 10% penalty + E5 fee</Text>
            <Text style={styles.infoItem}>• Withdrawals available 24 hours after deposit</Text>
            <Text style={styles.infoItem}>• All transactions are secured by MoMo API</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Add your styles here
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  vaultInfo: {
    backgroundColor: '#e7f3ff',
    borderColor: '#b3d7ff',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  vaultInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vaultInfoTitle: {
    fontSize: 16,
    fontWeight: 'semibold',
    color: '#0066cc',
    marginLeft: 8,
  },
  vaultInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vaultInfoItem: {
    flex: 1,
    marginRight: 8,
  },
  vaultInfoLabel: {
    fontSize: 12,
    color: '#666',
  },
  vaultInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  messageBox: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  successMessage: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  form: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'medium',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -50 }],
    color: '#999',
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 48,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  lockPeriodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lockPeriodButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lockPeriodButtonActive: {
    borderColor: '#0066cc',
    backgroundColor: '#e7f3ff',
  },
  lockPeriodContent: {
    flex: 1,
  },
  lockPeriodLabel: {
    fontSize: 16,
    fontWeight: 'medium',
    color: '#333',
  },
  lockPeriodPenalty: {
    fontSize: 12,
    color: '#666',
  },
  depositButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#0066cc',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  depositButtonDisabled: {
    backgroundColor: '#ccc',
  },
  depositButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: '#f7f9fc',
    borderColor: '#d1e7dd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'semibold',
    color: '#333',
    marginBottom: 8,
  },
  infoList: {
    paddingLeft: 16,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
  },
  loadingBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  spinner: {
    marginRight: 8,
  },
};