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
  textMonthFontSize: rh(3),

  textSectionTitleColor: Colors.WHITE_55,
  textDayHeaderFontFamily:"bold",
  textDayHeaderFontSize: rh(1.3),

  dayTextColor: Colors.WHITE,
  textDayFontFamily: FontFamilyWithWeight[500],
  textDayFontSize: rh(2),

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
  const [currentMonth, setCurrentMonth] = useState(TODAY);

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

  const prevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}-01`);
  };

  const nextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const [todayYear, todayMonth] = TODAY.split('-').map(Number);
    if (year < todayYear || (year === todayYear && month < todayMonth)) {
      const newMonth = month === 12 ? 1 : month + 1;
      const newYear = month === 12 ? year + 1 : year;
      setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}-01`);
    }
  };

  const isNextDisabled = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const [todayYear, todayMonth] = TODAY.split('-').map(Number);
    return year > todayYear || (year === todayYear && month >= todayMonth);
  };

  const renderMonthHeader = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
    const nextDisabled = isNextDisabled();

    return (
      <View style={styles.monthHeader}>
        <Pressable onPress={prevMonth} style={styles.arrowBtn}>
          <CustomText style={styles.arrowText}>{'‹'}</CustomText>
        </Pressable>
        <CustomText style={styles.monthText}>{`${monthName} ${year}`}</CustomText>
        <Pressable onPress={nextMonth} disabled={nextDisabled} style={styles.arrowBtn}>
          <CustomText style={nextDisabled ? [styles.arrowText, styles.arrowDisabled] : styles.arrowText}>{'›'}</CustomText>
        </Pressable>
      </View>
    );
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
            key={currentMonth.substring(0, 7)}
            current={currentMonth}
            maxDate={TODAY}
            onDayPress={onDayPress}
            onMonthChange={(month) => setCurrentMonth(month.dateString)}
            markedDates={markedDates}
            enableSwipeMonths
            hideExtraDays
            hideArrows
            renderHeader={renderMonthHeader}
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
                colors={selectedDate ? Colors.GRADIENT.BUTTON_GOLD : [Colors.DISABLED_BG, Colors.DISABLED_BG]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                useAngle
                angle={270}
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
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rh(0.5),
    width: '100%',
  },
  arrowBtn: {
    paddingHorizontal: rw(4),
    paddingVertical: rh(0.3),
  },
  arrowText: {
    color: Colors.GOLD,
    fontSize: rf(7),
    fontFamily: FontFamilyWithWeight[700],
    lineHeight: rh(3.8),
  },
  arrowDisabled: {
    color: Colors.DARK_GRAY,
  },
  monthText: {
    color: Colors.GOLD,
    fontSize: rh(2.5),
    fontFamily: FontFamilyWithWeight[700],
    flex: 1,
    textAlign: 'center',
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
    marginBottom:rh(1)
  },
  cancelBtn: {
    flex: 1,
    borderRadius: rw(2),
    paddingVertical: rh(1.2),
    alignItems: 'center',
    backgroundColor: Colors.BLOOD_RED,
  },
  cancelText: {
    color: Colors.WHITE,
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
