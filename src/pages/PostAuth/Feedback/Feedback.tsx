import React, { useState } from 'react';
import {
    View,
    TextInput,
    ImageBackground,
    StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import { AirbnbRating } from '@rn-vui/ratings';
import { useFormik } from 'formik';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../utils/Colors';
import { rf, rw } from '../../../utils/responsive';
import { Images } from '../../../utils/Images';
import { FontFamilyWithWeight } from '../../../utils/FontFamilyWithWeight';
import CustomText from '../../../components/CustomText';
import CustomButton from '../../../components/CustomButton';
import GradientIconBar from '../../../components/GradientIconBar';
import { styles } from './styles';
import { IFeedbackFormValues } from '../../../validations/interfaces';
import { FeedbackValidationSchema } from '../../../validations/schemas/FeedbackValidationSchema';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';

const CARD_GRADIENT = ['#260030', '#44004F'];
const RULE_GRADIENT = ['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent'];

const RATING_LABELS: Record<number, string> = {
    1: 'Terrible',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
};

const countWords = (text: string): number =>
    text.trim().split(/\s+/).filter(w => w.length > 0).length;

const GradientRule = () => (
    <LinearGradient
        colors={RULE_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientRule}
    />
);

const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeaderRow}>
        <LinearGradient
            colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.sectionAccent}
        />
        <CustomText style={styles.sectionTitle}>{title}</CustomText>
    </View>
);

const Feedback = () => {
    const [isLoading, setLoading] = useState(false);
    const [textFocused, setTextFocused] = useState(false);

    const {
        values,
        errors,
        touched,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldTouched,
        resetForm,
    } = useFormik<IFeedbackFormValues>({
        initialValues: {
            rating: 0,
            feedback: '',
        },
        validationSchema: FeedbackValidationSchema,
        validateOnMount: false,
        onSubmit: (formValues) => {
            submitFeedback(formValues);
        },
    });

    useFocusEffect(
        React.useCallback(() => {
            return () => {
                resetForm();
            };
        }, [resetForm])
    );

    const submitFeedback = async (formValues: IFeedbackFormValues) => {
        try {
            setLoading(true);
            const { isSuccess, message } = await Repository.Feedback.addFeedback({
                TITLE: formValues.feedback,
                DESCRIPTION: '',
                STARS: formValues.rating.toString(),
            });
            if (isSuccess) {
                Toast.success(message || 'Thank you for your feedback!', {
                    placement: 'center',
                    duration: 3000,
                });
                resetForm();
            } else {
                Toast.error(message || 'Something went wrong. Please try again.', {
                    placement: 'center',
                    duration: 3000,
                });
            }
        } catch (error: any) {
            Toast.error(error?.message ?? 'Something went wrong', {
                placement: 'center',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const wordCount = values.feedback ? countWords(values.feedback) : 0;
    const wordCountStyle =
        wordCount > 50
            ? styles.wordCountError
            : wordCount >= 40
            ? styles.wordCountWarning
            : styles.wordCountText;

    return (
        <ImageBackground
            source={Images.DASHBOARD_SPLASH}
            style={{ flex: 1, backgroundColor: Colors.DEEP_PURPLE }}
            resizeMode="cover"
        >
            <GradientIconBar />

            <KeyboardAwareScrollView
                enableOnAndroid
                extraScrollHeight={80}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Star Rating Card ── */}
                <LinearGradient
                    colors={CARD_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardBorder}
                >
                    <View style={styles.cardInner}>
                        <SectionHeader title="Rate Your Experience" />
                        <GradientRule />

                        <View style={styles.ratingContainer}>
                            <CustomText style={styles.ratingLabel}>
                                Tap a star to rate us
                            </CustomText>

                            <AirbnbRating
                                count={5}
                                defaultRating={values.rating}
                                size={rw(12)}
                                showRating={false}
                                selectedColor={Colors.GOLD}
                                unSelectedColor={'rgba(255,215,0,0.22)'}
                                starStyle={{ marginHorizontal: 8 }}
                                onFinishRating={(rating: number) => {
                                    setFieldValue('rating', rating);
                                    setFieldTouched('rating', true, false);
                                }}
                            />

                            <View style={styles.ratingValueRow}>
                                {values.rating > 0 ? (
                                    <LinearGradient
                                        colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.ratingValueBadge}
                                    >
                                        <CustomText style={localStyles.ratingBadgeText}>
                                            {values.rating} / 5 — {RATING_LABELS[values.rating]}
                                        </CustomText>
                                    </LinearGradient>
                                ) : (
                                    <CustomText style={styles.ratingHintText}>
                                        No rating selected
                                    </CustomText>
                                )}
                            </View>

                            {touched.rating && errors.rating && (
                                <CustomText style={styles.errorText}>{errors.rating}</CustomText>
                            )}
                        </View>
                    </View>
                </LinearGradient>

                {/* ── Feedback Text Card ── */}
                <LinearGradient
                    colors={CARD_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardBorder}
                >
                    <View style={styles.cardInner}>
                        <SectionHeader title="Your Feedback" />
                        <GradientRule />

                        <CustomText style={styles.fieldLabel}>Write your thoughts</CustomText>

                        <View
                            style={[
                                styles.textAreaWrapper,
                                textFocused && styles.textAreaWrapperFocused,
                            ]}
                        >
                            <TextInput
                                value={values.feedback}
                                onChangeText={(text) => setFieldValue('feedback', text)}
                                onFocus={() => setTextFocused(true)}
                                onBlur={(e) => {
                                    setTextFocused(false);
                                    handleBlur('feedback')(e);
                                }}
                                placeholder="Tell us what you think…"
                                placeholderTextColor={Colors.WHITE_55}
                                multiline
                                style={styles.textAreaInput}
                                scrollEnabled={false}
                            />
                        </View>

                        <View style={styles.wordCountRow}>
                            <CustomText style={[styles.wordCountText, wordCountStyle]}>
                                {wordCount} / 50 words
                            </CustomText>
                        </View>

                        {touched.feedback && errors.feedback && (
                            <CustomText style={styles.textAreaErrorText}>
                                {errors.feedback}
                            </CustomText>
                        )}
                    </View>
                </LinearGradient>

                {/* ── Submit Button ── */}
                <CustomButton
                    title={isLoading ? 'Submitting…' : 'Submit Feedback'}
                    containerStyle={styles.buttonContainer}
                    textStyle={styles.buttonText}
                    disabled={isLoading}
                    loading={isLoading}
                    onPress={handleSubmit}
                    gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                />
            </KeyboardAwareScrollView>
        </ImageBackground>
    );
};

export default Feedback;

const localStyles = StyleSheet.create({
    ratingBadgeText: {
        fontSize: rf(3.5),
        fontFamily: FontFamilyWithWeight[600],
        color: Colors.DARK_BROWN,
        letterSpacing: 0.3,
    },
});
