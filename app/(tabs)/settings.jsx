import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Text, List, Divider, Switch, Button, useTheme, Dialog, Portal } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuth } from '../../context/appstate/AuthContext';

const SettingsScreen = () => {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [signOutDialogVisible, setSignOutDialogVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleAbout = () => {
    Alert.alert(
      'About Mo Pocket',
      'Mo Pocket is a secure mobile savings platform that helps you save money with locked deposits and earn through our vault system.\n\nVersion: 5.1.3',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'For support, please contact us:\n\nEmail: support@mopocket.com\nPhone: +268 7612 3456',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. We protect your personal information and financial data with industry-standard security measures.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colors.primary} style={"light"} />
      <ScrollView>
        <Text style={[styles.appName, { color: colors.onBackground }]}>
          Settings
        </Text>

        <List.Section>
          <List.Item
            title="Dark Mode"
            left={(props) => <List.Icon {...props} icon="brightness-6" />}
            right={() => (
              <Switch 
                value={isDarkMode} 
                onValueChange={setIsDarkMode}
                disabled={true}
              />
            )}
          />
          <Divider />

          <List.Item
            title="About Mo Pocket"
            left={(props) => <List.Icon {...props} icon="information" />}
            onPress={handleAbout}
          />
          <Divider />

          <List.Item
            title="Support & Help"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            onPress={handleSupport}
          />
          <Divider />

          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            onPress={handlePrivacy}
          />
          <Divider />

          <List.Item 
            title="Sign Out"
            left={(props) => <List.Icon {...props} icon="logout" color={colors.error} />} 
            onPress={() => setSignOutDialogVisible(true)}
          />
        </List.Section>
      </ScrollView>

      <Portal>
        <Dialog visible={signOutDialogVisible} onDismiss={() => setSignOutDialogVisible(false)}>
          <Dialog.Title>Confirm Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to sign out of Mo Pocket?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSignOutDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => {
              setSignOutDialogVisible(false);
              handleSignOut();
            }}>Sign Out</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 80,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default SettingsScreen;