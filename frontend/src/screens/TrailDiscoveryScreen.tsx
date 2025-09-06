import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SwipeDeck } from '../components/SwipeDeck';
import { useTrailCards, useSwipeTrail } from '../hooks/useTrails';
import { useAuth } from '../hooks/useAuth';

interface TrailDiscoveryScreenProps {
  navigation: any;
  route: any;
}

export const TrailDiscoveryScreen: React.FC<TrailDiscoveryScreenProps> = ({
  navigation,
}) => {
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchInfo, setMatchInfo] = useState<any>(null);

  const { user, isAuthenticated } = useAuth();
  const { data: trailData, isLoading, error, refetch } = useTrailCards(undefined, isAuthenticated);
  const { mutateAsync: swipeTrail, isPending: isSwipePending } = useSwipeTrail();

  const trails = Array.isArray(trailData?.trails) ? trailData.trails : [];

  // Debug logging
  console.log('=== TrailDiscoveryScreen Debug ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', user);
  console.log('isLoading:', isLoading);
  console.log('error:', error);
  console.log('trailData:', trailData);
  console.log('trails count:', trails.length);
  console.log('================================');

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    }
  }, [isAuthenticated, navigation]);

  // Refresh trail cards when screen comes into focus
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  // Clear user's swipes when app opens (for testing)
  useEffect(() => {
    const clearSwipes = async () => {
      if (isAuthenticated) {
        try {
          await apiService.clearSwipes();
          console.log('Swipes cleared on app open');
          refetch(); // Refresh trail cards after clearing swipes
        } catch (error) {
          console.log('Could not clear swipes:', error);
        }
      }
    };
    
    clearSwipes();
  }, [isAuthenticated, refetch]);

  const handleSwipeLeft = async (trailId: string) => {
    console.log('=== Swipe Left Debug ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('trailId:', trailId);
    console.log('========================');
    
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please log in to swipe on trails.');
      return;
    }
    
    try {
      console.log('Attempting left swipe on trail:', trailId);
      await swipeTrail({ trailId, direction: 'left' });
      console.log('Left swipe successful');
    } catch (error) {
      // Check if it's a duplicate swipe error first
      if (error.response?.data?.error === 'Already swiped on this trail') {
        console.log('Duplicate swipe detected - this is normal behavior');
        return; // Don't show error for duplicate swipes
      }
      
      console.error('Left swipe failed:', error);
      Alert.alert('Error', 'Failed to record swipe. Please try again.');
    }
  };

  const handleSwipeRight = async (trailId: string) => {
    console.log('=== Swipe Right Debug ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('trailId:', trailId);
    console.log('========================');
    
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please log in to swipe on trails.');
      return;
    }
    
    try {
      console.log('Attempting right swipe on trail:', trailId);
      const result = await swipeTrail({ trailId, direction: 'right' });
      console.log('Right swipe successful:', result);
      
      // Check if a match was created
      if (result.match) {
        setMatchInfo(result.match);
        setShowMatchNotification(true);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowMatchNotification(false);
          setMatchInfo(null);
        }, 3000);
      }
    } catch (error) {
      // Check if it's a duplicate swipe error first
      if (error.response?.data?.error === 'Already swiped on this trail') {
        console.log('Duplicate swipe detected - this is normal behavior');
        return; // Don't show error for duplicate swipes
      }
      
      console.error('Right swipe failed:', error);
      Alert.alert('Error', 'Failed to record swipe. Please try again.');
    }
  };

  const handleSwipeUp = async (trailId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Please log in to swipe on trails.');
      return;
    }
    
    try {
      console.log('Attempting up swipe on trail:', trailId);
      await swipeTrail({ trailId, direction: 'up' });
      console.log('Up swipe successful');
    } catch (error) {
      // Check if it's a duplicate swipe error first
      if (error.response?.data?.error === 'Already swiped on this trail') {
        console.log('Duplicate swipe detected - this is normal behavior');
        return; // Don't show error for duplicate swipes
      }
      
      console.error('Up swipe failed:', error);
      Alert.alert('Error', 'Failed to record swipe. Please try again.');
    }
  };

  const handleEmpty = () => {
    Alert.alert(
      'No More Trails',
      'You\'ve seen all available trails! Check back later for new ones.',
      [{ text: 'OK' }]
    );
  };

  const testAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      console.log('=== Manual Auth Test ===');
      console.log('Token:', token ? token.substring(0, 20) + '...' : 'None');
      console.log('User Data:', userData ? 'Present' : 'None');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('user:', user);
      console.log('=======================');
      
      Alert.alert(
        'Auth Status',
        `Authenticated: ${isAuthenticated}\nToken: ${token ? 'Present' : 'Missing'}\nUser: ${user ? 'Present' : 'Missing'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const navigateToFriends = () => {
    navigation.navigate('Friends');
  };

  const navigateToMatches = () => {
    navigation.navigate('Matches');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Please log in to discover trails</Text>
      </View>
    );
  }

  return (
    <View testID="trail-discovery-screen" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Trails</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            testID="profile-button"
            style={styles.headerButton}
            onPress={navigateToProfile}
          >
            <Text style={styles.headerButtonText}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="friends-button"
            style={styles.headerButton}
            onPress={navigateToFriends}
          >
            <Text style={styles.headerButtonText}>👥</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="matches-button"
            style={styles.headerButton}
            onPress={navigateToMatches}
          >
            <Text style={styles.headerButtonText}>💕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="test-auth-button"
            style={[styles.headerButton, { backgroundColor: '#007AFF' }]}
            onPress={testAuth}
          >
            <Text style={[styles.headerButtonText, { color: 'white' }]}>🔐</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe Deck */}
      <View style={styles.deckContainer}>
        <SwipeDeck
          testID="swipe-deck"
          trails={trails}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSwipeUp={handleSwipeUp}
          onEmpty={handleEmpty}
          isLoading={isLoading}
          error={error?.message || null}
          onRetry={handleRetry}
        />
      </View>

      {/* Loading Overlay for Swipe Operations */}
      {isSwipePending && (
        <View testID="swipe-loading" style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      )}

      {/* Match Notification */}
      {showMatchNotification && matchInfo && (
        <View testID="match-notification" style={styles.matchNotification}>
          <Text style={styles.matchNotificationText}>
            🎉 You have a new match! Both you and a friend liked this trail.
          </Text>
        </View>
      )}

      {/* Error Toast */}
      {error && (
        <View testID="error-toast" style={styles.errorToast}>
          <Text style={styles.errorToastText}>
            {error.message || 'An error occurred'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    // 3D background effect
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced centering with 3D perspective
    transform: [{ perspective: 1000 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerButtonText: {
    fontSize: 20,
  },
  deckContainer: {
    flex: 1,
    // 3D container effect
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    // Enhanced centering
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchNotification: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    zIndex: 1000,
  },
  matchNotificationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorToast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#ff5252',
    padding: 16,
    borderRadius: 8,
    zIndex: 1000,
  },
  errorToastText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff5252',
    textAlign: 'center',
  },
});
