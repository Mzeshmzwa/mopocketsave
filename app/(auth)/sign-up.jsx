import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTheme, Snackbar, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { CustomButton } from "./../../components";
import { typography, images } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";
import { Redirect } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const TOP_SECTION_HEIGHT = 250;

const SignUp = () => {
  const { colors } = useTheme();
  const { register } = useAuth();

  // Registration role: individual or cooperative
  const [role, setRole] = useState("individual");
  const [redirect, setRedirect] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  // Snackbar states
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarStyle, setSnackbarStyle] = useState({});

  // Loading state for ActivityIndicator
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: field === "email" ? value.trim() : value,
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.displayName.trim() || !formData.email.trim() || 
        !formData.password.trim() || !formData.phoneNumber.trim()) {
      setSnackbarMessage("Please fill in all required fields");
      setSnackbarStyle({ backgroundColor: "red" });
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setSnackbarMessage("");
    
    try {
      const userData = {
        userName: formData.displayName,
        userEmail: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      };

      const result = await register(userData);

      if (result.success) {
        setSnackbarMessage("Registration successful! Please sign in.");
        setSnackbarStyle({ backgroundColor: "green" });
        setSnackbarVisible(true);

        setTimeout(() => {
          setRedirect(true);
        }, 1500);
      } else {
        setSnackbarMessage(result.error || "Registration failed");
        setSnackbarStyle({ backgroundColor: "red" });
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage("Registration failed. Please try again.");
      setSnackbarStyle({ backgroundColor: "red" });
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  if (redirect) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingTop: TOP_SECTION_HEIGHT },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text
              style={[
                styles.appName,
                typography.robotoBold,
                typography.title,
                { color: colors.tertiary },
              ]}
            >
              Create Account
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <TextInput
              mode="outlined"
              label="Full Name"
              value={formData.displayName}
              onChangeText={(value) =>
                handleInputChange("displayName", value)
              }
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange("phoneNumber", value)}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Password"
              secureTextEntry
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              style={styles.input}
            />

            {/* Submit Button */}
            <CustomButton
              disabled={loading}
              onPress={handleSubmit}
              title={
                loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  "Create Account"
                )
              }
            />
          </View>
        </ScrollView>

        {/* Static Top Section */}
        <View
          style={[
            styles.topSection,
            {
              backgroundColor: colors.primary,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            },
          ]}
        >
       
          <Image source={images.logo} style={styles.logo} />
          <Text
            style={[
              styles.title,
              typography.body,
              { color: colors.background },
            ]}
          >
            MO POCKET
          </Text>
        </View>

        {/* Snackbar for feedback messages */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={snackbarStyle}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  topSection: {
    height: TOP_SECTION_HEIGHT,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  backIcon: { position: "absolute", top: 40, left: 20 },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  title: { marginTop: 10 },
  headingContainer: { marginTop: 10, alignItems: "center", marginBottom: 10 },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  activeButton: { backgroundColor: "#007BFF" },
  toggleButtonText: { color: "#fff", fontWeight: "bold" },
  formContainer: { paddingHorizontal: 20 },
  input: { marginBottom: 15 },
  pickerContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
  },
  picker: { height: 50 },
  pickerLabel: { padding: 8, backgroundColor: "#f0f0f0" },
  uploadContainer: { alignItems: "center", marginVertical: 10 },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    width: "100%",
    borderStyle: "dotted",
    padding: 10,
    borderRadius: 5,
  },
  uploadButtonText: { fontSize: 16 },
  fileName: { marginTop: 5, textAlign: "center" },
});

export default SignUp;
