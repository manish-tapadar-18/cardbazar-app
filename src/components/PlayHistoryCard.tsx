import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import CustomText from './CustomText';
import { Images } from '../utils/Images';
import { Colors } from '../utils/Colors';
import { ENV } from '../utils/env';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { IPlayHistoryItem } from '../response/module/IPlayHistoryResponse';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatus = (item: IPlayHistoryItem): 'WIN' | 'LOSS' | 'PENDING' => {
    if (item.RESULT_PUBLISH !== 1) return 'PENDING';
    return item.WIN === 0 ? 'LOSS' : 'WIN';
};

const STATUS_CONFIG = {
    WIN:     { label: 'WIN',     bg: '#02C557' },
    LOSS:    { label: 'LOSS',    bg: '#DB141E' },
    PENDING: { label: 'PENDING', bg: '#FFBB00' },
};

// ─── Component ────────────────────────────────────────────────────────────────
const PlayHistoryCard: React.FC<{ item: IPlayHistoryItem }> = ({ item }) => {
    const status = getStatus(item);
    const cfg = STATUS_CONFIG[status];
    const imageUri = `${ENV.BASE_URL}/${item.CARD_IMAGE_URL}`;

    return (
        <LinearGradient
            colors={['#451563', '#42125C', '#4C186B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
        >
            {/* Card image */}
            <Image
                source={{ uri: imageUri }}
                defaultSource={Images.SMALL_CARD}
                style={styles.cardImage}
            />

            {/* Middle — schedule name, category, date & time */}
            <View style={styles.cardMiddle}>
                <CustomText style={styles.scheduleName} numberOfLines={1}>
                    {item.GAME_MASTER_SCHEDULE_NAME}
                </CustomText>
                <CustomText style={styles.categoryName} numberOfLines={1}>
                    {item.GAME_CATEGORY_NAME}
                </CustomText>
                <View style={styles.timeRow}>
                    <CustomText style={styles.timeText}>
                        {moment(item.DATE).utc().format('DD MMM YYYY')}
                    </CustomText>
                    <CustomText style={styles.timeText}>·</CustomText>
                    <CustomText style={styles.timeText}>
                        {item.START_TIME} – {item.END_TIME}
                    </CustomText>
                </View>
            </View>

            {/* Right — amount + status badge */}
            <View style={styles.cardRight}>
                <CustomText style={styles.amountText}>₹{item.AMOUNT}</CustomText>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <CustomText style={styles.statusText}>{cfg.label}</CustomText>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: rw(3),
        paddingHorizontal: rw(3),
        paddingVertical: rh(1.4),
        gap: rw(3),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardImage: {
        width: rw(13),
        height: rw(13),
        resizeMode: 'contain',
        transform: [{ rotate: '-10deg' }],
    },
    cardMiddle: {
        flex: 1,
        gap: rh(0.4),
    },
    scheduleName: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(4),
        color: Colors.GOLD,
        letterSpacing: 0.3,
    },
    categoryName: {
        fontFamily: FontFamilyWithWeight[500],
        fontSize: rf(4),
        color: Colors.WHITE_55,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2),
        marginTop: rh(0.3),
    },
    timeText: {
        fontFamily: FontFamilyWithWeight[400],
        fontSize: rf(4),
        color: Colors.WHITE_55,
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: rh(0.6),
    },
    amountText: {
        fontFamily: FontFamilyWithWeight[700],
        fontSize: rf(4),
        color: Colors.WHITE,
    },
    statusBadge: {
        paddingHorizontal: rw(3),
        paddingVertical: rh(0.4),
        borderRadius: rw(4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontFamily: FontFamilyWithWeight[800],
        fontSize: rf(3),
        color: Colors.WHITE,
        letterSpacing: 0.5,
    },
});

export default PlayHistoryCard;
