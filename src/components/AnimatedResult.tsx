import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Image,
    ImageBackground,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { rh, rw } from '../utils/responsive';

const { width: W, height: H } = Dimensions.get('window');

const CX = W / 2;
const CY = H * 0.44;
const CARD_W = 100;
const CARD_H = 140;
const CARD_COUNT = 16;
const COIN_COUNT = 24;

// Carousel geometry — spread wide to fill the screen
const RING_RX = Math.min(W * 0.42, 195); // horizontal radius
const V_LIFT = 30; // how much front sits lower than back (fakes a tilted ring)
const MIN_SCALE = 0.4; // back of the ring
const MAX_SCALE = 1.15; // front of the ring

// The reveal travels through several "stops": a few bluff cards tease forward and
// pull back, then the real winner. Each stop is reached by a "leg" of rotation.
const TWO_PI = Math.PI * 2;
const MIN_TURN = TWO_PI; // at least one full revolution between stops
const LEG_MS = 2200; // time to rotate to each bluff stop
const LAST_LEG_MS = 2600; // final, settling leg onto the winner
const BLUFF_MIN = 1;
const BLUFF_MAX = 2;

// Smoothness of the sine/cosine motion sampled into an interpolation table.
const SAMPLES = 400;
const SAMPLE_INPUT = Array.from({ length: SAMPLES }, (_, k) => k / (SAMPLES - 1));

const SUITS = ['spade', 'heart', 'diamond', 'club'];
const RANKS = ['k', 'q', 'j', 'a'];
const RANK_LABEL: Record<string, string> = { k: 'King', q: 'Queen', j: 'Jack', a: 'Ace' };
const RANK_SHORT: Record<string, string> = { k: 'K', q: 'Q', j: 'J', a: 'A' };
const SUIT_LABEL: Record<string, string> = { spade: '♠', heart: '♥', diamond: '♦', club: '♣' };
const SUIT_NAME: Record<string, string> = {
    spade: 'Spades',
    heart: 'Hearts',
    diamond: 'Diamonds',
    club: 'Clubs',
};

// The API names clubs in the plural ("clubs-k.png") but the other three suits in
// the singular ("spade-k.png"). Map the suit to its URL slug so clubs aren't 404s.
const SUIT_SLUG: Record<string, string> = {
    spade: 'spade',
    heart: 'heart',
    diamond: 'diamond',
    club: 'clubs',
};

const ALL_CARDS = SUITS.flatMap(suit =>
    RANKS.map(rank => ({
        id: `${suit}-${rank}`,
        uri: `https://dev-api.cardbaazar.com/${SUIT_SLUG[suit]}-${rank}.png`,
        suit,
        rank,
    })),
);

