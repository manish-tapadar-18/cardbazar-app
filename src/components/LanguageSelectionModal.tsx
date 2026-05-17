import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Colors } from '../utils/Colors';
import { rh, rw } from '../utils/responsive';
import { Images } from '../utils/Images';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import CustomText from './CustomText';
import CustomButton from './CustomButton';
import { useLanguageStore, LanguageEntry } from '../stores/languageStore';
import { useLanguageModalStore } from '../stores/languageModalStore';
import { useTranslation } from '../hooks/useTranslation';

type LanguageOption = {
  key: keyof LanguageEntry;
  label: string;
  nativeLabel: string;
  image: any;
};

const LANGUAGES: LanguageOption[] = [
  { key: 'english', label: 'English', nativeLabel: 'English', image: Images.ENGLISH },
  { key: 'bengali', label: 'Bengali', nativeLabel: 'বাংলা', image: Images.BENGALI },
  { key: 'hindi', label: 'Hindi', nativeLabel: 'हिंदी', image: Images.HINDI },
  { key: 'urdu', label: 'Urdu', nativeLabel: 'اردو', image: Images.URDU },
];

const DISPLAY_NAMES: Record<keyof LanguageEntry, string> = {
  english: 'English',
  bengali: 'Bengali',
  hindi: 'Hindi',
  urdu: 'Urdu',
};

const LanguageSelectionModal: React.FC = () => {
  const { isVisible, closeModal } = useLanguageModalStore();
  const { selectedLanguage, setSelectedLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [isVisible]);

  const handleContinue = () => {
    closeModal();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <Pressable style={styles.backdrop} onPress={closeModal}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <Pressable>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Title */}
            <CustomText style={styles.title}>{t('select_language') || 'Select Your Language'}</CustomText>

            {/* Language grid */}
            <View style={styles.grid}>
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.key;
                return (
                  <TouchableOpacity
                    key={lang.key}
                    activeOpacity={0.8}
                    onPress={() => {setSelectedLanguage(lang.key);handleContinue()}}
                    style={[styles.card, isSelected ? styles.cardSelected : undefined]}
                  >
                    <Image source={lang.image} style={styles.langImage} resizeMode="contain" />
                    <CustomText style={[styles.cardLabel]}>
                      {lang.nativeLabel}
                    </CustomText>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Image
                          source={Images.CIRCLE_CHECK}
                          style={styles.checkIcon}
                          tintColor={Colors.GREEN}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default LanguageSelectionModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: rh(3),
    borderTopRightRadius: rh(3),
    paddingHorizontal: rw(5),
    paddingBottom: rh(4),
    paddingTop: rh(1),
  },
  handleBar: {
    width: rw(12),
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.GRAY,
    alignSelf: 'center',
    marginBottom: rh(2),
  },
  title: {
    fontSize: rh(2.4),
    fontFamily: FontFamilyWithWeight[700],
    color: Colors.BLAKISH_GRAY,
    textAlign: 'center',
    marginBottom: rh(2.5),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rw(3),
    justifyContent: 'center',
    marginBottom: rh(3),
  },
  card: {
    width: '45%',
    borderWidth: 1.5,
    borderColor: Colors.GRAY,
    borderRadius: rh(1.5),
    paddingVertical: rh(1.8),
    paddingHorizontal: rw(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(2.5),
    backgroundColor: Colors.WHITE,
  },
  cardSelected: {
    borderColor: Colors.GREEN,
    backgroundColor: 'rgba(59, 212, 20, 0.06)',
  },
  langImage: {
    width: rh(4),
    height: rh(4),
  },
  cardLabel: {
    fontSize: rh(1.9),
    fontFamily: FontFamilyWithWeight[600],
    color: Colors.BLAKISH_GRAY,
    flex: 1,
  },
  cardLabelSelected: {
    color: Colors.BLAKISH_GRAY,
  },
  checkBadge: {
    position: 'absolute',
    top: rh(0.6),
    right: rw(2),
  },
  checkIcon: {
    width: rh(2),
    height: rh(2),
    resizeMode: 'contain',
  },
  continueBtn: {
    marginHorizontal: rw(1),
    height: rh(6.5),
    borderRadius: rh(1),
    backgroundColor: Colors.YELLOW,
  },
  continueBtnText: {
    fontSize: rh(2),
    fontFamily: FontFamilyWithWeight[700],
    color: Colors.BLACK,
  },
});
