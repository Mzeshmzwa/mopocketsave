import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme, TextInput } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUpScreen = () => {
  const { colors } = useTheme();
  const { register } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.userName.trim()) {
      Alert.alert("Error", "Full name is required");
      return false;
    }
    if (!formData.userEmail.trim()) {
      Alert.alert("Error", "Email is required");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert("Error", "Phone number is required");
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert("Error", "Password is required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);
      
      if (result.success) {
        Alert.alert(
          "Success", 
          "Account created successfully! Please sign in.",
          [
            {
              text: "OK",
              onPress: () => router.push("/(auth)/sign-in")
            }
          ]
        );
      } else {
        Alert.alert("Registration Failed", result.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primaryContainer }]}>
              <MaterialIcons name="person-add" size={48} color={colors.onPrimaryContainer} />
            </View>
            <Text style={[styles.title, typography.robotoBold, { color: colors.onBackground }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Join Mo Pocket and start saving securely
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.userName}
                onChangeText={(value) => handleInputChange("userName", value)}
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.userEmail}
                onChangeText={(value) => handleInputChange("userEmail", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Phone Number"
                placeholder="76123456 or 26876123456"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange("phoneNumber", value)}
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" />}
              />
              <Text style={[styles.inputHint, { color: colors.onSurfaceVariant }]}>
                Enter Eswatini mobile number (76, 78, or 79 prefix)
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                mode="outlined"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange("confirmPassword", value)}
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon 
                    icon={showConfirmPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
              />
            </View>

            <TouchableOpacity
              style={[
                styles.signUpButton,
                { 
                  backgroundColor: loading ? colors.surfaceVariant : colors.primary,
                  opacity: loading ? 0.6 : 1
                }
              ]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <>
                  <MaterialIcons name="person-add" size={24} color={colors.onPrimary} />
                  <Text style={[styles.signUpButtonText, { color: colors.onPrimary }]}>
                    Create Account
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text style={[styles.termsText, { color: colors.onSurfaceVariant }]}>
              By creating an account, you agree to our{" "}
              <Text style={{ color: colors.primary }}>Terms of Service</Text>
              {" "}and{" "}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.onSurfaceVariant }]}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputHint: {
    fontSize: 12,
    marginTop: 4,
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;