import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";

/**
 * Convert width percentage to dp
 * @example rw(5) => 5% of screen width
 */
export const rw = (percentage: number): number => {
    return wp(`${percentage}%`);
};

/**
 * Convert height percentage to dp
 * @example rh(10) => 10% of screen height
 */
export const rh = (percentage: number): number => {
    return hp(`${percentage}%`);
};

/**
 * Responsive font size based on width
 */
export const rf = (percentage: number): number => {
    return wp(`${percentage}%`);
};
