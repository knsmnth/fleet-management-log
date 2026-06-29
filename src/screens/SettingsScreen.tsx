import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Theme } from '../theme/theme';
import { StorageConfig, StorageMode } from '../types';
import { getStorageConfig, saveStorageConfig, syncLocalToCloud } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsScreenProps {
  onConfigChange: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onConfigChange }) => {
  const [mode, setMode] = useState<StorageMode>('local');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  const [localCount, setLocalCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    loadSettings();
    checkLocalLogsCount();
  }, []);

  const loadSettings = async () => {
    try {
      const config = await getStorageConfig();
      setMode(config.mode);
      setSupabaseUrl(config.supabaseUrl);
      setSupabaseKey(config.supabaseKey);
    } catch (e) {
      console.error(e);
    }
  };

  const checkLocalLogsCount = async () => {
    try {
      const raw = await AsyncStorage.getItem('fleet_manager_logs');
      if (raw) {
        const logs = JSON.parse(raw);
        setLocalCount(logs.length);
      } else {
        setLocalCount(0);
      }
    } catch (e) {
      setLocalCount(0);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    if (mode === 'cloud') {
      if (!supabaseUrl.trim() || !supabaseKey.trim()) {
        setStatusMessage({
          text: 'Project URL and Anon Key are required for Cloud mode.',
          isError: true,
        });
        setIsSaving(false);
        return;
      }
      if (!supabaseUrl.startsWith('http')) {
        setStatusMessage({
          text: 'Invalid Supabase URL.',
          isError: true,
        });
        setIsSaving(false);
        return;
      }
    }

    try {
      const config: StorageConfig = {
        mode,
        supabaseUrl: supabaseUrl.trim(),
        supabaseKey: supabaseKey.trim(),
      };
      await saveStorageConfig(config);
      setStatusMessage({ text: 'Configuration saved successfully!', isError: false });
      onConfigChange();
      checkLocalLogsCount();
    } catch (e) {
      setStatusMessage({ text: 'Failed to save configuration.', isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const result = await syncLocalToCloud();
      if (result.errors.length > 0) {
        setSyncMessage({
          text: `Synced ${result.syncedCount} records, but failed on ${result.errors.length} records. Check console for details.`,
          isError: true,
        });
      } else {
        setSyncMessage({
          text: `Successfully synced ${result.syncedCount} records to Supabase!`,
          isError: false,
        });
      }
      await checkLocalLogsCount();
      onConfigChange(); // Refresh parent view data
    } catch (e: any) {
      setSyncMessage({
        text: e.message || 'Sync failed. Ensure your connection credentials are correct.',
        isError: true,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Connection Settings</Text>

        {/* Toggle Mode */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Storage Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === 'local' && styles.toggleBtnActive,
              ]}
              onPress={() => setMode('local')}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  mode === 'local' && styles.toggleBtnTextActive,
                ]}
              >
                Local Storage
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === 'cloud' && styles.toggleBtnActive,
              ]}
              onPress={() => setMode('cloud')}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  mode === 'cloud' && styles.toggleBtnTextActive,
                ]}
              >
                Cloud Sync (Supabase)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Supabase Config Fields */}
        {mode === 'cloud' && (
          <View style={styles.cloudSection}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Supabase Project URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://your-project.supabase.co"
                placeholderTextColor={Theme.colors.textMuted}
                value={supabaseUrl}
                onChangeText={setSupabaseUrl}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showCredentials}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Supabase Anon Key</Text>
              <TextInput
                style={[styles.input, showCredentials ? styles.keyInput : null]}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..."
                placeholderTextColor={Theme.colors.textMuted}
                value={supabaseKey}
                onChangeText={setSupabaseKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showCredentials}
                multiline={showCredentials}
                numberOfLines={showCredentials ? 2 : 1}
              />
            </View>

            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={() => setShowCredentials(!showCredentials)}
              activeOpacity={0.7}
            >
              <Text style={styles.visibilityToggleText}>
                {showCredentials ? '👁️ Mask Connection Credentials' : '👁️ Reveal Connection Credentials'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {statusMessage && (
          <Text
            style={[
              styles.statusText,
              statusMessage.isError ? styles.textError : styles.textSuccess,
            ]}
          >
            {statusMessage.text}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sync Local Logs Card */}
      {mode === 'cloud' && (
        <View style={[styles.card, styles.syncCard]}>
          <Text style={styles.cardHeader}>Offline Sync Portal</Text>
          <Text style={styles.description}>
            You have <Text style={styles.boldText}>{localCount}</Text> maintenance records stored locally on this device.
          </Text>

          {localCount > 0 && (
            <View>
              {syncMessage && (
                <Text
                  style={[
                    styles.statusText,
                    syncMessage.isError ? styles.textError : styles.textSuccess,
                  ]}
                >
                  {syncMessage.text}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.syncButton, isSyncing && styles.buttonDisabled]}
                onPress={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#0051D5" />
                ) : (
                  <Text style={styles.syncButtonText}>Sync {localCount} Logs to Cloud</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* SQL Setup Helper Card */}
      <View style={[styles.card, styles.helperCard]}>
        <Text style={styles.cardHeaderSmall}>Required Supabase Schema</Text>
        <Text style={styles.codeDescription}>
          Create the following table inside your Supabase SQL Editor:
        </Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>
            {`create table fleet_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  plate_number text not null,
  log_date date not null,
  mileage integer not null,
  maintenance_notes text not null
);`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.xl,
    gap: Theme.spacing.xl,
  },
  card: {
    backgroundColor: Theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.xl,
    ...Theme.shadows.small,
  },
  syncCard: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primaryBlue,
  },
  helperCard: {
    backgroundColor: '#1E1E24',
    borderColor: '#2D2D37',
  },
  cardHeader: {
    ...Theme.typography.h1,
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.textPrimary,
  },
  cardHeaderSmall: {
    ...Theme.typography.h2,
    color: '#F8F9FA',
    marginBottom: Theme.spacing.md,
  },
  description: {
    ...Theme.typography.bodyLarge,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
  },
  codeDescription: {
    ...Theme.typography.bodySmall,
    color: '#C6C6CD',
    marginBottom: Theme.spacing.sm,
  },
  boldText: {
    fontWeight: '700',
    color: Theme.colors.primaryBlue,
  },
  formGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    ...Theme.typography.label,
    color: Theme.colors.textSecondary,
    marginBottom: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: Theme.colors.bgMain,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: Theme.colors.primaryBlue,
  },
  toggleBtnText: {
    ...Theme.typography.bodyLarge,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  cloudSection: {
    marginTop: Theme.spacing.sm,
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.bgMain,
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
    borderRadius: Theme.borderRadius.sm,
    fontSize: 14,
    color: Theme.colors.textPrimary,
    outlineStyle: 'none' as any,
  },
  keyInput: {
    fontFamily: 'monospace',
    fontSize: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  statusText: {
    ...Theme.typography.bodyLarge,
    fontWeight: '600',
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  textSuccess: {
    color: Theme.colors.success,
  },
  textError: {
    color: Theme.colors.error,
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: Theme.colors.primaryBlue,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  syncButton: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.primaryBlue,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.accentLight,
    marginTop: Theme.spacing.md,
  },
  syncButtonText: {
    color: Theme.colors.primaryBlue,
    fontSize: 14,
    fontWeight: '700',
  },
  codeContainer: {
    backgroundColor: '#0F0F12',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#23232C',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#A9B2C3',
    lineHeight: 18,
  },
  visibilityToggle: {
    paddingVertical: 8,
    marginBottom: Theme.spacing.lg,
    alignSelf: 'flex-start',
  },
  visibilityToggleText: {
    color: Theme.colors.primaryBlue,
    fontSize: 12,
    fontWeight: '600',
  },
});
