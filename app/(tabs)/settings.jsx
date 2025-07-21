import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme, Switch } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";

const SettingsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    Alert.alert(
      "Notifications", 
      notifications ? "Notifications disabled" : "Notifications enabled"
    );
  };

  const handleBiometricToggle = () => {
    setBiometric(!biometric);
    Alert.alert(
      "Biometric Authentication", 
      biometric ? "Biometric authentication disabled" : "Biometric authentication enabled"
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert("Privacy Policy", "Privacy policy will be displayed here.");
  };

  const handleTermsOfService = () => {
    Alert.alert("Terms of Service", "Terms of service will be displayed here.");
  };

  const handleAbout = () => {
    Alert.alert(
      "About Mo Pocket",
      "Mo Pocket v5.1.3\nSecure savings vault application\n\nDeveloped for Eswatini mobile money users."
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Settings
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
          Customize your app experience
        </Text>
      </View>

      {/* Account Settings */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Account Settings
        </Text>
        
        <View style={[styles.settingItem, { borderBottomColor: colors.outline }]}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="notifications" size={24} color={colors.onSurface} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                Push Notifications
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
                Receive alerts for deposits and withdrawals
              </Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationToggle}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: colors.outline }]}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="fingerprint" size={24} color={colors.onSurface} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                Biometric Authentication
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
                Use fingerprint or face ID to login
              </Text>
            </View>
          </View>
          <Switch
            value={biometric}
            onValueChange={handleBiometricToggle}
          />
        </View>

        <View style={[styles.settingItem, { borderBottomColor: colors.outline }]}>
          <View style={styles.settingLeft}>
            <MaterialIcons name="dark-mode" size={24} color={colors.onSurface} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
                Switch to dark theme
              </Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </View>
      </View>

      {/* Security Settings */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Security
        </Text>
        
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.outline }]}
          onPress={() => Alert.alert("Change Password", "Password change functionality will be implemented.")}
        >
          <View style={styles.settingLeft}>
            <MaterialIcons name="lock" size={24} color={colors.onSurface} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                Change Password
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
                Update your account password
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.outline }]}
          onPress={() => Alert.alert("Two-Factor Authentication", "2FA setup will be implemented.")}
        >
          <View style={styles.settingLeft}>
            <MaterialIcons name="security" size={24} color={colors.onSurface} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
                Two-Factor Authentication
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.onSurfaceVariant }]}>
                Add extra security to your account
              </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Support & Legal */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Support & Legal
        </Text>
        
        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.outline }]}
          onPress={() => Alert.alert("Help Center", "Help documentation will be displayed here.")}
        >
          <View style={styles.settingLeft}>
            <MaterialIcons name="help" size={24} color={colors.onSurface} />
            <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
              Help Center
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.outline }]}
          onPress={handlePrivacyPolicy}
        >
          <View style={styles.settingLeft}>
            <MaterialIcons name="privacy-tip" size={24} color={colors.onSurface} />
            <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
              Privacy Policy
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.outline }]}
          onPress={handleTermsOfService}
        >
          <View style={styles.settingLeft}>
            <MaterialIcons name="description" size={24} color={colors.onSurface} />
            <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
              Terms of Service
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleAbout}
        >
          <View style={styles.settingLeft}>
            <MaterialIcons name="info" size={24} color={colors.onSurface} />
            <Text style={[styles.settingTitle, { color: colors.onSurface }]}>
              About Mo Pocket
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default SettingsScreen;