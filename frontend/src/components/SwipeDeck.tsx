import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SimpleSwipeCard } from './SimpleSwipeCard';
import { Trail } from '../types';

interface SwipeDeckProps {
  trails: Trail[];
  onSwipeLeft: (trailId: string) => void;
  onSwipeRight: (trailId: string) => void;
  onSwipeUp: (trailId: string) => void;
  onEmpty: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  trails,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onEmpty,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ensure trails is an array and filter out any undefined or invalid trail objects
  const validTrails = Array.isArray(trails) 
    ? trails.filter(trail => trail && trail.id && typeof trail.id === 'string')
    : [];
  
  console.log('SwipeDeck: Original trails count:', trails?.length || 0);
  console.log('SwipeDeck: Valid trails count:', validTrails.length);
  console.log('SwipeDeck: Sample trail:', validTrails[0]);

  const handleSwipeLeft = () => {
    if (validTrails[currentIndex]) {
      onSwipeLeft(validTrails[currentIndex].id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (validTrails[currentIndex]) {
      onSwipeRight(validTrails[currentIndex].id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSwipeUp = () => {
    if (validTrails[currentIndex]) {
      onSwipeUp(validTrails[currentIndex].id);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleTap = () => {
    // Optional: Handle tap to show details
    console.log('Card tapped:', validTrails[currentIndex]?.name);
  };

  const handleLongPress = () => {
    // Optional: Handle long press for quick actions
    console.log('Card long pressed:', validTrails[currentIndex]?.name);
  };

  // Check if we've reached the end
  React.useEffect(() => {
    if (currentIndex >= validTrails.length && validTrails.length > 0) {
      onEmpty();
    }
  }, [currentIndex, validTrails.length, onEmpty]);

  if (isLoading) {
    return (
      <View testID="loading-state" style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading trails...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View testID="error-state" style={styles.centerContainer}>
        <Text testID="error-message" style={styles.errorText}>
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity
            testID="retry-button"
            style={styles.retryButton}
            onPress={onRetry}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (validTrails.length === 0) {
    return (
      <View testID="empty-state" style={styles.centerContainer}>
        <Text style={styles.emptyText}>No more trails to discover</Text>
        <Text style={styles.emptySubtext}>
          Check back later for new trails or adjust your preferences
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardDeck}>
        {validTrails[currentIndex] && (
          <SimpleSwipeCard
            key={validTrails[currentIndex].id}
            trail={validTrails[currentIndex]}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSwipeUp={handleSwipeUp}
            onTap={handleTap}
            onLongPress={handleLongPress}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  cardDeck: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff5252',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
