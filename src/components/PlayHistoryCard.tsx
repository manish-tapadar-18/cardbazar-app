import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    cancelAnimation,
    Easing,
} from 'react-native-reanimated';
import moment from 'moment';
import CustomText from './CustomText';
import { Images } from '../utils/Images';
import { Colors } from '../utils/Colors';
import { ENV } from '../utils/env';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { IPlayHistoryItem } from '../response/module/IPlayHistoryResponse';
import GradientText from './GradientText';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const RANK_MAP: Record<string, string> = { a: 'ACE', k: 'KING', q: 'QUEEN', j: 'JACK' };

function formatCardName(name: string): string {
    if (!name) return '';
    return name.split('-').map(p => RANK_MAP[p.toLowerCase()] ?? p.toUpperCase()).join(' ');
}

/** "14:30:00" → "02:30 PM" */
function formatTimeAMPM(raw: string): string {
    if (!raw) return '';
    const m = moment(raw, ['HH:mm:ss', 'HH:mm', 'h:mm A', 'h:mm:ss A'], true);
    return m.isValid() ? m.format('hh:mm A') : raw;
}

type ResultStyle = 'pending' | 'win' | 'loss';

function getResult(resultPublish: number, win: number): { label: string; style: ResultStyle } {
    if (resultPublish === 0) return { label: 'PENDING', style: 'pending' };
    return win === 1 ? { label: 'WIN', style: 'win' } : { label: 'LOSS', style: 'loss' };
}

// ─────────────────────────────────────────────────────────────────────────────
// ShineStatus
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_GRADIENT: Record<ResultStyle, string[]> = {
    win:     ['#43E97B', '#38F9D7', '#00FF55', '#43E97B', '#38F9D7'],
    loss:    ['#FF4444', '#FF8C00', '#FF4444', '#FF0055', '#FF4444'],
    pending: ['#FFD700', '#FFA500', '#FF5E94', '#FFD700', '#FFA500'],
};

function statusFontSize(label: string): number {
    if (label.length >= 7) return rf(3.6);
    if (label.length >= 5) return rf(4.2);
    return rf(4.8);
}

const ShineStatus: React.FC<{ label: string; type: ResultStyle }> = ({ label, type }) => {
    const shimmerX = useSharedValue(-rw(13));

    React.useEffect(() => {
        shimmerX.value = -rw(13);
        shimmerX.value = withRepeat(
            withTiming(rw(26), { duration: 1800, easing: Easing.linear }),
            -1,
            false,
        );
        return () => cancelAnimation(shimmerX);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const animShine = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmerX.value }, { skewX: '-18deg' }],
    }));

    return (
        <MaskedView
            style={styles.shineWrapper}
            maskElement={
                <View style={[styles.shineWrapper, { backgroundColor: 'transparent' }]}>
                    <CustomText
                        style={[styles.resultText, { fontSize: statusFontSize(label) }]}
                        numberOfLines={1}
                    >
                        {label}
                    </CustomText>
                </View>
            }
        >
            <LinearGradient
                colors={STATUS_GRADIENT[type]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shineWrapper}
            />
            <Animated.View style={[styles.shineBar, animShine]}>
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.80)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </MaskedView>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// LV  — full-width label → value row
// ─────────────────────────────────────────────────────────────────────────────

const LV: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <View style={lv.row}>
        <CustomText style={lv.label}>{label}</CustomText>
        <View style={lv.valueSide}>
            {typeof value === 'string' || typeof value === 'number'
                ? <CustomText style={lv.valueText}>{value}</CustomText>
                : value}
        </View>
    </View>
);

const lv = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rh(0.6),
    },
    label: {
        width: rw(32),
        fontSize: rf(3.8),
        fontFamily: FontFamilyWithWeight.inter_400,
        color: 'rgba(255,255,255,0.72)',
        letterSpacing: 0.3,
    },
    valueSide: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    valueText: {
        fontSize: rf(4.2),
        fontFamily: FontFamilyWithWeight.inter_700,
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// PC  — paired cell  (label stacked above value, flex:1 in a pair row)
// ─────────────────────────────────────────────────────────────────────────────

const PC: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <View style={pc.cell}>
        <CustomText style={pc.label}>{label}</CustomText>
        <View style={pc.valueRow}>
            {typeof value === 'string' || typeof value === 'number'
                ? <CustomText style={pc.value}>{value}</CustomText>
                : value}
        </View>
    </View>
);

