import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from './CustomText';
import { Images } from '../utils/Images';
import { Colors } from '../utils/Colors';
import { ENV } from '../utils/env';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { IPlayHistoryItem } from '../response/module/IPlayHistoryResponse';
import GradientText from './GradientText';

interface Props {
    date: string;
    items: IPlayHistoryItem[];
}

const PlayHistoryCard: React.FC<Props> = ({ date, items }) => (
    <View style={styles.wrapper}>
        {/* ── Date badge ──────────────────────────────────────────────── */}
        <LinearGradient
            colors={['#FFD700', '#D4940A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dateBadge}
        >
            <CustomText style={styles.dateBadgeText}>{date}</CustomText>
        </LinearGradient>

        {/* ── Card body ───────────────────────────────────────────────── */}
        <LinearGradient
            colors={['#2A0D6E', '#3B1280', '#2A0D6E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.card}
        >
            {items.map((item, index) => (
                <React.Fragment key={item.ID}>
                    <View style={styles.row}>
                        {/* Left — schedule name */}

                        <GradientText
                            colors={Colors.GRADIENT.GOLD}
                            locations={Colors.GRADIENT.GOLD_LOCATIONS}
                            style={{
                                fontSize: rf(6.5),
                                fontFamily: FontFamilyWithWeight[700],
                                letterSpacing: 0.5,
                            }}
                            angle={180}
                        >
                            {item.GAME_MASTER_SCHEDULE_NAME}
                        </GradientText>

                        {/* Right — card image + card name */}
                        <View style={styles.rowRight}>
                            <Image
                                source={{ uri: `${ENV.BASE_URL}/${item.CARD_IMAGE_URL}` }}
                                defaultSource={Images.SMALL_CARD}
                                style={styles.cardImage}
                                resizeMode="contain"
                            />
                            <CustomText style={styles.cardName} numberOfLines={1}>
                                {item.CARD_NAME}
                            </CustomText>
                        </View>
                    </View>

                    {index < items.length - 1 && (
                        <View style={styles.divider} />
                    )}
                </React.Fragment>
            ))}
        </LinearGradient>
    </View>
);

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: rh(3)
    },

    // ── Date badge ────────────────────────────────────────────────────────────
    dateBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: rw(2),
        paddingVertical: rh(0.7),
        borderRadius: rw(2),
        marginBottom: rh(0.6),
        position:"absolute",
        zIndex:99999,
        top:-rh(2)
    },
    dateBadgeText: {
        fontWeight:"bold",
        fontSize: rf(5),
        color: "#330000"
    },

    // ── Card ──────────────────────────────────────────────────────────────────
    card: {
        borderRadius: rw(2.5),
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.15)',
        overflow: 'hidden',
        paddingTop:rh(2)
    },

    // ── Row ───────────────────────────────────────────────────────────────────
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between',
        paddingHorizontal: rw(12),
        paddingVertical: rh(1.4),
        gap:rw(7)
    },
    gameLabel: {
        flex: 1,
        fontFamily: FontFamilyWithWeight[600],
        fontSize: rf(3.8),
        color: Colors.WHITE,
        letterSpacing: 0.3,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rw(2),
        flexShrink: 0,
    },
    cardImage: {
        width: rw(6),
        height: rw(6),
    },
    cardName: {
        fontSize: rf(5),
        color: Colors.WHITE,
        letterSpacing: 0.3,
        textTransform:"uppercase"
    },

    // ── Divider ───────────────────────────────────────────────────────────────
    divider: {
        height: 1,
        marginHorizontal: rw(4),
        backgroundColor: '#FFFFFF',
    },
});

export default PlayHistoryCard;
