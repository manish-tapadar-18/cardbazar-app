import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
import LinearGradient from 'react-native-linear-gradient';
import GradientText from './GradientText';
import CustomText from './CustomText';
import { rf, rh, rw } from '../utils/responsive';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { Colors } from '../utils/Colors';
import { IGameCategoryResponse } from '../response/module/IGameCategoryResponse';

const BAR_GRADIENT = Colors.GRADIENT.GRADIENTHEADER;

type Props = {
  tabs: IGameCategoryResponse[];
  activeKey: string;
  onPress: (tab: IGameCategoryResponse) => void;
};

const HorizontalTabBar: React.FC<Props> = ({ tabs, activeKey, onPress }) => {
  const [showLeftHint, setShowLeftHint] = useState(false);
  const [showRightHint, setShowRightHint] = useState(true);
  const [hiddenCount, setHiddenCount] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const contentWidthRef = useRef(0);
  const containerWidthRef = useRef(0);
  const scrollXRef = useRef(0);

  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Bounce the right arrow left-right to draw attention
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 5, duration: 350, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.delay(800),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [bounceAnim]);

  const updateHints = useCallback(
    (scrollX: number, contentWidth: number, containerWidth: number) => {
      const maxScroll = contentWidth - containerWidth;
      const atEnd = scrollX >= maxScroll - 4;
      setShowLeftHint(scrollX > 4);
      setShowRightHint(contentWidth > containerWidth && !atEnd);
      if (contentWidth > containerWidth && !atEnd) {
        const visibleFraction = (scrollX + containerWidth) / contentWidth;
        setHiddenCount(Math.max(1, tabs.length - Math.ceil(visibleFraction * tabs.length)));
      } else {
        setHiddenCount(0);
      }
    },
    [tabs.length]
  );

  const handleScroll = ({ nativeEvent }: any) => {
    const scrollX = nativeEvent.contentOffset.x;
    scrollXRef.current = scrollX;
    updateHints(scrollX, contentWidthRef.current, containerWidthRef.current);
  };

  const handleContentSizeChange = (contentWidth: number) => {
    contentWidthRef.current = contentWidth;
    updateHints(scrollXRef.current, contentWidth, containerWidthRef.current);
  };

  const handleLayout = ({ nativeEvent }: any) => {
    const containerWidth = nativeEvent.layout.width;
    containerWidthRef.current = containerWidth;
    updateHints(scrollXRef.current, contentWidthRef.current, containerWidth);
  };

  const scrollLeft = () => {
    const next = Math.max(0, scrollXRef.current - containerWidthRef.current * 0.8);
    scrollViewRef.current?.scrollTo({ x: next, animated: true });
  };

  const scrollRight = () => {
    const maxScroll = contentWidthRef.current - containerWidthRef.current;
    const next = Math.min(maxScroll, scrollXRef.current + containerWidthRef.current * 0.8);
    scrollViewRef.current?.scrollTo({ x: next, animated: true });
  };

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      <LinearGradient
        colors={BAR_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.barGradient}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.container}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
        >
          {tabs.map((tab) => {
            const isActive = tab.ID === activeKey;
            return (
              <TouchableOpacity
                key={tab.ID}
                onPress={() => onPress(tab)}
                style={styles.tab}
                activeOpacity={0.7}
              >
                {isActive ? (
                  <GradientText
                    colors={Colors.GRADIENT.GOLD}
                    locations={Colors.GRADIENT.GOLD_LOCATIONS}
                    style={styles.activeLabel}
                    angle={180}
                  >
                    {tab.NAME}
                  </GradientText>
                ) : (
                  <CustomText style={styles.inactiveLabel}>{tab.NAME}</CustomText>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* Left hint — static arrow, appears after user scrolls right */}
      {showLeftHint && (
        <>
          <LinearGradient
            colors={[Colors.PRIMARY_BG, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.leftFade}
            pointerEvents="none"
          />
          <TouchableOpacity style={styles.leftPill} onPress={scrollLeft} activeOpacity={0.7}>
            <CustomText style={styles.pillArrow}>❮</CustomText>
          </TouchableOpacity>
        </>
      )}

      {/* Right hint — bouncing arrow + hidden count */}
      {showRightHint && (
        <>
          <LinearGradient
            colors={['transparent', Colors.PRIMARY_BG]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rightFade}
            pointerEvents="none"
          />
          <AnimatedTouchable
            style={[styles.rightPill, { transform: [{ translateX: bounceAnim }] }]}
            onPress={scrollRight}
            activeOpacity={0.7}
          >
            <CustomText style={styles.pillArrow}>❯</CustomText>
            {/* {hiddenCount > 0 && (
              <CustomText style={styles.pillCount}>+{hiddenCount}</CustomText>
            )} */}
          </AnimatedTouchable>
        </>
      )}
    </View>
  );
};

export default HorizontalTabBar;

const styles = StyleSheet.create({
  wrapper: {
    height: rh(7),
    flexShrink: 0,
    flexGrow: 0,
  },
  barGradient: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: rw(4),
    alignItems: 'center',
    gap: rw(7),
    height: '100%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: rh(0.5),
    gap: rh(0.4),
  },
  activeLabel: {
    fontSize: rf(6.5),
    fontFamily: FontFamilyWithWeight[700],
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
  inactiveLabel: {
    fontSize: rf(6.5),
    fontFamily: FontFamilyWithWeight[600],
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
  leftFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: rw(16),
    zIndex: 1,
  },
  rightFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: rw(20),
    zIndex: 1,
  },
  leftPill: {
    position: 'absolute',
    left: rw(1.5),
    top: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY_BG,
    borderRadius: rw(4),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
    paddingHorizontal: rw(2),
  },
  rightPill: {
    position: 'absolute',
    right: rw(1.5),
    top: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: rw(0.8),
    backgroundColor: Colors.PRIMARY_BG,
    borderRadius: rw(4),
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.45)',
    paddingHorizontal: rw(2.5),
  },
  pillArrow: {
    color: Colors.GOLD,
    fontSize: rf(4),
    fontFamily: FontFamilyWithWeight[700],
    lineHeight: rf(5.5),
  },
  pillCount: {
    color: Colors.GOLD,
    fontSize: rf(3),
    fontFamily: FontFamilyWithWeight[700],
    lineHeight: rf(5.5),
  },
});
