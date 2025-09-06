import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Trail } from '../types';

interface SwipeCardProps {
  trail: Trail;
  onSwipeLeft: (trailId: string) => void;
  onSwipeRight: (trailId: string) => void;
  onSwipeUp: (trailId: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const SwipeCard: React.FC<SwipeCardProps> = ({
  trail,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
}) => {
  const primaryPhoto = trail.photos.find(photo => photo.isPrimary) || trail.photos[0];

  const formatDistance = (distance: number): string => {
    return `${distance} km`;
  };

  const formatElevation = (elevation: number): string => {
    return `${elevation}m elevation`;
  };

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.container}>
        {/* Trail Photo */}
        <View style={styles.imageContainer}>
        {primaryPhoto ? (
          <Image
            testID="trail-photo"
            source={{ uri: primaryPhoto.url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View testID="trail-photo-placeholder" style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
      </View>

      {/* Trail Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.trailName}>{trail.name}</Text>
        <Text style={styles.trailDescription}>{trail.description}</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>{formatDistance(trail.distance)}</Text>
          <Text style={styles.statText}>{formatElevation(trail.elevation)}</Text>
          <Text style={styles.statText}>{capitalizeFirst(trail.difficulty)}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {trail.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Swipe Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          testID="swipe-left-button"
          style={[styles.actionButton, styles.leftButton]}
          onPress={() => onSwipeLeft(trail.id)}
        >
          <Text style={styles.actionButtonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="swipe-up-button"
          style={[styles.actionButton, styles.upButton]}
          onPress={() => onSwipeUp(trail.id)}
        >
          <Text style={styles.actionButtonText}>♡</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="swipe-right-button"
          style={[styles.actionButton, styles.rightButton]}
          onPress={() => onSwipeRight(trail.id)}
        >
          <Text style={styles.actionButtonText}>♥</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  container: {
    width: screenWidth * 0.85,
    height: screenHeight * 0.7,
    backgroundColor: '#fff',
    borderRadius: 20,
    // Enhanced 3D shadow effects
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
    // Perfect centering
    alignSelf: 'center',
    // 3D border effect
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    // Transform for 3D perspective
    transform: [{ perspective: 1000 }],
  },
  imageContainer: {
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    // 3D effect for image
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '500',
  },
  infoContainer: {
    padding: 16,
    flex: 1,
  },
  trailName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
  },
  trailDescription: {
    fontSize: 15,
    color: '#5a6c7d',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statText: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '600',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced 3D button effects
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    // 3D button effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
});
 