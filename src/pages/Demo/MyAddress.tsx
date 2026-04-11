import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DemoStackParamList } from '../../types/NavigationStack';
import { useDemoStore } from '../../stores/demoStore';
import { Colors } from '../../utils/Colors';
import { rf, rh, rw } from '../../utils/responsive';
import { FontFamilyWithWeight } from '../../utils/FontFamilyWithWeight';
import CustomText from '../../components/CustomText';
import CustomTextInput from '../../components/CustomTextInput';
import { Images } from '../../utils/Images';

type Nav = NativeStackNavigationProp<DemoStackParamList, 'MyAddress'>;
type Route = RouteProp<DemoStackParamList, 'MyAddress'>;

interface AddressForm {
    fullName: string;
    mobile: string;
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
}

const INITIAL: AddressForm = {
    fullName: '',
    mobile: '',
    houseNo: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
};

export default function MyAddress() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const { address, setAddress } = useDemoStore();

    const [form, setForm] = useState<AddressForm>(() => {
        if (address.trim()) {
            const parts = address.split(', ');
            return {
                fullName: parts[0] ?? '',
                mobile: parts[1] ?? '',
                houseNo: parts[2] ?? '',
                street: parts[3] ?? '',
                city: parts[4] ?? '',
                state: parts[5] ?? '',
                pinCode: parts[6] ?? '',
            };
        }
        return INITIAL;
    });

    const [errors, setErrors] = useState<Partial<AddressForm>>({});

    const update = (key: keyof AddressForm, val: string) => {
        setForm((prev) => ({ ...prev, [key]: val }));
        if (errors[key]) {
            setErrors((prev) => ({ ...prev, [key]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<AddressForm> = {};
        if (!form.fullName.trim()) { newErrors.fullName = 'Full name is required'; }
        if (!form.mobile.trim() || form.mobile.length < 10) { newErrors.mobile = 'Valid mobile number required'; }
        if (!form.houseNo.trim()) { newErrors.houseNo = 'House / Flat No is required'; }
        if (!form.street.trim()) { newErrors.street = 'Street / Area is required'; }
        if (!form.city.trim()) { newErrors.city = 'City is required'; }
        if (!form.state.trim()) { newErrors.state = 'State is required'; }
        if (!form.pinCode.trim() || form.pinCode.length !== 6) { newErrors.pinCode = 'Valid 6-digit PIN code required'; }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        Keyboard.dismiss();
        if (!validate()) { return; }
        const formatted = [
            form.fullName,
            form.mobile,
            form.houseNo,
            form.street,
            form.city,
            form.state,
            form.pinCode,
        ].join(', ');
        setAddress(formatted);
        navigation.goBack();
    };

    const Field = ({
        label,
        field,
        placeholder,
        keyboardType = 'default',
        maxLength,
    }: {
        label: string;
        field: keyof AddressForm;
        placeholder: string;
        keyboardType?: 'default' | 'number-pad' | 'phone-pad';
        maxLength?: number;
    }) => (
        <View style={styles.fieldGroup}>
            <CustomText style={styles.fieldLabel}>{label}</CustomText>
            <View style={[styles.inputRow, errors[field] ? styles.inputError : null]}>
                <CustomTextInput
                    value={form[field]}
                    onChangeText={(v) => update(field, v)}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                    style={styles.textInput}
                    focusedPlaceholderColor={Colors.GOLD}
                    unfocusedPlaceholderColor={Colors.WHITE_55}
                />
            </View>
            {!!errors[field] && (
                <CustomText style={styles.errorText}>{errors[field]}</CustomText>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={rh(10)}
        >
            <LinearGradient colors={['#1B0535', '#2D0A6E', '#3A0D7A']} style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor="#1B0535" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Image source={Images.LEFT_ARROW} style={styles.backIcon} resizeMode="contain" />
                    </TouchableOpacity>
                    <View>
                        <CustomText style={styles.headerTitle}>Delivery Address</CustomText>
                        <CustomText style={styles.headerSubtitle}>Where should we deliver?</CustomText>
                    </View>
                </View>

                <LinearGradient
                    colors={['transparent', Colors.GOLD, Colors.ORANGE, Colors.GOLD, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.divider}
                />

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.form}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Field label="Full Name" field="fullName" placeholder="Enter your full name" />
                        <Field
                            label="Mobile Number"
                            field="mobile"
                            placeholder="10-digit mobile number"
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                        <Field label="House / Flat / Block No." field="houseNo" placeholder="e.g. Flat 4B, Sunrise Apts" />
                        <Field label="Street / Area / Locality" field="street" placeholder="e.g. MG Road, near Metro Station" />
                        <Field label="City" field="city" placeholder="e.g. Mumbai" />
                        <Field label="State" field="state" placeholder="e.g. Maharashtra" />
                        <Field
                            label="PIN Code"
                            field="pinCode"
                            placeholder="6-digit PIN code"
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                        {/* Save button */}
                        <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={styles.saveBtnWrap}>
                            <LinearGradient
                                colors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.saveBtn}
                            >
                                <Image source={Images.CIRCLE_CHECK} style={styles.saveBtnIcon} resizeMode="contain" />
                                <CustomText style={styles.saveBtnText}>Save Address</CustomText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: rw(4),
        paddingTop: rh(5),
        paddingBottom: rh(1.5),
        gap: rw(3),
    },
    backBtn: {},
    backIcon: {
        width: rw(5.5),
        height: rw(5.5),
        tintColor: Colors.WHITE,
    },
    headerTitle: {
        color: Colors.WHITE,
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
    },
    headerSubtitle: {
        color: Colors.WHITE_55,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[400],
    },

    divider: {
        height: 1,
        marginHorizontal: rw(4),
        marginBottom: rh(0.5),
    },

    form: {
        paddingHorizontal: rw(4),
        paddingTop: rh(2),
        paddingBottom: rh(4),
        gap: rh(1.8),
    },

    fieldGroup: { gap: rh(0.5) },
    fieldLabel: {
        color: Colors.WHITE_75,
        fontSize: rf(3.2),
        fontFamily: FontFamilyWithWeight[500],
        marginLeft: rw(1),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: rw(3),
        height: rh(6.5),
    },
    inputError: {
        borderColor: 'rgba(255,77,77,0.6)',
    },
    textInput: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        color: Colors.WHITE,
        paddingHorizontal: 0,
        fontSize: rf(3.8),
    },
    errorText: {
        color: '#FF4D4D',
        fontSize: rf(3),
        fontFamily: FontFamilyWithWeight[400],
        marginLeft: rw(1),
    },

    saveBtnWrap: { marginTop: rh(1) },
    saveBtn: {
        borderRadius: 14,
        paddingVertical: rh(1.8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rw(2),
    },
    saveBtnIcon: {
        width: rw(5),
        height: rw(5),
        tintColor: Colors.WHITE,
    },
    saveBtnText: {
        color: Colors.WHITE,
        fontSize: rf(4.2),
        fontFamily: FontFamilyWithWeight[700],
    },
});
