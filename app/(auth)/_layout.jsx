import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/appstate/AuthContext";

const AuthLayout = () => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  if (isAuthenticated()) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default AuthLayout;
