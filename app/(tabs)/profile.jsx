import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme, TextInput } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";
import { useRouter } from "expo-router";

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: user?.userName || "",
    userEmail: user?.userEmail || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: logout 
        }
      ]
    );
  };

  const handleSave = () => {
    // TODO: Implement profile update API call
    setEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primaryContainer }]}>
          <MaterialIcons name="person" size={48} color={colors.onPrimaryContainer} />
        </View>
        <Text style={[styles.headerTitle, typography.robotoBold, { color: colors.onBackground }]}>
          {user?.userName || 'User'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
          {user?.userEmail || 'No email'}
        </Text>
      </View>

      {/* Profile Information */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            Profile Information
          </Text>
          <TouchableOpacity
            onPress={() => setEditing(!editing)}
            style={[styles.editButton, { backgroundColor: colors.primary }]}
          >
            <MaterialIcons 
              name={editing ? "close" : "edit"} 
              size={20} 
              color={colors.onPrimary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.formFields}>
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>
              Full Name
            </Text>
            {editing ? (
              <TextInput
                mode="outlined"
                value={formData.userName}
                onChangeText={(value) => handleInputChange("userName", value)}
                style={styles.input}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.onSurface }]}>
                {user?.userName || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>
              Email Address
            </Text>
            {editing ? (
              <TextInput
                mode="outlined"
                value={formData.userEmail}
                onChangeText={(value) => handleInputChange("userEmail", value)}
                keyboardType="email-address"
                style={styles.input}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.onSurface }]}>
                {user?.userEmail || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>
              Phone Number
            </Text>
            {editing ? (
              <TextInput
                mode="outlined"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange("phoneNumber", value)}
                keyboardType="phone-pad"
                style={styles.input}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: colors.onSurface }]}>
                {user?.phoneNumber || 'Not set'}
              </Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>
              Account Type
            </Text>
            <Text style={[styles.fieldValue, { color: colors.onSurface }]}>
              {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
            </Text>
          </View>
        </View>

        {editing && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <MaterialIcons name="save" size={24} color={colors.onPrimary} />
            <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
              Save Changes
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Account Actions */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          Account Actions
        </Text>
        
        <TouchableOpacity
          style={[styles.actionItem, { borderBottomColor: colors.outline }]}
          onPress={() => router.push("/(tabs)/transactions")}
        >
          <MaterialIcons name="history" size={24} color={colors.onSurface} />
          <Text style={[styles.actionText, { color: colors.onSurface }]}>
            Transaction History
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, { borderBottomColor: colors.outline }]}
          onPress={() => router.push("/(tabs)/deposits")}
        >
          <MaterialIcons name="savings" size={24} color={colors.onSurface} />
          <Text style={[styles.actionText, { color: colors.onSurface }]}>
            My Deposits
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, { borderBottomColor: colors.outline }]}
          onPress={() => Alert.alert("Support", "Contact support at support@mopocket.com")}
        >
          <MaterialIcons name="help" size={24} color={colors.onSurface} />
          <Text style={[styles.actionText, { color: colors.onSurface }]}>
            Help & Support
          </Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color={colors.onError} />
          <Text style={[styles.logoutButtonText, { color: colors.onError }]}>
            Logout
          </Text>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formFields: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;