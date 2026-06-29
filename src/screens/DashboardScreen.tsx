import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Alert,
  Platform,
} from 'react-native';
import { Theme } from '../theme/theme';
import { MaintenanceLog } from '../types';
import { LogForm } from '../components/LogForm';
import { LogTable } from '../components/LogTable';
import { fetchLogs, addLog, deleteLog } from '../services/storage';

interface DashboardScreenProps {
  refreshTrigger: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ refreshTrigger }) => {
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 850;

  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLogsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload logs whenever trigger or focus changes
  useEffect(() => {
    loadLogsData();
  }, [refreshTrigger, loadLogsData]);

  const handleAddLog = async (newLog: Omit<MaintenanceLog, 'id' | 'created_at'>) => {
    try {
      await addLog(newLog);
      // Reload logs after adding
      await loadLogsData();
    } catch (error) {
      console.error('Error adding log:', error);
      throw error;
    }
  };

  const handleDeleteLog = async (id: string) => {
    const performDelete = async () => {
      try {
        await deleteLog(id);
        await loadLogsData();
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    };

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm('Are you sure you want to delete this log?');
      if (confirmDelete) {
        await performDelete();
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this maintenance record?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  if (isWideScreen) {
    return (
      <View style={[styles.container, { height: '100%' }]}>
        {/* Top Navbar */}
        <View style={styles.topNav}>
          <Text style={styles.navTitle}>System Overview</Text>
          <Text style={styles.navSubtitle}>Systems Technician Portal</Text>
        </View>

        {/* Main Grid View */}
        <View style={[styles.gridContainer, { flex: 1, alignItems: 'stretch', paddingBottom: Theme.spacing.xl }]}>
          <View style={styles.formCol}>
            <LogForm onSubmit={handleAddLog} />
          </View>
          <View style={styles.tableCol}>
            <LogTable logs={logs} isLoading={isLoading} onDeleteLog={handleDeleteLog} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Top Navbar */}
      <View style={styles.topNav}>
        <Text style={styles.navTitle}>System Overview</Text>
        <Text style={styles.navSubtitle}>Systems Technician Portal</Text>
      </View>

      <View style={styles.stackedContainer}>
        <LogForm onSubmit={handleAddLog} />
        <View style={{ marginTop: Theme.spacing.lg }}>
          <LogTable logs={logs} isLoading={isLoading} onDeleteLog={handleDeleteLog} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.bgMain,
  },
  contentContainer: {
    flexGrow: 1,
  },
  topNav: {
    height: 64,
    backgroundColor: Theme.colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderColor,
    paddingHorizontal: Theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTitle: {
    ...Theme.typography.h1,
    fontSize: 20,
    color: Theme.colors.textPrimary,
  },
  navSubtitle: {
    ...Theme.typography.bodyLarge,
    color: Theme.colors.textSecondary,
  },
  gridContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.xl,
    gap: Theme.spacing.xl,
    alignItems: 'flex-start',
  },
  formCol: {
    width: 420,
  },
  tableCol: {
    flex: 1,
  },
  stackedContainer: {
    padding: Theme.spacing.lg,
    flexDirection: 'column',
    gap: Theme.spacing.lg,
  },
});
