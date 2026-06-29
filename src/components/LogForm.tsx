import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Theme } from '../theme/theme';
import { MaintenanceLog } from '../types';

interface LogFormProps {
  onSubmit: (log: Omit<MaintenanceLog, 'id' | 'created_at'>) => Promise<void>;
}

export const LogForm: React.FC<LogFormProps> = ({ onSubmit }) => {
  const getTodayDateString = () => {
    const d = new Date();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const [plateNumber, setPlateNumber] = useState('');
  const [logDate, setLogDate] = useState(getTodayDateString());
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!plateNumber.trim()) {
      newErrors.plateNumber = 'Plate number is required';
    } else if (plateNumber.length < 3) {
      newErrors.plateNumber = 'Plate number must be at least 3 characters';
    }

    if (!logDate.trim()) {
      newErrors.logDate = 'Maintenance date is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(logDate)) {
        newErrors.logDate = 'Date must be in YYYY-MM-DD format';
      } else {
        const parsedDate = new Date(logDate);
        if (isNaN(parsedDate.getTime())) {
          newErrors.logDate = 'Invalid date';
        }
      }
    }

    if (!mileage.trim()) {
      newErrors.mileage = 'Mileage is required';
    } else {
      const parsedMileage = Number(mileage);
      if (isNaN(parsedMileage) || parsedMileage < 0) {
        newErrors.mileage = 'Mileage must be a non-negative number';
      }
    }

    if (!notes.trim()) {
      newErrors.notes = 'Maintenance details are required';
    } else if (notes.length < 5) {
      newErrors.notes = 'Details must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await onSubmit({
        plate_number: plateNumber.trim().toUpperCase(),
        log_date: logDate.trim(),
        mileage: parseInt(mileage, 10),
        maintenance_notes: notes.trim(),
      });

      // Reset form
      setPlateNumber('');
      setLogDate(getTodayDateString());
      setMileage('');
      setNotes('');
      setErrors({});
      setSubmitSuccess(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Submit log error:', error);
      setErrors({ submit: 'Failed to submit log. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>Log Maintenance</Text>

      {/* Plate Number */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Plate Number</Text>
        <TextInput
          style={[styles.input, errors.plateNumber ? styles.inputError : null]}
          placeholder="e.g. ABC-1234"
          placeholderTextColor={Theme.colors.textMuted}
          value={plateNumber}
          onChangeText={setPlateNumber}
          autoCapitalize="characters"
        />
        {errors.plateNumber ? (
          <Text style={styles.errorText}>{errors.plateNumber}</Text>
        ) : null}
      </View>

      {/* Date */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Maintenance Date</Text>
        <TextInput
          style={[styles.input, errors.logDate ? styles.inputError : null]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Theme.colors.textMuted}
          value={logDate}
          onChangeText={setLogDate}
          {...(Platform.OS === 'web' ? { type: 'date' } as any : {})}
        />
        {errors.logDate ? (
          <Text style={styles.errorText}>{errors.logDate}</Text>
        ) : null}
      </View>

      {/* Mileage */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Mileage (km)</Text>
        <TextInput
          style={[styles.input, errors.mileage ? styles.inputError : null]}
          placeholder="e.g. 45000"
          placeholderTextColor={Theme.colors.textMuted}
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
        />
        {errors.mileage ? (
          <Text style={styles.errorText}>{errors.mileage}</Text>
        ) : null}
      </View>

      {/* Notes */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Maintenance Performed</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            errors.notes ? styles.inputError : null,
          ]}
          placeholder="Oil change, tire rotation, brake inspection, etc."
          placeholderTextColor={Theme.colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.notes ? (
          <Text style={styles.errorText}>{errors.notes}</Text>
        ) : null}
      </View>

      {errors.submit ? (
        <Text style={[styles.errorText, styles.submitError]}>{errors.submit}</Text>
      ) : null}

      {submitSuccess ? (
        <Text style={styles.successText}>Log submitted successfully!</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Submitting...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Submit Log</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.xl,
    ...Theme.shadows.small,
  },
  cardHeader: {
    ...Theme.typography.h1,
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.textPrimary,
  },
  formGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    ...Theme.typography.label,
    color: Theme.colors.textSecondary,
    marginBottom: 6,
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
    outlineStyle: 'none' as any, // Works on Web
  },
  inputError: {
    borderColor: Theme.colors.error,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    ...Theme.typography.bodySmall,
    color: Theme.colors.error,
    marginTop: 4,
    fontWeight: '500',
  },
  submitError: {
    marginBottom: Theme.spacing.md,
    fontSize: 14,
  },
  successText: {
    ...Theme.typography.bodyLarge,
    color: Theme.colors.success,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
    fontWeight: '600',
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
    backgroundColor: Theme.colors.primaryBlueHover,
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
