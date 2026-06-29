import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Theme } from '../theme/theme';
import { MaintenanceLog } from '../types';

interface LogCardListProps {
  logs: MaintenanceLog[];
  isLoading: boolean;
  onDeleteLog: (id: string) => Promise<void>;
}

export const LogCardList: React.FC<LogCardListProps> = ({ logs, isLoading, onDeleteLog }) => {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primaryBlue} />
        <Text style={styles.loadingText}>Loading records...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: MaintenanceLog }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.plateBadge}>
            <Text style={styles.plateText}>{item.plate_number}</Text>
          </View>
          <Text style={styles.dateText}>{item.log_date}</Text>
        </View>

        <View style={styles.mileageContainer}>
          <Text style={styles.mileageLabel}>Mileage:</Text>
          <Text style={styles.mileageValue}>{item.mileage.toLocaleString()} km</Text>
        </View>

        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.maintenance_notes}</Text>
        </View>

        <TouchableOpacity
          onPress={() => item.id && onDeleteLog(item.id)}
          style={styles.deleteButton}
          activeOpacity={0.6}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Records</Text>
      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No records found</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false} // Disable scrolling inside FlatList so parent container can scroll
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Theme.spacing.lg,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
  },
  listContent: {
    paddingBottom: Theme.spacing.xl,
  },
  card: {
    backgroundColor: Theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    position: 'relative',
    ...Theme.shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F2',
    paddingBottom: Theme.spacing.sm,
  },
  plateBadge: {
    backgroundColor: Theme.colors.accentLight,
    paddingVertical: 4,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
  },
  plateText: {
    ...Theme.typography.bodyLarge,
    fontWeight: '700',
    color: Theme.colors.primaryBlue,
  },
  dateText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  mileageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  mileageLabel: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginRight: 4,
  },
  mileageValue: {
    ...Theme.typography.bodyLarge,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  notesContainer: {
    marginBottom: Theme.spacing.md,
  },
  notesLabel: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  notesText: {
    ...Theme.typography.bodyLarge,
    color: Theme.colors.textPrimary,
    lineHeight: 20,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.error,
    backgroundColor: '#FFF5F5',
  },
  deleteButtonText: {
    color: Theme.colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: Theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.bgSurface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
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
    minHeight: 200,
    marginTop: Theme.spacing.lg,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    color: Theme.colors.textSecondary,
    ...Theme.typography.bodyLarge,
  },
});
