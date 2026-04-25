import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import { Colors } from '../utils/Colors';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';

interface DatePickerModalProps {
  visible: boolean;
  onConfirm: (date: string) => void; // returns YYYY-MM-DD
  onClose: () => void;
}

const TODAY = new Date().toISOString().split('T')[0];

const calendarTheme = {
  calendarBackground: Colors.DARK_VIOLET,
  backgroundColor: Colors.DARK_VIOLET,

  monthTextColor: Colors.GOLD,
  textMonthFontFamily: FontFamilyWithWeight[700],
  textMonthFontSize: 15,

  textSectionTitleColor: Colors.WHITE_55,
  textDayHeaderFontFamily: FontFamilyWithWeight[600],
  textDayHeaderFontSize: 12,

  dayTextColor: Colors.WHITE,
  textDayFontFamily: FontFamilyWithWeight[500],
  textDayFontSize: 13,

  todayTextColor: Colors.GOLD,
  todayBackgroundColor: 'rgba(255,215,0,0.12)',

  selectedDayBackgroundColor: Colors.GOLD,
  selectedDayTextColor: Colors.BLAKISH_GRAY,

  textDisabledColor: Colors.DARK_GRAY,
  textSectionTitleDisabledColor: Colors.DARK_GRAY,

  arrowColor: Colors.GOLD,
  disabledArrowColor: Colors.DARK_GRAY,

  dotColor: Colors.GOLD,
  selectedDotColor: Colors.BLAKISH_GRAY,

  indicatorColor: Colors.GOLD,
};

const DatePickerModal: React.FC<DatePickerModalProps> = ({ visible, onConfirm, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleConfirm = () => {
    if (!selectedDate) return;
    onConfirm(selectedDate);
    setSelectedDate('');
  };

  const handleClose = () => {
    setSelectedDate('');
    onClose();
  };

  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, disableTouchEvent: true } }
    : {};

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>

          {/* Header */}
          <LinearGradient colors={Colors.GRADIENT.HEADER} style={styles.header}>
            <CustomText style={styles.headerTitle}>SELECT DATE</CustomText>
          </LinearGradient>

          {/* Calendar */}
          <Calendar
            maxDate={TODAY}
            onDayPress={onDayPress}
            markedDates={markedDates}
            enableSwipeMonths
            hideExtraDays
            theme={calendarTheme}
            style={styles.calendar}
          />

          {/* Selected date label */}
          <View style={styles.selectedRow}>
            <CustomText style={styles.selectedLabel}>
              {selectedDate ? `Selected: ${selectedDate}` : 'No date selected'}
            </CustomText>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <Pressable style={styles.cancelBtn} onPress={handleClose}>
              <CustomText style={styles.cancelText}>Cancel</CustomText>
            </Pressable>
            <Pressable
              style={[styles.confirmBtnWrap, !selectedDate && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!selectedDate}
            >
              <LinearGradient
                colors={selectedDate ? Colors.GRADIENT.GOLD : [Colors.DISABLED_BG, Colors.DISABLED_BG]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                <CustomText style={[styles.confirmText, ...(!selectedDate ? [styles.confirmTextDisabled] : [])]}>
                  Confirm
                </CustomText>
              </LinearGradient>
            </Pressable>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rw(5),
  },
  sheet: {
    width: '100%',
    borderRadius: rw(4),
    overflow: 'hidden',
    backgroundColor: Colors.DARK_VIOLET,
    borderWidth: 1,
    borderColor: Colors.BORDER_WHITE_12,
  },
  header: {
    paddingVertical: rh(1.6),
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FontFamilyWithWeight[700],
    fontSize: rf(4),
    color: Colors.GOLD,
    letterSpacing: 1.5,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_WHITE_12,
  },
  selectedRow: {
    paddingVertical: rh(1),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_WHITE_12,
  },
  selectedLabel: {
    fontFamily: FontFamilyWithWeight[500],
    fontSize: rf(4),
    color: Colors.WHITE_75,
  },
  btnRow: {
    flexDirection: 'row',
    padding: rw(4),
    gap: rw(3),
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.BORDER_WHITE_12,
    borderRadius: rw(2),
    paddingVertical: rh(1.2),
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.WHITE_75,
    fontFamily: FontFamilyWithWeight[600],
    fontSize: rf(4),
  },
  confirmBtnWrap: {
    flex: 1,
    borderRadius: rw(2),
    overflow: 'hidden',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtn: {
    paddingVertical: rh(1.2),
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.BLAKISH_GRAY,
    fontFamily: FontFamilyWithWeight[700],
    fontSize: rf(4),
  },
  confirmTextDisabled: {
    color: Colors.WHITE_55,
  },
});

export default DatePickerModal;
