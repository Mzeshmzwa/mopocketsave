import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../../context/appstate/AuthContext";
import CommonForm from "../../components/form-controls";
import { signInFormControls, signUpFormControls } from "../../config/index";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("signin");
  const [loading, setLoading] = useState(true);

  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
  } = useContext(AuthContext);

  const isSignInValid =
    signInFormData?.userEmail !== "" && signInFormData?.password !== "";

  const isSignUpValid =
    signUpFormData?.userName !== "" &&
    signUpFormData?.userEmail !== "" &&
    signUpFormData?.phoneNumber !== "" &&
    signUpFormData?.password !== "";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0033A0" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/default_cooperative.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>Mo Pocket</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "signin" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("signin")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "signin" && styles.activeTabText,
            ]}
          >
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "signup" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("signup")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "signup" && styles.activeTabText,
            ]}
          >
            Signup
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.title}>
          {activeTab === "signin" ? "Login" : "Signup"}
        </Text>

        <CommonForm
          formControls={
            activeTab === "signin" ? signInFormControls : signUpFormControls
          }
          buttonText={activeTab === "signin" ? "Login" : "Signup"}
          formData={activeTab === "signin" ? signInFormData : signUpFormData}
          setFormData={
            activeTab === "signin" ? setSignInFormData : setSignUpFormData
          }
          isButtonDisabled={
            activeTab === "signin" ? !isSignInValid : !isSignUpValid
          }
          handleSubmit={
            activeTab === "signin" ? handleLoginUser : handleRegisterUser
          }
        />

        {activeTab === "signin" && (
          <TouchableOpacity onPress={() => setActiveTab("signup")}>
            <Text style={styles.switchText}>
              Not a member?{" "}
              <Text style={styles.link}>Signup now</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FCEB89",
    flexGrow: 1,
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  logo: {
    width: 60,
    height: 40,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0033A0",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 30,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 30,
  },
  activeTab: {
    backgroundColor: "#0033A0",
  },
  tabText: {
    fontSize: 16,
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    color: "#0033A0",
    marginBottom: 20,
    fontWeight: "bold",
  },
  switchText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  link: {
    color: "#0033A0",
    fontWeight: "bold",
  },
});
