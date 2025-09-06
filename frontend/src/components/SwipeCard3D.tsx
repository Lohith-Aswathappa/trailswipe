import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { Trail } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Card dimensions - responsive and centered
const CARD_WIDTH = screenWidth - 48; // 24pt padding on each side
const CARD_HEIGHT = Math.min(600, screenHeight * 0.8);
const CARD_RADIUS = 20;

// 3D perspective and rotation limits
const PERSPECTIVE = 1000;
const MAX_ROTATION_Z = 20; // degrees
const MAX_ROTATION_Y = 12; // degrees  
const MAX_ROTATION_X = 8; // degrees
const SWIPE_THRESHOLD = 0.4; // 40% of card width
const VELOCITY_THRESHOLD = 1000; // px/s

export interface SwipeCard3DProps {
  trail: Trail;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
}

export const SwipeCard3D: React.FC<SwipeCard3DProps> = ({
  trail,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onTap,
  onLongPress,
}) => {
  // Shared values for animations
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotationZ = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const rotationX = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.25);
  const shadowRadius = useSharedValue(15);
  const shadowOffsetY = useSharedValue(10);

  // State for gesture handling
  const [isDragging, setIsDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Check for reduce motion preference
  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Calculate rotation values based on drag position
  const calculateRotations = (x: number, y: number) => {
    const rotationZValue = Math.max(
      -MAX_ROTATION_Z,
      Math.min(MAX_ROTATION_Z, (x / CARD_WIDTH) * MAX_ROTATION_Z * 2)
    );
    const rotationYValue = Math.max(
      -MAX_ROTATION_Y,
      Math.min(MAX_ROTATION_Y, (-x / CARD_WIDTH) * MAX_ROTATION_Y * 2)
    );
    const rotationXValue = Math.max(
      -MAX_ROTATION_X,
      Math.min(MAX_ROTATION_X, (y / CARD_HEIGHT) * MAX_ROTATION_X * 2)
    );
    
    return { rotationZValue, rotationYValue, rotationXValue };
  };

  // Pan gesture handler
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(setIsDragging)(true);
      // Lift shadow and scale up slightly
      shadowOpacity.value = withTiming(0.4, { duration: 200 });
      shadowRadius.value = withTiming(20, { duration: 200 });
      shadowOffsetY.value = withTiming(15, { duration: 200 });
      scale.value = withTiming(1.02, { duration: 200 });
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      if (!reduceMotion) {
        const { rotationZValue, rotationYValue, rotationXValue } = calculateRotations(
          event.translationX,
          event.translationY
        );
        rotationZ.value = rotationZValue;
        rotationY.value = rotationYValue;
        rotationX.value = rotationXValue;
      }
    },
    onEnd: (event) => {
      runOnJS(setIsDragging)(false);
      
      const absVelocityX = Math.abs(event.velocityX);
      const absTranslationX = Math.abs(event.translationX);
      const translationXPercent = absTranslationX / CARD_WIDTH;

      // Check if swipe threshold is met
      const shouldSwipe = 
        absVelocityX > VELOCITY_THRESHOLD || 
        translationXPercent > SWIPE_THRESHOLD;

      if (shouldSwipe) {
        // Determine swipe direction
        const direction = event.translationX > 0 ? 'right' : 'left';
        
        // Animate card off screen
        const exitX = direction === 'right' ? screenWidth + CARD_WIDTH : -screenWidth - CARD_WIDTH;
        
        translateX.value = withTiming(exitX, { duration: 300 });
        translateY.value = withTiming(translateY.value + event.velocityY * 0.1, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });
        
        // Call appropriate callback
        if (direction === 'right' && onSwipeRight) {
          runOnJS(onSwipeRight)();
        } else if (direction === 'left' && onSwipeLeft) {
          runOnJS(onSwipeLeft)();
        }
      } else {
        // Spring back to center
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        
        if (!reduceMotion) {
          rotationZ.value = withSpring(0, { damping: 15, stiffness: 150 });
          rotationY.value = withSpring(0, { damping: 15, stiffness: 150 });
          rotationX.value = withSpring(0, { damping: 15, stiffness: 150 });
        }
      }

      // Reset shadow
      shadowOpacity.value = withTiming(0.25, { duration: 300 });
      shadowRadius.value = withTiming(15, { duration: 300 });
      shadowOffsetY.value = withTiming(10, { duration: 300 });
    },
  });

  // Tap gesture handler
  const tapGestureHandler = useAnimatedGestureHandler({
    onEnd: () => {
      if (onTap) {
        runOnJS(onTap)();
      }
    },
  });

  // Long press gesture handler
  const longPressGestureHandler = useAnimatedGestureHandler({
    onEnd: () => {
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
    },
  });

  // Animated styles
  const animatedCardStyle = useAnimatedStyle(() => {
    const transform = [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ];

    if (!reduceMotion) {
      transform.push(
        { perspective: PERSPECTIVE },
        { rotateZ: `${rotationZ.value}deg` },
        { rotateY: `${rotationY.value}deg` },
        { rotateX: `${rotationX.value}deg` }
      );
    }

    return {
      transform,
      shadowOpacity: shadowOpacity.value,
      shadowRadius: shadowRadius.value,
      shadowOffset: {
        width: 0,
        height: shadowOffsetY.value,
      },
    };
  });

  // Gradient overlay for text readability
  const gradientOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, CARD_WIDTH * 0.3],
      [0.7, 0.9]
    ),
  }));

  if (!trail || !trail.id) {
    console.warn('SwipeCard3D: Invalid trail object', trail);
    return null;
  }

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={panGestureHandler}>
        <Animated.View style={[styles.gestureContainer]}>
          <TapGestureHandler onGestureEvent={tapGestureHandler}>
            <Animated.View>
              <LongPressGestureHandler
                onGestureEvent={longPressGestureHandler}
                minDurationMs={500}
              >
                <Animated.View>
                  <Animated.View style={[styles.card, animatedCardStyle]}>
                    {/* Image Container */}
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: trail.photos?.[0]?.url || 'https://via.placeholder.com/400x600' }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <Animated.View style={[styles.gradientOverlay, gradientOverlay]} />
                      
                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.leftButton]}
                          onPress={onSwipeLeft}
                          accessibilityLabel="Pass on this trail"
                          accessibilityRole="button"
                        >
                          <Text style={styles.actionButtonText}>✕</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.upButton]}
                          onPress={onSwipeUp}
                          accessibilityLabel="Add to bucket list"
                          accessibilityRole="button"
                        >
                          <Text style={styles.actionButtonText}>★</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.actionButton, styles.rightButton]}
                          onPress={onSwipeRight}
                          accessibilityLabel="Like this trail"
                          accessibilityRole="button"
                        >
                          <Text style={styles.actionButtonText}>♥</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Content Container */}
                    <View style={styles.contentContainer}>
                      <Text style={styles.trailName} accessibilityLabel={`Trail: ${trail.name}`}>
                        {trail.name}
                      </Text>
                      
                      <Text style={styles.trailDescription} numberOfLines={2}>
                        {trail.description}
                      </Text>

                      {/* Stats Row */}
                      <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>{trail.distance} km</Text>
                          <Text style={styles.statLabel}>Distance</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>{trail.elevation}m</Text>
                          <Text style={styles.statLabel}>Elevation</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>{trail.difficulty}</Text>
                          <Text style={styles.statLabel}>Difficulty</Text>
                        </View>
                      </View>

                      {/* Tags */}
                      <View style={styles.tagsContainer}>
                        {trail.tags?.slice(0, 3).map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </Animated.View>
                </Animated.View>
              </LongPressGestureHandler>
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  gestureContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  leftButton: {
    backgroundColor: '#ff6b6b',
  },
  upButton: {
    backgroundColor: '#ffa726',
  },
  rightButton: {
    backgroundColor: '#66bb6a',
  },
  actionButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  trailName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  trailDescription: {
    fontSize: 16,
    color: '#f0f0f0',
    marginBottom: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});
