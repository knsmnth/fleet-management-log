import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaintenanceLog } from '../types';

interface LogTableProps {
  logs: MaintenanceLog[];
  isLoading: boolean;
  onDeleteLog: (id: string) => Promise<void>;
}

export const LogTable: React.FC<LogTableProps> = ({ logs, isLoading, onDeleteLog }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primaryBlue} />
        <Text style={styles.loadingText}>Loading records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Records</Text>
      </View>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.colDate]}>Date</Text>
            <Text style={[styles.th, styles.colPlate]}>Plate</Text>
            <Text style={[styles.th, styles.colMileage]}>Mileage</Text>
            <Text style={[styles.th, styles.colNotes]}>Notes</Text>
            <Text style={[styles.th, styles.colActions]}>Actions</Text>
          </View>

          {/* Table Body */}
          <ScrollView style={styles.tableBodyContainer}>
            {logs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No records found</Text>
              </View>
            ) : (
              logs.map((log, index) => (
                <View
                  key={log.id || index}
                  style={[
                    styles.tableRow,
                    index === logs.length - 1 && styles.lastTableRow,
                  ]}
                >
                  <Text style={[styles.td, styles.colDate, styles.textSecondary]}>
                    {log.log_date}
                  </Text>
                  <Text style={[styles.td, styles.colPlate, styles.textPlate]}>
                    {log.plate_number}
                  </Text>
                  <Text style={[styles.td, styles.colMileage]}>
                    {log.mileage.toLocaleString()} km
                  </Text>
                  <Text
                    style={[styles.td, styles.colNotes, styles.textSecondary]}
                  >
                    {log.maintenance_notes}
                  </Text>
                  <View style={[styles.td, styles.colActions, styles.actionsCell]}>
                    <TouchableOpacity
                      onPress={() => log.id && onDeleteLog(log.id)}
                      style={styles.deleteButton}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.small,
    overflow: 'hidden',
    flex: 1,
  },
  header: {
    padding: Theme.spacing.xl,
    backgroundColor: '#F2F4F6',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderColor,
  },
  headerTitle: {
    ...Theme.typography.h1,
    margin: 0,
    color: Theme.colors.textPrimary,
  },
  tableContainer: {
    minWidth: 800, // Ensure columns have enough horizontal space on smaller screens
    flexDirection: 'column',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderColor,
    backgroundColor: Theme.colors.bgSurface,
  },
  tableBodyContainer: {
    flex: 1,
    minHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderColor,
  },
  lastTableRow: {
    borderBottomWidth: 0,
  },
  th: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    textAlign: 'left',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: Theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  td: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    fontSize: 14,
    color: Theme.colors.textPrimary,
    justifyContent: 'center',
  },
  colDate: {
    width: 140,
  },
  colPlate: {
    width: 130,
  },
  colMileage: {
    width: 140,
  },
  colNotes: {
    flex: 1,
  },
  colActions: {
    width: 90,
    textAlign: 'center' as const,
  },
  actionsCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSecondary: {
    color: Theme.colors.textSecondary,
  },
  textPlate: {
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Theme.colors.accentLight,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: Theme.colors.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...Theme.typography.bodyLarge,
    color: Theme.colors.textMuted,
  },
  loadingContainer: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
    borderRadius: Theme.borderRadius.md,
    minHeight: 250,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.textSecondary,
    ...Theme.typography.bodyLarge,
  },
});
