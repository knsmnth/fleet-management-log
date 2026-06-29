import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Theme } from './src/theme/theme';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { getStorageConfig } from './src/services/storage';
import { StorageConfig } from './src/types';

export default function App() {
  const [storageConfig, setStorageConfig] = useState<StorageConfig | null>(null);

  // Load config on startup
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await getStorageConfig();
      setStorageConfig(config);
    } catch (e) {
      console.error('Failed to load storage config:', e);
    }
  };

  if (!storageConfig) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing Fleet Manager...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.appWrapper}>
      <StatusBar style="dark" />
      <View style={styles.mainContent}>
        <DashboardScreen refreshTrigger={0} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: Theme.colors.bgMain,
    ...Platform.select({
      web: {
        height: '100vh' as any,
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.bgMain,
  },
  loadingText: {
    ...Theme.typography.bodyLarge,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  mainContent: {
    flex: 1,
    height: '100%',
  },
});
