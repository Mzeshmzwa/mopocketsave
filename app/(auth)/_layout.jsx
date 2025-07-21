import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";



const AuthLayout = () => {
  const { isLoading, isAuthenticated } = useAuth();

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

        <Stack.Screen
        />
      </Stack>
    </>
  );
};

export default AuthLayout;
