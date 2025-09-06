import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
  PanResponder,
  Animated,
} from 'react-native';
import { Trail } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Card dimensions - responsive and centered
const CARD_WIDTH = screenWidth - 48; // 24pt padding on each side
const CARD_HEIGHT = Math.min(600, screenHeight * 0.8);
const CARD_RADIUS = 20;

// Swipe thresholds
const SWIPE_THRESHOLD = 0.4; // 40% of card width
const VELOCITY_THRESHOLD = 1000; // px/s

export interface SimpleSwipeCardProps {
  trail: Trail;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
}

export const SimpleSwipeCard: React.FC<SimpleSwipeCardProps> = ({
  trail,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onTap,
  onLongPress,
}) => {
  const [pan] = useState(new Animated.ValueXY());
  const [scale] = useState(new Animated.Value(1));
  const [rotation] = useState(new Animated.Value(0));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Lift the card slightly when starting to drag
      Animated.spring(scale, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (_, gestureState) => {
      // Update position
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      
      // Add rotation based on horizontal movement
      const rotationValue = gestureState.dx / CARD_WIDTH * 20; // Max 20 degrees
      rotation.setValue(rotationValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dx, dy, vx, vy } = gestureState;
      const absVelocityX = Math.abs(vx);
      const absTranslationX = Math.abs(dx);
      const translationXPercent = absTranslationX / CARD_WIDTH;

      // Check if swipe threshold is met
      const shouldSwipe = 
        absVelocityX > VELOCITY_THRESHOLD || 
        translationXPercent > SWIPE_THRESHOLD;

      if (shouldSwipe) {
        // Determine swipe direction
        const direction = dx > 0 ? 'right' : 'left';
        
        // Animate card off screen
        const exitX = direction === 'right' ? screenWidth + CARD_WIDTH : -screenWidth - CARD_WIDTH;
        
        Animated.parallel([
          Animated.timing(pan, {
            toValue: { x: exitX, y: dy + vy * 0.1 },
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Call appropriate callback
          if (direction === 'right' && onSwipeRight) {
            onSwipeRight();
          } else if (direction === 'left' && onSwipeLeft) {
            onSwipeLeft();
          }
        });
      } else {
        // Spring back to center
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.spring(rotation, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scale },
      { rotate: rotation.interpolate({
        inputRange: [-20, 20],
        outputRange: ['-20deg', '20deg'],
      }) },
    ],
  };

  if (!trail || !trail.id) {
    console.warn('SimpleSwipeCard: Invalid trail object', trail);
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.card, animatedStyle]}
        {...panResponder.panHandlers}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: trail.photos?.[0]?.url || 'https://picsum.photos/800/600?random=1' }}
            style={styles.image}
            resizeMode="cover"
            defaultSource={{ uri: 'https://picsum.photos/800/600?random=1' }}
            onError={() => console.log('Image failed to load for trail:', trail.name)}
          />
          
          {/* Overlay for text readability */}
          <View style={styles.overlay} />
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
              <Text style={styles.statValue}>{(trail.distance * 0.621371).toFixed(1)} mi</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(trail.elevation * 3.28084)} ft</Text>
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

      {/* Action Buttons - Outside the card */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
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
    backgroundColor: '#000', // Dark fallback to prevent grey areas
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 1000,
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