const DECK_URIS: string[] = ALL_CARDS.map(c => c.uri);

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}
function rnd(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

// ─── Coins ────────────────────────────────────────────────────────────────────

type Coin = {
    id: number;
    emoji: string;
    tx: Animated.Value;
    ty: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
    rot: Animated.Value;
};

function makeCoins(): Coin[] {
    return Array.from({ length: COIN_COUNT }, (_, id) => ({
        id,
        emoji: id % 3 === 0 ? '💰' : '🪙',
        tx: new Animated.Value(0),
        ty: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
        rot: new Animated.Value(0),
    }));
}

function CoinView({ coin }: { coin: Coin }) {
    const spin = coin.rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });
    return (
        <Animated.View
            style={[
                styles.coinAbs,
                {
                    opacity: coin.opacity,
                    transform: [
                        { translateX: coin.tx },
                        { translateY: coin.ty },
                        { scale: coin.scale },
                        { rotate: spin },
                    ],
                },
            ]}>
            <Text style={styles.coinEmoji}>{coin.emoji}</Text>
        </Animated.View>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'running' | 'winner';

type CardState = {
    card: (typeof ALL_CARDS)[number];
    txRange: number[];
    tyRange: number[];
    scaleRange: number[];
    opacityRange: number[];
    rotYRange: string[];
    teaser: Animated.Value; // bluff: pops this card out then back in
    shake: Animated.Value; // bluff retreat: "no no no" head-shake
    isWinner: boolean;
};

/**
 * Build a card whose position is a sampled trace of a point travelling around a
 * tilted ring. `s` runs 0→1; the card sweeps through `totalSpin` radians starting
 * from `baseAngle`. Front of the ring (cos = 1) faces the viewer, large; the back
 * (cos = -1) recedes, small.
 */
function makeCard(
    card: (typeof ALL_CARDS)[number],
    baseAngle: number,
    totalSpin: number,
    isWinner: boolean,
): CardState {
    const txRange: number[] = [];
    const tyRange: number[] = [];
    const scaleRange: number[] = [];
    const opacityRange: number[] = [];
    const rotYRange: string[] = [];

    for (let k = 0; k < SAMPLES; k++) {
        const angle = baseAngle + SAMPLE_INPUT[k] * totalSpin;
        const depth = Math.cos(angle); // 1 = front, -1 = back
        const t = (depth + 1) / 2; // 0 = back, 1 = front
        txRange.push(Math.sin(angle) * RING_RX);
        tyRange.push(depth * V_LIFT); // front lower, back higher
        scaleRange.push(lerp(MIN_SCALE, MAX_SCALE, t));
        opacityRange.push(lerp(0.28, 1, t)); // recede = dim, so cards "go in"
        rotYRange.push(`${-(angle * 180) / Math.PI}deg`);
    }

    return {
        card,
        txRange,
        tyRange,
        scaleRange,
        opacityRange,
        rotYRange,
        teaser: new Animated.Value(0),
        shake: new Animated.Value(0),
        isWinner,
    };
}

// Drawn card face — shown when the remote image is missing (e.g. the club
// images 404 on the server) so a card never renders as a blank white rectangle.
function CardFace({ card }: { card: (typeof ALL_CARDS)[number] }) {
    const red = card.suit === 'heart' || card.suit === 'diamond';
    const tag = `${RANK_SHORT[card.rank]}${SUIT_LABEL[card.suit]}`;
    return (
        <View style={styles.face}>
            <Text style={[styles.faceCornerTL, red && styles.faceRed]}>{tag}</Text>
            <Text style={[styles.facePip, red && styles.faceRed]}>{SUIT_LABEL[card.suit]}</Text>
            <Text style={[styles.faceCornerBR, red && styles.faceRed]}>{tag}</Text>
        </View>
    );
}

function CardView({
    c,
    spin,
    pull,
    appear,
    float,
    isTop,
    winnerImage,
}: {
    c: CardState;
    spin: Animated.Value;
    pull: Animated.Value;
    appear: Animated.Value;
    float: Animated.Value;
    isTop: boolean;
    winnerImage?: string;
}) {
    const tx = spin.interpolate({ inputRange: SAMPLE_INPUT, outputRange: c.txRange });
    const tyBase = spin.interpolate({ inputRange: SAMPLE_INPUT, outputRange: c.tyRange });
    const scaleBase = spin.interpolate({ inputRange: SAMPLE_INPUT, outputRange: c.scaleRange });
    const depthOpacity = spin.interpolate({ inputRange: SAMPLE_INPUT, outputRange: c.opacityRange });
    const rotY = spin.interpolate({ inputRange: SAMPLE_INPUT, outputRange: c.rotYRange });

    // Grow / fade in as the ring forms.
    const appearScale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

    // The reveal: the winner pulls out of the ring toward the viewer; the rest dissolve.
    const revealScale = pull.interpolate({
        inputRange: [0, 1],
        outputRange: [1, c.isWinner ? 2.05 : 0.12],
    });
    const revealTY = pull.interpolate({
        inputRange: [0, 1],
        outputRange: [0, c.isWinner ? -14 : 0],
    });
    const baseOpacity = Animated.multiply(appear, depthOpacity);
    const revealOpacity = c.isWinner
        ? // winner brightens fully as it pops out, regardless of its ring depth
        Animated.multiply(baseOpacity, pull.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }))
        : Animated.multiply(baseOpacity, pull.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }));

    // 3D effect for the winner: a full flip as it comes forward (0deg at rest so the
    // orbit is undisturbed, 360deg when fully pulled), then a gentle perpetual float.
    const revealFlip = c.isWinner
        ? pull.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
        : '0deg';
    const floatY = c.isWinner
        ? float.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] })
        : '0deg';
    const floatX = c.isWinner
        ? float.interpolate({ inputRange: [0, 1], outputRange: ['5deg', '-5deg'] })
        : '0deg';

    // Bluff teaser: this card surges forward, then retreats.
    const teaserScale = c.teaser.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
    const teaserTY = c.teaser.interpolate({ inputRange: [0, 1], outputRange: [0, -26] });

    // "No no no" shake as the bluff card sinks back in.
    const shakeTX = c.shake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-14, 0, 14] });
    const shakeRot = c.shake.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-7deg', '0deg', '7deg'],
    });

    const scale = Animated.multiply(
        Animated.multiply(Animated.multiply(scaleBase, appearScale), revealScale),
        teaserScale,
    );
    const translateY = Animated.add(Animated.add(tyBase, revealTY), teaserTY);

    // The winner slot always shows the caller-supplied prize image — there is no
    // predefined "default" card for the winner, so nothing swaps after the reveal.
    const imgUri = c.isWinner && winnerImage ? winnerImage : c.card.uri;

    // Only fall back to a drawn face if the remote image genuinely fails to load.
    const [imgFailed, setImgFailed] = useState(false);
    useEffect(() => {
        setImgFailed(false);
    }, [imgUri]);

    // `isTop` is set deterministically by the orchestrator for the active card.
    const z = c.isWinner ? 999 : isTop ? 900 : 1;

    return (
        <Animated.View
            style={[
                styles.cardAbs,
                c.isWinner && styles.cardWinner,
                { zIndex: z, elevation: isTop || c.isWinner ? 24 : 10 },
                {
                    opacity: revealOpacity,
                    transform: [
                        { perspective: 900 },
                        { translateX: Animated.add(tx, shakeTX) },
                        { translateY },
                        { rotateX: floatX },
                        { rotateY: rotY },
                        { rotateY: revealFlip },
                        { rotateY: floatY },
                        { rotateZ: shakeRot },
                        { scale },
                    ],
                },
            ]}>
            {imgFailed && <CardFace card={c.card} />}
            <Image
                source={{ uri: imgUri }}
                style={styles.cardImg}
                resizeMode="contain"
                onError={() => setImgFailed(true)}
            />
        </Animated.View>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type AnimatedResultProps = {
    visible: boolean;
    onClose: () => void;
    winnerImage?: string;
    cardBazzi?: string;
};

export default function AnimatedResult({ visible, onClose, winnerImage, cardBazzi }: AnimatedResultProps) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [cards, setCards] = useState<CardState[]>([]);
    const [winCard, setWinCard] = useState<(typeof ALL_CARDS)[number] | null>(null);
    const [topId, setTopId] = useState<string | null>(null); // card currently in front
    const [coins] = useState(makeCoins);
    const [assetsReady, setAssetsReady] = useState(false);
    const lastWinnerImage = useRef<string | undefined>(undefined);

    const spin = useRef(new Animated.Value(0)).current;
    const pull = useRef(new Animated.Value(0)).current;
    const appear = useRef(new Animated.Value(0)).current;
    const float = useRef(new Animated.Value(0)).current; // perpetual 3D float for the winner
    const captionFade = useRef(new Animated.Value(0)).current;
    const floatLoop = useRef<Animated.CompositeAnimation | null>(null);

    const launchCoins = useCallback(() => {
        const anims = coins.map(coin => {
            const dx = rnd(-W * 0.42, W * 0.42);
            const up = rnd(-H * 0.34, -H * 0.08);
            coin.tx.setValue(0);
            coin.ty.setValue(0);
            coin.opacity.setValue(0);
            coin.scale.setValue(0);
            coin.rot.setValue(0);
            return Animated.sequence([
                Animated.delay(rnd(0, 420)),
                Animated.parallel([
                    Animated.spring(coin.scale, { toValue: rnd(0.7, 1.3), useNativeDriver: true }),
                    Animated.timing(coin.opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
                    Animated.timing(coin.tx, {
                        toValue: dx,
                        duration: 850,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(coin.ty, {
                        toValue: up,
                        duration: 850,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(coin.rot, { toValue: 1, duration: 850, useNativeDriver: true }),
                ]),
                Animated.parallel([
                    Animated.timing(coin.ty, {
                        toValue: up + H * 0.32,
                        duration: 620,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                    Animated.timing(coin.opacity, { toValue: 0, duration: 620, useNativeDriver: true }),
                ]),
            ]);
        });
        Animated.stagger(22, anims).start();
    }, [coins]);

    // Stops everything and returns the modal to its pre-animation state, so the
    // next time it opens it starts clean (no leftover winner card / banner).
    const resetAll = useCallback(() => {
        floatLoop.current?.stop();
        spin.setValue(0);
        pull.setValue(0);
        appear.setValue(0);
        float.setValue(0);
        captionFade.setValue(0);
        setCards([]);
        setWinCard(null);
        setTopId(null);
        setPhase('idle');
    }, [appear, captionFade, float, pull, spin]);

    const play = useCallback(() => {
        floatLoop.current?.stop();
        spin.setValue(0);
        pull.setValue(0);
        appear.setValue(0);
        float.setValue(0);
        captionFade.setValue(0);
        setWinCard(null);
        setTopId(null);
        setPhase('running');

        // Use the whole 16-card deck, shuffled into ring order.
        const ordered = [...ALL_CARDS].sort(() => Math.random() - 0.5);
        const baseAngleOf = (i: number) => (i / CARD_COUNT) * TWO_PI;
        const winner = Math.floor(Math.random() * CARD_COUNT);

        // Pick a random 1–4 bluff cards (distinct, never the winner), then the winner.
        const bluffCount = BLUFF_MIN + Math.floor(Math.random() * (BLUFF_MAX - BLUFF_MIN + 1));
        const pool = Array.from({ length: CARD_COUNT }, (_, i) => i)
            .filter(i => i !== winner)
            .sort(() => Math.random() - 0.5);
        const stops = [...pool.slice(0, bluffCount), winner];

        // Cumulative rotation that brings each stop card to the front (cos = 1),
        // always rotating forward at least one full turn between stops.
        const rotations: number[] = [];
        let prev = 0;
        for (const idx of stops) {
            const residue = ((-baseAngleOf(idx)) % TWO_PI + TWO_PI) % TWO_PI;
            let r = prev + MIN_TURN;
            r += ((residue - (r % TWO_PI)) % TWO_PI + TWO_PI) % TWO_PI;
            rotations.push(r);
            prev = r;
        }
        const totalSpin = rotations[rotations.length - 1];
        const fractions = rotations.map(r => r / totalSpin);

        const newCards = ordered.map((card, i) =>
            makeCard(card, baseAngleOf(i), totalSpin, i === winner),
        );
        setCards(newCards);
        setWinCard(ordered[winner]);

        const onWin = () => {
            setPhase('winner');
            launchCoins();
            setTimeout(launchCoins, 1100);
            Animated.timing(captionFade, {
                toValue: 1,
                duration: 520,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
            floatLoop.current = Animated.loop(
                Animated.sequence([
                    Animated.timing(float, {
                        toValue: 1,
                        duration: 1600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(float, {
                        toValue: 0,
                        duration: 1600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ]),
            );
            floatLoop.current.start();
        };

        // Bluff: the front card surges out, holds, shakes "no no no", sinks back in.
        const bluff = (cs: CardState) => {
            const wob = (to: number, d: number) =>
                Animated.timing(cs.shake, { toValue: to, duration: d, useNativeDriver: true });
            return Animated.sequence([
                Animated.spring(cs.teaser, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
                Animated.delay(140),
                Animated.parallel([
                    Animated.sequence([wob(1, 90), wob(-1, 130), wob(1, 130), wob(-1, 130), wob(0, 90)]),
                    Animated.timing(cs.teaser, {
                        toValue: 0,
                        duration: 570,
                        easing: Easing.in(Easing.quad),
                        useNativeDriver: true,
                    }),
                ]),
            ]);
        };

        // Run one leg at a time. The active card is marked on top BEFORE its leg
        // begins, so it stays in front for the whole bluff (no z-fighting).
        const runLeg = (k: number) => {
            const idx = stops[k];
            const isLast = k === stops.length - 1;
            setTopId(newCards[idx].card.id);
            Animated.timing(spin, {
                toValue: fractions[k],
                duration: isLast ? LAST_LEG_MS : LEG_MS,
                easing: isLast ? Easing.out(Easing.quad) : Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (!finished) return;
                if (isLast) {
                    Animated.sequence([
                        Animated.delay(120),
                        Animated.spring(pull, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
                    ]).start(onWin);
                } else {
                    bluff(newCards[idx]).start(({ finished: f }) => f && runLeg(k + 1));
                }
            });
        };

        Animated.timing(appear, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => finished && runLeg(0));
    }, [appear, captionFade, float, launchCoins, pull, spin]);

    // Warm the image cache before the reveal starts, so the carousel never has to
    // wait on a network fetch mid-spin (and the winner image is ready the instant
    // the reveal finishes). The loader stays up until this resolves.
    const prefetchAndPlay = useCallback(() => {
        setAssetsReady(false);
        const uris = winnerImage ? [...DECK_URIS, winnerImage] : DECK_URIS;
        Promise.all(uris.map(uri => Image.prefetch(uri).catch(() => false))).finally(() => {
            setAssetsReady(true);
            play();
        });
    }, [play, winnerImage]);

    // Kick off automatically once the modal has fully presented — starting the
    // spin during the modal's own enter transition is what causes the jerk.
    const handleShow = useCallback(() => {
        lastWinnerImage.current = winnerImage;
        prefetchAndPlay();
    }, [prefetchAndPlay, winnerImage]);

    // If a fresh winnerImage arrives while the modal is already showing its result,
    // hide the old winner immediately (reset to idle) and run the whole reveal
    // again from scratch so the new card is the one that gets shown.
    useEffect(() => {
        if (!visible || phase !== 'winner') return;
        if (lastWinnerImage.current === winnerImage) return;
        lastWinnerImage.current = winnerImage;
        resetAll();
        prefetchAndPlay();
    }, [winnerImage, visible, phase, prefetchAndPlay, resetAll]);

    // Closing (back press, request-close, or the CLOSE button) stops the
    // animation and returns to a clean idle state before notifying the parent.
    const handleClose = useCallback(() => {
        resetAll();
        onClose();
    }, [resetAll, onClose]);

    // If the modal is dismissed from the outside (visible flips to false),
    // make sure everything is stopped and reset for the next time it opens.
    useEffect(() => {
        if (!visible) {
            resetAll();
            setAssetsReady(false);
        }
    }, [visible, resetAll]);

    const captionSlide = useMemo(
        () => captionFade.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
        [captionFade],
    );
    const popLeft = useMemo(
        () => float.interpolate({ inputRange: [0, 1], outputRange: ['-14deg', '4deg'] }),
        [float],
    );
    const popRight = useMemo(
        () => float.interpolate({ inputRange: [0, 1], outputRange: ['14deg', '-4deg'] }),
        [float],
    );

    return (
        <Modal
            visible={visible}
            animationType="fade"
            statusBarTranslucent
            onShow={handleShow}
            onRequestClose={handleClose}>
            <ImageBackground
                source={require('../assets/images/result_background.png')}
                style={styles.root}
                resizeMode="cover">
                <StatusBar barStyle="light-content" backgroundColor={BG} />

                {/* Soft backdrop */}
                <View style={styles.backdrop} pointerEvents="none">
                    <View style={styles.backdropGlow} />
                    <View style={styles.backdropRing} />
                </View>

                {/* Header */}
                {/* <View style={styles.header}>
                    <Text style={styles.brand}>CARDLOADER</Text>
                    <View style={styles.rule} />
                    <Text style={styles.tagline}>SELECT · REVEAL</Text>
                </View> */}

                {/* Winner banner */}
                {phase === 'winner' && (
                    <Animated.View style={[styles.bannerWrap, { opacity: captionFade }]}>
                        {/* <Animated.Text style={[styles.popper, { transform: [{ rotate: popLeft }] }]}>
                            🎉
                        </Animated.Text> */}
                        <Text style={styles.bannerTitle}>{cardBazzi || 'Not Available'}</Text>
                        {/* <Animated.Text style={[styles.popper, { transform: [{ rotate: popRight }] }]}>
                            🎉
                        </Animated.Text> */}
                    </Animated.View>
                )}

                {/* Carousel stage */}
                <View style={styles.stage} pointerEvents="none">
                    {cards.map(c => (
                        <CardView
                            key={c.card.id}
                            c={c}
                            spin={spin}
                            pull={pull}
                            appear={appear}
                            float={float}
                            isTop={c.card.id === topId}
                            winnerImage={winnerImage}
                        />
                    ))}
                    {coins.map(coin => (
                        <CoinView key={coin.id} coin={coin} />
                    ))}
                </View>
                {phase === 'winner' && (
                    <TouchableOpacity style={styles.btn} onPress={handleClose} activeOpacity={0.85}>
                        <Text style={styles.btnText}>CLOSE</Text>
                    </TouchableOpacity>
                )}

                {!assetsReady && (
                    <View style={styles.loaderWrap} pointerEvents="none">
                        <ActivityIndicator size="large" color={CHAMP} />
                    </View>
                )}
            </ImageBackground>
        </Modal>
    );
}

const BG = '#0B0E13';
const CHAMP = '#C9B68C';
const INK = '#ECE8DE';
const MUTE = 'rgba(236,232,222,0.45)';

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
        overflow: 'hidden',
    },

    backdrop: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backdropGlow: {
        position: 'absolute',
        top: CY - W * 0.6,
        width: W * 1.2,
        height: W * 1.2,
        borderRadius: W * 0.6,
        backgroundColor: 'rgba(201,182,140,0.05)',
    },
    backdropRing: {
        position: 'absolute',
        top: CY - RING_RX - 24,
        width: (RING_RX + 24) * 2,
        height: (RING_RX + 24) * 2,
        borderRadius: RING_RX + 24,
        borderWidth: 1,
        borderColor: 'rgba(201,182,140,0.06)',
    },

    header: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    brand: {
        fontSize: 22,
        fontWeight: '300',
        color: INK,
        letterSpacing: 10,
    },
    rule: {
        marginTop: 12,
        width: 40,
        height: 1,
        backgroundColor: CHAMP,
        opacity: 0.7,
    },
    tagline: {
        marginTop: 12,
        fontSize: 10,
        color: MUTE,
        letterSpacing: 6,
        fontWeight: '500',
    },

    bannerWrap: {
        position: 'absolute',
        top: 132,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
    },
    bannerTitle: {
        fontSize: rw(10),
        fontFamily: FontFamilyWithWeight["cooper_italic"],
        color: "#f3d866",
        textTransform: 'uppercase',
        alignSelf: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 14,
    },
    popper: {
        fontSize: 28,
    },

    stage: {
        position: 'absolute',
        left: CX - CARD_W / 2,
        top: CY - CARD_H / 2,
        width: CARD_W,
        height: CARD_H,
    },
    cardAbs: {
        position: 'absolute',
        width: CARD_W,
        height: CARD_H,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 10,
    },
    cardWinner: {
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 24,
    },
    cardImg: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: 8,
    },
    face: {
        ...StyleSheet.absoluteFill,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    faceRed: {
        color: '#C0392B',
    },
    faceCornerTL: {
        position: 'absolute',
        top: 6,
        left: 8,
        fontSize: 17,
        fontWeight: '700',
        color: '#15202B',
    },
    faceCornerBR: {
        position: 'absolute',
        bottom: 6,
        right: 8,
        fontSize: 17,
        fontWeight: '700',
        color: '#15202B',
        transform: [{ rotate: '180deg' }],
    },
    facePip: {
        fontSize: 46,
        color: '#15202B',
    },
    coinAbs: {
        position: 'absolute',
        left: CARD_W / 2 - 12,
        top: CARD_H / 2 - 12,
    },
    coinEmoji: {
        fontSize: 24,
    },

    caption: {
        position: 'absolute',
        bottom: 128,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 40,
    },
    captionLabel: {
        fontSize: 10,
        color: CHAMP,
        letterSpacing: 6,
        fontWeight: '600',
    },
    captionName: {
        marginTop: 10,
        fontSize: 30,
        fontWeight: '300',
        color: INK,
        letterSpacing: 2,
    },
    captionSub: {
        marginTop: 8,
        fontSize: 12,
        color: MUTE,
        letterSpacing: 2,
    },

    loaderWrap: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BG,
        zIndex: 100,
    },

    btn: {
        position: 'absolute',
        bottom: 56,
        alignSelf: 'center',
        paddingHorizontal: 52,
        paddingVertical: 16,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: CHAMP,
        backgroundColor: 'rgba(11,14,19,0.85)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 60,
    },
    btnText: {
        fontSize: 13,
        fontWeight: '500',
        color: CHAMP,
        letterSpacing: 5,
    },
    statusWrap: {
        position: 'absolute',
        bottom: 56,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingVertical: 16,
        zIndex: 60,
    },
    statusText: {
        fontSize: 12,
        color: MUTE,
        letterSpacing: 6,
        fontWeight: '500',
    },
});
