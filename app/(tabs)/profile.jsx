import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { typography } from "../../constants";
import { useAuth } from "../../context/appstate/AuthContext";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    physicalAddress: '',
    profilePic: null,
  });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        physicalAddress: currentUser.physicalAddress || '',
        profilePic: currentUser.profilePic || null,
      });
    }
  }, [currentUser]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileData(prev => ({
        ...prev,
        profilePic: result.assets[0].uri
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would typically save to your backend/Firebase
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (currentUser) {
      setProfileData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        physicalAddress: currentUser.physicalAddress || '',
        profilePic: currentUser.profilePic || null,
      });
    }
    setEditing(false);
  };

  const renderProfilePicture = () => (
    <TouchableOpacity 
      style={styles.profilePictureContainer} 
      onPress={editing ? pickImage : undefined}
      disabled={!editing}
    >
      {profileData.profilePic ? (
        <Image source={{ uri: profileData.profilePic }} style={styles.profilePicture} />
      ) : (
        <View style={[styles.profilePicturePlaceholder, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="person" size={60} color={colors.onSurfaceVariant} />
        </View>
      )}
      {editing && (
        <View style={[styles.editIconContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="camera" size={16} color={colors.onPrimary} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderField = (label, value, field, multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
      {editing ? (
        <TextInput
          mode="outlined"
          value={value}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, [field]: text }))}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          style={styles.textInput}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: colors.onSurface }]}>
          {value || 'Not provided'}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Profile
        </Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={editing ? handleCancel : () => setEditing(true)}
        >
          <Ionicons 
            name={editing ? "close" : "create-outline"} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileSection}>
        {renderProfilePicture()}
        <Text style={[styles.profileName, typography.robotoBold, { color: colors.onBackground }]}>
          {profileData.displayName || 'User Name'}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>
          {profileData.email || 'user@example.com'}
        </Text>
      </View>

      {/* Profile Information */}
      <View style={styles.infoSection}>
        <Text style={[styles.sectionTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Personal Information
        </Text>
        
        {renderField('Full Name', profileData.displayName, 'displayName')}
        {renderField('Email', profileData.email, 'email')}
        {renderField('Phone Number', profileData.phoneNumber, 'phoneNumber')}
        {renderField('Address', profileData.physicalAddress, 'physicalAddress', true)}
      </View>

      {/* Account Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, typography.robotoBold, { color: colors.onBackground }]}>
          Account Statistics
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.statNumber, { color: colors.onPrimaryContainer }]}>
              12
            </Text>
            <Text style={[styles.statLabel, { color: colors.onPrimaryContainer }]}>
              Transactions
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.secondaryContainer }]}>
            <Text style={[styles.statNumber, { color: colors.onSecondaryContainer }]}>
              E1,250
            </Text>
            <Text style={[styles.statLabel, { color: colors.onSecondaryContainer }]}>
              Balance
            </Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      {editing && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
  },
  editButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    paddingVertical: 8,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;