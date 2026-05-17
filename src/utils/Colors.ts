export const Colors = {

    // ─── Backgrounds ────────────────────────────────────────────────────────────
    PRIMARY_BG: '#1B0535',          // darkest purple — header gradient start, page bg
    SECONDARY_BG: '#3A0D7A',        // header gradient end
    DARK_VIOLET: '#3C1866',
    PURPLE: '#260030',
    STATUS_BAR_COLOR: '#3D1B5E',
    DEEP_PURPLE: '#2D0A6E',         // GameRules bg
    WRAPPER_BG: '#7f53ca',          // Wrapper status bar
    TAB_ACTIVE_BG: '#5d2b8d',       // bottom tab & drawer active item bg
    CARD_BG: 'rgba(45, 16, 96, 0.85)',          // SeriesCard bg

    // ─── Text ────────────────────────────────────────────────────────────────────
    WHITE: '#FFFFFF',
    WHITE_75: 'rgba(255,255,255,0.75)',   // muted label text (e.g. "INR In Wallet")
    WHITE_55: 'rgba(255,255,255,0.55)',   // inactive tab text
    BLACK: '#000000',
    GRAY: '#CACACA',
    GRAY_ALT: '#989797',
    DARK_GRAY: '#727070',
    BLAKISH_GRAY: '#333333',
    HIGHLIGHT_PURPLE: '#A016E6',

    // ─── Accent / Gold ──────────────────────────────────────────────────────────
    GOLD: '#FFD700',                // active tab icon, gradient text
    GOLD_DARK: '#B8860B',           // gradient spacer mid-point
    ORANGE: '#FFA500',              // gradient end for active states
    YELLOW: '#FFD400',

    // ─── Semantic ───────────────────────────────────────────────────────────────
    ERROR_RED: '#fc0303',
    BLOOD_RED: '#A60A00',
    GREEN: '#3BD414',
    PINK: '#FFB0B0',
    DARK_BROWN: '#340000',
    BROWN: '#330000',

    // ─── UI Components ──────────────────────────────────────────────────────────
    BADGE_BG: '#E8A020',            // SeriesCard badge background
    BADGE_TEXT: '#330000',          // SeriesCard badge text
    DISABLED_BG: '#aaa',            // disabled button background
    INPUT_BORDER: '#ccc',           // text input border
    TRANSPARENT: 'transparent',

    // ─── Overlays / Borders ─────────────────────────────────────────────────────
    OVERLAY_DARK: 'rgba(0,0,0,0.35)',               // header pill bg
    OVERLAY_PURPLE: 'rgba(20, 0, 60, 0.55)',        // GameRules container
    BORDER_WHITE_12: 'rgba(255,255,255,0.12)',       // header pill border
    BORDER_WHITE_08: 'rgba(255,255,255,0.08)',       // SeriesCard border

    // ─── Gradients ──────────────────────────────────────────────────────────────
    GRADIENT: {
        HEADER: ['#44004F','#3b1e60','#3b2263'],
        GRADIENTHEADER: ['#541770','#451863','#451863'],
        // Metallic gold — top highlight → rich gold → deep amber (top-to-bottom, angle 180)
        GOLD: ['#FFD540', '#FFE600', '#FFF177', '#A300DC'],
        BUTTON_GOLD: ['#FFD540','#cf67f5', '#FFE600', '#FFF177',],
        GOLD_LOCATIONS: [0.25, 0.5, 0.75, 1] as number[],
        SPACER: ['transparent', '#B8860B', '#FFD700', '#FFA500', '#B8860B', 'transparent'],
        SPACER_CORE: ['#B8860B', '#FFD700', '#FFA500', '#B8860B'],
        TEXT_WHITE: ['#FFFFFF', '#DDDDDD'],
        RED: '#E86900',
        YELLOW: '#FCD20D',
    },
};
