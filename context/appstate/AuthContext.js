import React, { useState, createContext, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Configure axios base URL - update this to match your backend
const API_BASE_URL = "http://localhost:5001/esavior-332e9/us-central1/api";
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  // Load token and user data on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Set up axios interceptor for auth token
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authToken]);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userData = await AsyncStorage.getItem("userData");
      
      if (token && userData) {
        setAuthToken(token);
        setCurrentUser(JSON.parse(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", {
        userEmail: email,
        password: password
      });

      if (response.data.success) {
        const { accessToken, user } = response.data.data;
        
        // Store token and user data
        await AsyncStorage.setItem("authToken", accessToken);
        await AsyncStorage.setItem("userData", JSON.stringify(user));
        
        setAuthToken(accessToken);
        setCurrentUser(user);
        
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Login failed. Please try again." 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/auth/register", {
        userName: userData.userName,
        userEmail: userData.userEmail,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        role: "user"
      });

      if (response.data.success) {
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Registration failed. Please try again." 
      };
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
      
      // Clear state
      setAuthToken(null);
      setCurrentUser(null);
      
      // Clear axios header
      delete axios.defaults.headers.common['Authorization'];
      
      // Navigate to auth screen
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAuthenticated = () => {
    return !!authToken && !!currentUser;
  };

  const value = {
    currentUser,
    authToken,
    login,
    register,
    logout,
    loadingAuth,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;