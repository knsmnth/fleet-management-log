import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Theme } from '../theme/theme';

interface CalendarPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateString: string) => void;
  selectedValue: string; // YYYY-MM-DD
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  visible,
  onClose,
  onSelectDate,
  selectedValue,
}) => {
  const initialDate = selectedValue ? new Date(selectedValue) : new Date();
  const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

  const [currentDate, setCurrentDate] = useState(validInitialDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get calendar details
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Generate date cells
  const cells: { id: string; dayNumber: number | null; fullDateStr: string | null }[] = [];
  
  // Empty slots for days before the first day of month
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ id: `empty-${i}`, dayNumber: null, fullDateStr: null });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ id: `day-${day}`, dayNumber: day, fullDateStr: dStr });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  const renderCell = ({ item }: { item: typeof cells[0] }) => {
    if (item.dayNumber === null || !item.fullDateStr) {
      return <View style={styles.emptyCell} />;
    }

    const isSelected = item.fullDateStr === selectedValue;
    const isToday = item.fullDateStr === new Date().toISOString().split('T')[0];

    return (
      <TouchableOpacity
        style={[
          styles.dayCell,
          isSelected && styles.selectedDayCell,
          isToday && !isSelected && styles.todayCell,
        ]}
        onPress={() => handleSelectDay(item.fullDateStr!)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isToday && !isSelected && styles.todayText,
          ]}
        >
          {item.dayNumber}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.calendarCard} onStartShouldSetResponder={() => true}>
          {/* Header Month Navigation */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <Text style={styles.navBtnText}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday Titles */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <FlatList
            data={cells}
            renderItem={renderCell}
            keyExtractor={(item) => item.id}
            numColumns={7}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContent}
          />

          {/* Footer close */}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
  },
  calendarCard: {
    backgroundColor: Theme.colors.bgSurface,
    borderRadius: Theme.borderRadius.lg,
    width: 320,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.borderColor,
    ...Theme.shadows.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
    fontWeight: '700',
  },
  navBtn: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.bgMain,
    borderRadius: Theme.borderRadius.sm,
  },
  navBtnText: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderColor,
    paddingBottom: Theme.spacing.xs,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  gridContent: {
    paddingVertical: Theme.spacing.xs,
  },
  dayCell: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
    borderRadius: 19,
  },
  emptyCell: {
    width: 38,
    height: 38,
    margin: 1,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors.textPrimary,
  },
  selectedDayCell: {
    backgroundColor: Theme.colors.primaryBlue,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: Theme.colors.primaryBlue,
  },
  todayText: {
    color: Theme.colors.primaryBlue,
    fontWeight: '700',
  },
  closeBtn: {
    marginTop: Theme.spacing.lg,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.bgMain,
    borderRadius: Theme.borderRadius.sm,
  },
  closeBtnText: {
    ...Theme.typography.bodyLarge,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
});
