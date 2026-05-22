import React from 'react';
import {
    FlatList,
    Image,
    ImageBackground,
    Modal,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import CustomText from './CustomText';
import GradientText from './GradientText';
import { Images } from '../utils/Images';
import { Colors } from '../utils/Colors';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { rf, rh, rw } from '../utils/responsive';
import { IReferralHistoryItem } from '../response/module/IReferralHistoryResponse';

// ─── Status colour map ────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { bg: string; text: string }> = {
    JOINED:      { bg: 'rgba(34,197,94,0.18)',  text: '#4ADE80' },
    BONUS_GIVEN: { bg: 'rgba(96,165,250,0.18)', text: '#60A5FA' },
    PENDING:     { bg: 'rgba(251,191,36,0.18)', text: '#FBBF24' },
};
const getStatusColor = (status: string) =>
    STATUS_MAP[status] ?? { bg: 'rgba(255,255,255,0.10)', text: '#CCCCCC' };

// ─── LV — label / value row ───────────────────────────────────────────────────
const LV: React.FC<{ label: string; value: string; icon?: string }> = ({
    label,
    value,
    icon,
}) => (
    <View style={lv.row}>
        <CustomText style={lv.label}>{label}</CustomText>
        <View style={lv.valueSide}>
            {icon ? <CustomText style={lv.icon}>{icon}</CustomText> : null}
            <CustomText style={lv.value}>{value}</CustomText>
        </View>
    </View>
);

const lv = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rh(0.55),
    },
    label: {
        width: rw(30),
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight.inter_400,
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: 0.3,
    },
    valueSide: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(1.5),
    },
    icon: {
        fontSize: rf(3.8),
        lineHeight: rf(4.6),
    },
    value: {
        fontSize: rf(4.2),
        fontFamily: FontFamilyWithWeight.inter_700,
        color: Colors.WHITE,
        letterSpacing: 0.2,
        flexShrink: 1,
    },
});

// ─── Single referral card ─────────────────────────────────────────────────────
const ReferralCard: React.FC<{ item: IReferralHistoryItem }> = ({ item }) => {
    const fullName = `${item.JOINED_FIRST_NAME} ${item.JOINED_LAST_NAME}`.trim();
    const statusColor = getStatusColor(item.STATUS);
    const joinedDate = moment(item.CREATED_AT).format('DD MMM YYYY, hh:mm A');

    return (
        <LinearGradient
            colors={['#260030', '#44004F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={card.container}
        >
            {/* ── Name row + status badge ── */}
            <View style={card.nameRow}>
                <View style={card.nameWrapper}>
                    <GradientText
                        colors={Colors.GRADIENT.GOLD}
                        locations={Colors.GRADIENT.GOLD_LOCATIONS}
                        style={card.nameText}
                        angle={180}
                        numberOfLines={1}
                    >
                        {fullName}
                    </GradientText>
                </View>
                <View style={[card.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <CustomText style={[card.statusText, { color: statusColor.text }]}>
                        {item.STATUS}
                    </CustomText>
                </View>
            </View>

            {/* ── Gold separator ── */}
            <View style={card.sep} />

            {/* ── Details ── */}
            <LV label="Mobile"     value={item.JOINED_MOBILE} icon="📱" />
            <LV label="Joined On"  value={joinedDate}         icon="📅" />
        </LinearGradient>
    );
};

const card = StyleSheet.create({
    container: {
        borderRadius: rw(3),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.20)',
        paddingHorizontal: rw(4),
        paddingTop: rh(1.6),
        paddingBottom: rh(1.8),
        marginBottom: rh(2),
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: rh(0.8),
        gap: rw(2),
    },
    nameWrapper: {
        flex: 1,
    },
    nameText: {
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight.inter_700,
        letterSpacing: 0.4,
    },
    statusBadge: {
        borderRadius: rw(2),
        paddingVertical: rh(0.4),
        paddingHorizontal: rw(2.5),
    },
    statusText: {
        fontSize: rf(3.4),
        fontFamily: FontFamilyWithWeight.inter_700,
        letterSpacing: 0.5,
    },
    sep: {
        height: 1,
        backgroundColor: 'rgba(255,215,0,0.30)',
        marginBottom: rh(0.8),
    },
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
    visible: boolean;
    data: IReferralHistoryItem[];
    isLoading: boolean;
    onClose: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
const ReferralHistoryModal: React.FC<Props> = ({ visible, data, isLoading, onClose }) => (
    <Modal
        visible={visible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
    >
        <ImageBackground
            source={Images.DASHBOARD_SPLASH}
            style={modal.background}
            resizeMode="cover"
        >
            {/* ── Header ── */}
            <LinearGradient
                colors={['#FFD700', '#D4940A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={modal.header}
            >
                <CustomText style={modal.headerTitle}>Referral History</CustomText>
                <Pressable onPress={onClose} hitSlop={12} style={modal.closeBtn}>
                    <CustomText style={modal.closeText}>✕</CustomText>
                </Pressable>
            </LinearGradient>

            {/* ── Content ── */}
            {isLoading ? (
                <View style={modal.centered}>
                    <CustomText style={modal.emptyText}>Loading…</CustomText>
                </View>
            ) : data.length === 0 ? (
                <View style={modal.centered}>
                    <Image
                        source={Images.USERS}
                        style={modal.emptyIcon}
                        resizeMode="contain"
                    />
                    <CustomText style={modal.emptyTitle}>No Referrals Yet</CustomText>
                    <CustomText style={modal.emptyText}>
                        Share your referral code to see history here.
                    </CustomText>
                </View>
            ) : (
                <>
                    {/* Total count badge */}
                    <View style={modal.countRow}>
                        <CustomText style={modal.countText}>
                            {data.length} {data.length === 1 ? 'referral' : 'referrals'} found
                        </CustomText>
                    </View>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.ID}
                        renderItem={({ item }) => <ReferralCard item={item} />}
                        contentContainerStyle={modal.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}
        </ImageBackground>
    </Modal>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const modal = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: Colors.DEEP_PURPLE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: rw(4),
        paddingTop: rh(5.5),   // clears status bar
        paddingBottom: rh(1.8),
    },
    headerTitle: {
        fontSize: rf(6),
        fontFamily: FontFamilyWithWeight[700],
        color: Colors.BROWN,
        letterSpacing: 0.5,
    },
    closeBtn: {
        width: rw(8),
        height: rw(8),
        borderRadius: rw(4),
        backgroundColor: 'rgba(0,0,0,0.20)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
        color: Colors.BROWN,
        lineHeight: rf(6),
    },
    countRow: {
        paddingHorizontal: rw(4),
        paddingTop: rh(2),
        paddingBottom: rh(0.5),
    },
    countText: {
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight.inter_400,
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: 0.3,
    },
    listContent: {
        paddingHorizontal: rw(4),
        paddingTop: rh(1),
        paddingBottom: rh(6),
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: rw(8),
    },
    emptyIcon: {
        width: rw(22),
        height: rw(22),
        tintColor: 'rgba(255,215,0,0.45)',
        marginBottom: rh(2),
    },
    emptyTitle: {
        fontSize: rf(6),
        fontFamily: FontFamilyWithWeight[700],
        color: Colors.WHITE,
        marginBottom: rh(0.8),
        textAlign: 'center',
    },
    emptyText: {
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight[400],
        color: Colors.WHITE_55,
        textAlign: 'center',
        lineHeight: rh(2.8),
    },
});

export default ReferralHistoryModal;
