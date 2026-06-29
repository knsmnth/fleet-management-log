import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../theme/theme';
import { StorageMode } from '../types';

interface SidebarProps {
  currentScreen: 'logs' | 'settings';
  setCurrentScreen: (screen: 'logs' | 'settings') => void;
  storageMode: StorageMode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  setCurrentScreen,
  storageMode,
}) => {
  return (
    <View style={styles.sidebar}>
      <View style={styles.header}>
        <Text style={styles.title}>Fleet Manager</Text>
        <Text style={styles.subtitle}>Central Hub • Alpha Sector</Text>
      </View>

      <View style={styles.navSection}>
        <Text style={styles.sectionTitle}>Main Menu</Text>
        
        <TouchableOpacity
          style={[
            styles.navItem,
            currentScreen === 'logs' && styles.navItemActive,
          ]}
          onPress={() => setCurrentScreen('logs')}
        >
          <Text
            style={[
              styles.navItemText,
              currentScreen === 'logs' && styles.navItemTextActive,
            ]}
          >
            Maintenance Logs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navItem,
            currentScreen === 'settings' && styles.navItemActive,
          ]}
          onPress={() => setCurrentScreen('settings')}
        >
          <Text
            style={[
              styles.navItemText,
              currentScreen === 'settings' && styles.navItemTextActive,
            ]}
          >
            Connection Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  storageMode === 'cloud' ? Theme.colors.success : Theme.colors.warning,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {storageMode === 'cloud' ? 'Cloud Connected' : 'Local Storage Mode'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: Theme.colors.bgMain,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.borderColor,
    padding: Theme.spacing.xl,
    justifyContent: 'flex-start',
    height: '100%',
  },
  header: {
    marginBottom: Theme.spacing.xxl,
  },
  title: {
    ...Theme.typography.h2,
    fontSize: 18,
    color: Theme.colors.textPrimary,
  },
  subtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  navSection: {
    flex: 1,
  },
  sectionTitle: {
    ...Theme.typography.label,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.md,
    textTransform: 'uppercase',
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: Theme.colors.primaryBlue,
  },
  navItemText: {
    ...Theme.typography.bodyLarge,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  navItemTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderColor,
    paddingTop: Theme.spacing.lg,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.sm,
  },
  statusText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
});
