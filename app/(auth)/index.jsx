import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import CommonForm from "../../components/form-controls";
import { signInFormControls, signUpFormControls } from "../../config";
import { AuthContext } from "../../context/appstate/AuthContext";
import { useContext, useEffect, useState } from "react";

function AuthPage() {
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

  function handleTabChange(value) {
    setActiveTab(value);
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData?.userEmail !== "" && signInFormData?.password !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData?.userName !== "" &&
      signUpFormData?.userEmail !== "" &&
      signUpFormData?.phoneNumber !== "" &&
      signUpFormData?.password !== ""
    );
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Link href="/home" style={styles.headerLink}>
          <Image
            source={require("../../assets/images/default_cooperative.png")}
            style={styles.logo}
          />
          <Text style={styles.logoText}>Mo Pocket</Text>
        </Link>
      </View>

      {/* Main Body */}
      <View style={styles.mainContent}>
        <Tabs
          value={activeTab}
          defaultValue="signin"
          onValueChange={handleTabChange}
          style={styles.tabsContainer}
        >
          <TabsList className="grid w-full grid-cols-2 rounded-full p-1 bg-gray-200 mb-4">
            <TabsTrigger
              value="signin"
              className="data-[state=active]:bg-momoBlue data-[state=active]:text-white rounded-full"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-momoBlue data-[state=active]:text-white rounded-full"
            >
              Signup
            </TabsTrigger>
          </TabsList>

          {/* Sign In Form */}
          <TabsContent value="signin">
            <Card className="p-6 space-y-4 bg-white rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-momoBlue">Login</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CommonForm
                  formControls={signInFormControls}
                  buttonText={"Login"}
                  formData={signInFormData}
                  setFormData={setSignInFormData}
                  isButtonDisabled={!checkIfSignInFormIsValid()}
                  handleSubmit={handleLoginUser}
                />

                <Text className="text-center text-sm mt-2">
                  Not a member?{" "}
                  <Text
                    onPress={() => setActiveTab("signup")}
                    style={styles.signupText}
                  >
                    Signup now
                  </Text>
                </Text>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign Up Form */}
          <TabsContent value="signup">
            <Card className="p-6 space-y-4 bg-white rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-momoBlue">Signup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CommonForm
                  formControls={signUpFormControls}
                  buttonText={"Signup"}
                  formData={signUpFormData}
                  setFormData={setSignUpFormData}
                  isButtonDisabled={!checkIfSignUpFormIsValid()}
                  handleSubmit={handleRegisterUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 40,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Poppins-ExtraBold',
    color: '#0066cc',
    marginLeft: 8,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  tabsContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  signupText: {
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
});

export default AuthPage;
