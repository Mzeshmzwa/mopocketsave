import "react-native-gesture-handler";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import "react-native-url-polyfill/auto";
import { SplashScreen, Stack, Redirect } from "expo-router";
import { AuthProvider, AuthContext } from "../context/appstate/AuthContext";
import { UserProvider } from "../context/appstate/UserContext";
import { AdminProvider } from "../context/appstate/AdminContext";
import { useFrameworkReady } from "../hooks/useFrameworkReady";

import { PaperProvider } from "react-native-paper";
import theme from "../theme/theme";
import Toast from "react-native-toast-message";
import { useContext } from "react";

SplashScreen.preventAutoHideAsync();

const InnerLayout = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  useFrameworkReady();

  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) return null;

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <>
      <Stack initialRouteName="(auth)">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
};

const RootLayout = () => {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <UserProvider>
          <AdminProvider>
            <InnerLayout />
          </AdminProvider>
        </UserProvider>
      </AuthProvider>
    </PaperProvider>
  );
};

export default RootLayout;