const pc = StyleSheet.create({
    cell: { flex: 1 },
    label: {
        fontSize: rf(3.3),
        fontFamily: FontFamilyWithWeight.inter_400,
        color: 'rgba(255,255,255,0.72)',
        letterSpacing: 0.3,
        marginBottom: rh(0.25),
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(1.2),
    },
    value: {
        fontSize: rf(3.9),
        fontFamily: FontFamilyWithWeight.inter_700,
        color: '#FFFFFF',
        letterSpacing: 0.2,
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
    date: string;
    items: IPlayHistoryItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const PlayHistoryCard: React.FC<Props> = ({ date, items }) => (
    <View style={styles.wrapper}>

        {/* ── Date badge ────────────────────────────────────────────────── */}
        <LinearGradient
            colors={['#FFD700', '#D4940A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dateBadge}
        >
            <CustomText style={styles.dateBadgeText}>{date}</CustomText>
        </LinearGradient>

        {/* ── Card body ─────────────────────────────────────────────────── */}
        <LinearGradient
            colors={['#260030', '#44004F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
        >
            {items.map((item, index) => {
                const result   = getResult(item.RESULT_PUBLISH, item.WIN);
                const cardName = formatCardName(item.CARD_NAME);

                return (
                    <React.Fragment key={item.ID}>
                        <View style={styles.item}>

                            {/* ── Top: card image / name  +  shining status ── */}
                            <View style={styles.topRow}>
                                <View style={styles.cardBlock}>
                                    <Image
                                        source={{ uri: `${ENV.BASE_URL}/${item.CARD_IMAGE_URL}` }}
                                        defaultSource={Images.SMALL_CARD}
                                        style={styles.cardImage}
                                        resizeMode="contain"
                                    />
                                    <GradientText
                                        colors={Colors.GRADIENT.GOLD}
                                        locations={Colors.GRADIENT.GOLD_LOCATIONS}
                                        style={styles.cardName}
                                        angle={180}
                                        numberOfLines={2}
                                    >
                                        {cardName}
                                    </GradientText>
                                </View>
                                <ShineStatus label={result.label} type={result.style} />
                            </View>

                            {/* ── Gold separator ── */}
                            <View style={styles.separator} />

                            {/* ══ Info grid ══════════════════════════════════ */}

                            {/* AMOUNT — full width */}
                            <LV
                                label="AMOUNT"
                                value={
                                    <View style={styles.inlineRow}>
                                        <CustomText style={styles.inrText}>₹</CustomText>
                                        <CustomText style={lv.valueText}>{item.AMOUNT}</CustomText>
                                    </View>
                                }
                            />

                            {/* CATEGORY — full width */}
                            <LV label="CATEGORY" value={item.GAME_CATEGORY_NAME} />

                            {/* SCHEDULE — full width */}
                            <LV label="GAME NAME" value={item.GAME_MASTER_SCHEDULE_NAME} />

                            {/* START TIME  |  END TIME */}
                            <View style={styles.pairRow}>
                                <PC
                                    label="START TIME"
                                    value={
                                        <View style={styles.inlineRow}>
                                            <CustomText style={styles.emojiIcon}>🕐</CustomText>
                                            <CustomText style={pc.value}>
                                                {formatTimeAMPM(item.START_TIME)}
                                            </CustomText>
                                        </View>
                                    }
                                />
                                <View style={styles.pairSep} />
                                <PC
                                    label="END TIME"
                                    value={
                                        <View style={styles.inlineRow}>
                                            <CustomText style={styles.emojiIcon}>🕐</CustomText>
                                            <CustomText style={pc.value}>
                                                {formatTimeAMPM(item.END_TIME)}
                                            </CustomText>
                                        </View>
                                    }
                                />
                            </View>

                        </View>

                        {index < items.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                );
            })}
        </LinearGradient>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

    wrapper: { marginBottom: rh(3) },

    // ── Date badge ─────────────────────────────────────────────────────────
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: rw(2.5),
        paddingVertical: rh(0.65),
        borderRadius: rw(2),
        position: 'absolute',
        zIndex: 99999,
        top: -rh(2),
    },
    dateBadgeText: {
        fontSize: rf(5),
        fontFamily: FontFamilyWithWeight[700],
        color: '#330000',
    },

    // ── Card ───────────────────────────────────────────────────────────────
    card: {
        borderRadius: rw(2.5),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.20)',
        overflow: 'hidden',
        paddingTop: rh(2.5),
    },

    // ── Per-item container ─────────────────────────────────────────────────
    item: {
        paddingHorizontal: rw(4),
        paddingTop: rh(1),
        paddingBottom: rh(1.5),
    },

    // ── Top row ────────────────────────────────────────────────────────────
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: rh(1),
    },
    cardBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2.5),
        flex: 1,
        marginRight: rw(2),
    },
    cardImage: { width: rw(14), height: rw(14) },
    cardName: {
        fontSize: rf(4),
        fontFamily: FontFamilyWithWeight["inter_700"],
        letterSpacing: 0.5,
        flexShrink: 1,
    },

    // ── Shine status ───────────────────────────────────────────────────────
    shineWrapper: {
        height: rf(6),
        width: rw(24),
        justifyContent: 'center',
        alignItems: 'center',
    },
    shineBar: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: rw(12),
    },
    resultText: {
        fontFamily: FontFamilyWithWeight[700],
        letterSpacing: 1.2,
        color: Colors.WHITE,
        backgroundColor: 'transparent',
    },

    // ── Gold separator ─────────────────────────────────────────────────────
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,215,0,0.35)',
        marginBottom: rh(0.8),
    },

    // ── Paired rows ────────────────────────────────────────────────────────
    pairRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: rh(0.6),
    },
    pairSep: {
        width: 1,
        backgroundColor: 'rgba(255,215,0,0.25)',
        alignSelf: 'stretch',
        marginHorizontal: rw(3),
    },

    // ── Inline icon + text ─────────────────────────────────────────────────
    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(1.2),
    },
    inrText: {
        fontSize: rf(4.4),
        fontFamily: FontFamilyWithWeight.inter_700,
        color: '#FFD700',
        lineHeight: rf(5),
    },
    emojiIcon: {
        fontSize: rf(3.6),
        lineHeight: rf(4.4),
    },

    // ── Item divider ───────────────────────────────────────────────────────
    divider: {
        height: 1,
        marginHorizontal: rw(4),
        backgroundColor: 'rgba(255,255,255,0.22)',
        marginVertical: rh(0.5),
    },
});

export default PlayHistoryCard;
