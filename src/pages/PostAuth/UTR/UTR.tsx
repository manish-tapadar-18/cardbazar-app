import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Keyboard,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import Video, { VideoRef } from 'react-native-video';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Images } from '../../../utils/Images';
import { Colors } from '../../../utils/Colors';
import { rf, rh, rw } from '../../../utils/responsive';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';
import CustomText from '../../../components/CustomText';
import CustomTextInput from '../../../components/CustomTextInput';
import CustomButton from '../../../components/CustomButton';
import { Repository } from '../../../repository/Repository';
import { useUserStore } from '../../../stores/userStore';

// ─── Validation ───────────────────────────────────────────────────────────────
const UTRSchema = Yup.object().shape({
  utr: Yup.string().trim().required('UTR number is required'),
});

// ─── Skeleton pulse ───────────────────────────────────────────────────────────
const SkeletonBox = ({ width, height, style }: { width: number | string; height: number; style?: object }) => {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: rh(1),
          backgroundColor: 'rgba(255,215,0,0.15)',
          opacity: anim,
        },
        style,
      ]}
    />
  );
};

// ─── UTR Screen ───────────────────────────────────────────────────────────────
const UTR = () => {
  const navigation = useNavigation<any>();
  const { userDetails } = useUserStore();
  const videoRef = useRef<VideoRef>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [paused, setPaused] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  // ── Fetch video on focus ──────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setIsVideoLoading(true);
      setVideoUrl(null);
      setPaused(true);

      Repository.Payment.getAllVideo().then(({ isSuccess, data }) => {
        if (!active) return;
        if (isSuccess && data?.VALUE) {
          setVideoUrl(data.VALUE);
        }
        setIsVideoLoading(false);
      }).catch(() => {
        if (active) setIsVideoLoading(false);
      });

      return () => { active = false; };
    }, [])
  );

  // ── Formik ────────────────────────────────────────────────────────────────
  const { values, errors, touched, handleBlur, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: { utr: '' },
      validationSchema: UTRSchema,
      validateOnMount: false,
      onSubmit: async (formValues) => {
        Keyboard.dismiss();
        if (!userDetails?.ID) return;
        try {
          setIsSubmitting(true);
          const { isSuccess, message } = await Repository.Payment.checkPaymentStatus(
            formValues.utr.trim(),
            Number(userDetails.ID),
          );
          setModalSuccess(isSuccess);
          setModalMessage(message ?? (isSuccess ? 'Payment verified successfully!' : 'Payment verification failed.'));
          setModalVisible(true);
        } catch (e: any) {
          setModalSuccess(false);
          setModalMessage(e?.message ?? 'Something went wrong.');
          setModalVisible(true);
        } finally {
          setIsSubmitting(false);
        }
      },
    });

  const handleModalOk = () => {
    setModalVisible(false);
    navigation.navigate('HomeTab' as never);
  };

  const CARD_GRADIENT = ['rgba(255,215,0,0.45)', 'rgba(255,255,255,0.05)', 'rgba(255,215,0,0.45)'];
  const RULE_GRADIENT = ['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent'];

  return (
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={{ flex: 1, backgroundColor: Colors.DEEP_PURPLE }}
      resizeMode="cover"
    >
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={70}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Page Title ────────────────────────────────────────────── */}
        <View style={styles.pageTitleRow}>
          <LinearGradient
            colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.titleAccent}
          />
          <View>
            <CustomText style={styles.pageTitle}>UTR Verification</CustomText>
            <CustomText style={styles.pageSubtitle}>Submit your UTR to confirm payment</CustomText>
          </View>
        </View>

        {/* ── Video Card ────────────────────────────────────────────── */}
        <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
          <View style={styles.cardInner}>
            <CustomText style={styles.cardSectionLabel}>HOW TO FIND YOUR UTR</CustomText>
            <LinearGradient colors={RULE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientRule} />

            {isVideoLoading ? (
              <View style={styles.skeletonWrapper}>
                <SkeletonBox width="100%" height={rh(25)} style={{ borderRadius: rh(1.2) }} />
                <View style={styles.skeletonControls}>
                  <SkeletonBox width={rw(12)} height={rw(12)} style={{ borderRadius: rw(6) }} />
                  <View style={{ flex: 1, gap: rh(0.8) }}>
                    <SkeletonBox width="70%" height={rh(1.2)} />
                    <SkeletonBox width="40%" height={rh(1.2)} />
                  </View>
                </View>
              </View>
            ) : videoUrl ? (
              <View style={styles.videoWrapper}>
                <Video
                  ref={videoRef}
                  source={{ uri: videoUrl }}
                  style={styles.video}
                  resizeMode="contain"
                  paused={paused}
                  repeat={false}
                />
                {/* Play / Pause overlay */}
                <TouchableOpacity
                  style={styles.videoOverlay}
                  activeOpacity={0.85}
                  onPress={() => setPaused(prev => !prev)}
                >
                  {paused && (
                    <LinearGradient
                      colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.55)']}
                      style={styles.playBtn}
                    >
                      <CustomText style={styles.playIcon}>▶</CustomText>
                    </LinearGradient>
                  )}
                </TouchableOpacity>

                {/* Controls bar */}
                <View style={styles.controlsBar}>
                  <TouchableOpacity onPress={() => setPaused(prev => !prev)} style={styles.controlBtn} activeOpacity={0.8}>
                    <LinearGradient
                      colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.controlBtnGradient}
                    >
                      <CustomText style={styles.controlBtnText}>{paused ? '▶  Play' : '⏸  Pause'}</CustomText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.videoUnavailable}>
                <CustomText style={styles.videoUnavailableText}>Video unavailable</CustomText>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* ── UTR Input Card ────────────────────────────────────────── */}
        <LinearGradient colors={CARD_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder}>
          <View style={styles.cardInner}>
            <CustomText style={styles.cardSectionLabel}>ENTER UTR NUMBER</CustomText>
            <LinearGradient colors={RULE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientRule} />

            <CustomText style={styles.fieldLabel}>UTR / Reference Number</CustomText>
            <View style={[
              styles.inputRow,
              touched.utr && errors.utr ? styles.inputRowError : undefined,
            ]}>
              <CustomTextInput
                value={values.utr}
                onChangeText={(text) => setFieldValue('utr', text)}
                onBlur={handleBlur('utr')}
                placeholder="Enter your UTR number"
                style={styles.textInput}
                focusedPlaceholderColor={Colors.GOLD}
                unfocusedPlaceholderColor={Colors.WHITE_55}
                autoCapitalize="characters"
              />
            </View>
            {touched.utr && errors.utr && (
              <CustomText style={styles.errorText}>{errors.utr}</CustomText>
            )}

            <LinearGradient colors={RULE_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.gradientRule, { marginTop: rh(2) }]} />

            <CustomButton
              title={isSubmitting ? 'Verifying...' : 'SUBMIT UTR'}
              containerStyle={styles.submitBtn}
              textStyle={styles.submitBtnText}
              disabled={isSubmitting}
              onPress={handleSubmit}
              gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
            />
          </View>
        </LinearGradient>
      </KeyboardAwareScrollView>

      {/* ── Result Modal ──────────────────────────────────────────────────── */}
      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={handleModalOk}>
        <View style={styles.modalBackdrop}>
          <LinearGradient
            colors={['rgba(255,215,0,0.5)', 'rgba(255,255,255,0.05)', 'rgba(255,215,0,0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalCardBorder}
          >
            <View style={styles.modalCardInner}>
              {/* Status icon */}
              <LinearGradient
                colors={modalSuccess
                  ? ['#3BD414', '#1a8a00']
                  : [Colors.GRADIENT.RED, '#c00000']}
                style={styles.modalIconCircle}
              >
                <CustomText style={styles.modalIcon}>{modalSuccess ? '✓' : '✕'}</CustomText>
              </LinearGradient>

              <CustomText style={styles.modalTitle}>
                {modalSuccess ? 'Verified!' : 'Not Verified'}
              </CustomText>

              <LinearGradient
                colors={RULE_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalRule}
              />

              <CustomText style={styles.modalMessage}>{modalMessage}</CustomText>

              <TouchableOpacity onPress={handleModalOk} activeOpacity={0.85} style={styles.modalOkWrapper}>
                <LinearGradient
                  colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalOkBtn}
                >
                  <CustomText style={styles.modalOkText}>OK</CustomText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default UTR;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: rw(5),
    paddingVertical: rh(2.5),
  },

  // ─── Page Title ───────────────────────────────────────────────────────────
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(3),
    marginBottom: rh(2.5),
  },
  titleAccent: {
    width: rw(1.2),
    height: rh(5),
    borderRadius: 4,
  },
  pageTitle: {
    fontSize: rf(5.5),
    fontFamily: FontFamilyWithWeight[700],
    color: Colors.WHITE,
    lineHeight: rf(7),
  },
  pageSubtitle: {
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[400],
    color: Colors.WHITE_55,
  },

  // ─── Card ─────────────────────────────────────────────────────────────────
  cardBorder: {
    borderRadius: rh(2),
    padding: 1.5,
    marginBottom: rh(2),
  },
  cardInner: {
    backgroundColor: 'rgba(18, 4, 45, 0.96)',
    borderRadius: rh(2) - 1.5,
    paddingHorizontal: rw(4.5),
    paddingTop: rh(2.2),
    paddingBottom: rh(2.5),
  },
  cardSectionLabel: {
    fontSize: rf(3.2),
    fontFamily: FontFamilyWithWeight[700],
    color: Colors.GOLD,
    letterSpacing: 1.5,
    marginBottom: rh(1),
  },
  gradientRule: {
    height: 1,
    borderRadius: 1,
    marginBottom: rh(2),
  },

  // ─── Skeleton ─────────────────────────────────────────────────────────────
  skeletonWrapper: {
    gap: rh(1.5),
  },
  skeletonControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(3),
  },

  // ─── Video ────────────────────────────────────────────────────────────────
  videoWrapper: {
    borderRadius: rh(1.2),
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: rh(25),
  },
  videoOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: rw(16),
    height: rw(16),
    borderRadius: rw(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: rf(6),
    color: Colors.WHITE,
    marginLeft: rw(1),
  },
  controlsBar: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: rw(3),
    paddingVertical: rh(1),
    alignItems: 'flex-start',
  },
  controlBtn: {
    borderRadius: rh(0.8),
    overflow: 'hidden',
  },
  controlBtnGradient: {
    paddingHorizontal: rw(5),
    paddingVertical: rh(0.8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnText: {
    color: Colors.DARK_BROWN,
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[700],
  },
  videoUnavailable: {
    height: rh(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoUnavailableText: {
    color: Colors.WHITE_55,
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight[400],
  },

  // ─── Input ────────────────────────────────────────────────────────────────
  fieldLabel: {
    fontSize: rf(3.5),
    fontFamily: FontFamilyWithWeight[500],
    color: Colors.WHITE_75,
    marginBottom: rh(0.8),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: rh(1),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.18)',
    paddingHorizontal: rw(3),
    height: rh(6.5),
  },
  inputRowError: {
    borderColor: Colors.ERROR_RED,
  },
  textInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: Colors.WHITE,
    paddingHorizontal: 0,
    flex: 1,
    fontSize: rf(3.8),
    fontFamily: FontFamilyWithWeight[400],
  },
  errorText: {
    color: Colors.ERROR_RED,
    fontSize: rf(3),
    fontFamily: FontFamilyWithWeight[400],
    marginTop: rh(0.5),
  },

  // ─── Submit Button ────────────────────────────────────────────────────────
  submitBtn: {
    height: rh(7),
    borderRadius: rh(1),
    overflow: 'hidden',
  },
  submitBtnText: {
    color: Colors.DARK_BROWN,
    fontSize: rf(4.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 1.5,
  },

  // ─── Modal ────────────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(8),
  },
  modalCardBorder: {
    width: '100%',
    borderRadius: rh(2.5),
    padding: 1.5,
  },
  modalCardInner: {
    backgroundColor: 'rgba(18, 4, 45, 0.98)',
    borderRadius: rh(2.5) - 1.5,
    paddingHorizontal: rw(6),
    paddingTop: rh(3.5),
    paddingBottom: rh(3),
    alignItems: 'center',
  },
  modalIconCircle: {
    width: rw(18),
    height: rw(18),
    borderRadius: rw(9),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rh(2),
  },
  modalIcon: {
    fontSize: rf(7),
    color: Colors.WHITE,
    fontFamily: FontFamilyWithWeight[700],
  },
  modalTitle: {
    fontSize: rf(5.5),
    fontFamily: FontFamilyWithWeight[700],
    color: Colors.WHITE,
    marginBottom: rh(1.5),
    letterSpacing: 0.5,
  },
  modalRule: {
    height: 1,
    borderRadius: 1,
    width: '100%',
    marginBottom: rh(2),
  },
  modalMessage: {
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[400],
    color: Colors.WHITE_75,
    textAlign: 'center',
    lineHeight: rf(6),
    marginBottom: rh(3),
  },
  modalOkWrapper: {
    width: '60%',
    borderRadius: rh(1.2),
    overflow: 'hidden',
  },
  modalOkBtn: {
    paddingVertical: rh(1.8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOkText: {
    color: Colors.DARK_BROWN,
    fontSize: rf(4.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 2,
  },
});
