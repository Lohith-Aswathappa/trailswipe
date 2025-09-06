import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrailDiscoveryScreen } from '../screens/TrailDiscoveryScreen';
import { Trail } from '../types';

// Mock the hooks
jest.mock('../hooks/useTrails', () => ({
  useTrailCards: jest.fn(),
  useSwipeTrail: jest.fn(),
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock react-native-deck-swiper
jest.mock('react-native-deck-swiper', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return React.forwardRef(({ cards, renderCard, onSwipedLeft, onSwipedRight, onSwipedTop, onSwipedAll, ...props }: any, ref: any) => {
    const [swipedCount, setSwipedCount] = React.useState(0);
    
    const handleSwipe = (callback: any, index: number) => {
      if (callback) callback(index);
      const newCount = swipedCount + 1;
      setSwipedCount(newCount);
      if (newCount >= cards.length && onSwipedAll) {
        onSwipedAll();
      }
    };
    
    return (
      <View testID="swipe-deck" ref={ref} {...props}>
        {cards && cards.map((card: any, index: number) => (
          <View key={index} testID={`swipe-card-${index}`}>
            {renderCard && renderCard(card, index)}
            <TouchableOpacity 
              testID={`swipe-left-${index}`}
              onPress={() => handleSwipe(onSwipedLeft, index)}
            >
              <Text>Left</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID={`swipe-right-${index}`}
              onPress={() => handleSwipe(onSwipedRight, index)}
            >
              <Text>Right</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              testID={`swipe-up-${index}`}
              onPress={() => handleSwipe(onSwipedTop, index)}
            >
              <Text>Up</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  });
});

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

const mockRoute = {
  key: 'trail-discovery',
  name: 'TrailDiscovery',
  params: {},
};

// Mock trail data
const mockTrails: Trail[] = [
  {
    id: '1',
    name: 'Golden Gate Park Loop',
    description: 'A beautiful loop through Golden Gate Park',
    distance: 3.2,
    elevation: 150,
    difficulty: 'easy',
    tags: ['scenic', 'family-friendly'],
    location: {
      type: 'Point',
      coordinates: [-122.4615, 37.7694]
    },
    photos: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Mount Davidson Trail',
    description: 'Steep climb to the highest point',
    distance: 2.1,
    elevation: 928,
    difficulty: 'moderate',
    tags: ['scenic', 'challenging'],
    location: {
      type: 'Point',
      coordinates: [-122.4567, 37.7519]
    },
    photos: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

describe('TrailDiscoveryScreen', () => {
  let queryClient: QueryClient;
  let mockUseTrailCards: jest.Mock;
  let mockUseSwipeTrail: jest.Mock;
  let mockUseAuth: jest.Mock;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseTrailCards = require('../hooks/useTrails').useTrailCards;
    mockUseSwipeTrail = require('../hooks/useTrails').useSwipeTrail;
    mockUseAuth = require('../hooks/useAuth').useAuth;

    // Default mock implementations
    mockUseTrailCards.mockReturnValue({
      data: { data: mockTrails, pagination: { page: 1, limit: 20, total: 2, totalPages: 1 } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseSwipeTrail.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
      error: null,
    });

    mockUseAuth.mockReturnValue({
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TrailDiscoveryScreen navigation={mockNavigation} route={mockRoute} />
      </QueryClientProvider>
    );
  };

  it('should render trail discovery screen', () => {
    const { getByTestId } = renderScreen();
    
    expect(getByTestId('trail-discovery-screen')).toBeTruthy();
    expect(getByTestId('swipe-deck')).toBeTruthy();
  });

  it('should display loading state when trails are loading', () => {
    mockUseTrailCards.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { getByTestId } = renderScreen();
    
    expect(getByTestId('loading-state')).toBeTruthy();
  });

  it('should display error state when there is an error', () => {
    mockUseTrailCards.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load trails'),
      refetch: jest.fn(),
    });

    const { getByTestId } = renderScreen();
    
    expect(getByTestId('error-state')).toBeTruthy();
    expect(getByTestId('error-message')).toHaveTextContent('Failed to load trails');
  });

  it('should handle swipe left action', async () => {
    const mockSwipeMutation = jest.fn().mockResolvedValue({});
    mockUseSwipeTrail.mockReturnValue({
      mutateAsync: mockSwipeMutation,
      isPending: false,
      error: null,
    });

    const { getByTestId } = renderScreen();
    
    // Simulate swipe left
    fireEvent.press(getByTestId('swipe-left-0'));
    
    await waitFor(() => {
      expect(mockSwipeMutation).toHaveBeenCalledWith({
        trailId: '1',
        direction: 'left',
      });
    });
  });

  it('should handle swipe right action', async () => {
    const mockSwipeMutation = jest.fn().mockResolvedValue({});
    mockUseSwipeTrail.mockReturnValue({
      mutateAsync: mockSwipeMutation,
      isPending: false,
      error: null,
    });

    const { getByTestId } = renderScreen();
    
    // Simulate swipe right
    fireEvent.press(getByTestId('swipe-right-0'));
    
    await waitFor(() => {
      expect(mockSwipeMutation).toHaveBeenCalledWith({
        trailId: '1',
        direction: 'right',
      });
    });
  });

  it('should handle swipe up action (bucket list)', async () => {
    const mockSwipeMutation = jest.fn().mockResolvedValue({});
    mockUseSwipeTrail.mockReturnValue({
      mutateAsync: mockSwipeMutation,
      isPending: false,
      error: null,
    });

    const { getByTestId } = renderScreen();
    
    // Simulate swipe up
    fireEvent.press(getByTestId('swipe-up-0'));
    
    await waitFor(() => {
      expect(mockSwipeMutation).toHaveBeenCalledWith({
        trailId: '1',
        direction: 'up',
      });
    });
  });

  it('should show match notification when match is created', async () => {
    const mockSwipeMutation = jest.fn().mockResolvedValue({
      match: { id: 'match1', trailId: '1', userId1: '1', userId2: '2' }
    });
    mockUseSwipeTrail.mockReturnValue({
      mutateAsync: mockSwipeMutation,
      isPending: false,
      error: null,
    });

    const { getByTestId } = renderScreen();
    
    // Simulate swipe right that creates a match
    fireEvent.press(getByTestId('swipe-right-0'));
    
    await waitFor(() => {
      expect(getByTestId('match-notification')).toBeTruthy();
    });
  });

  it('should handle empty trails state', () => {
    mockUseTrailCards.mockReturnValue({
      data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByTestId, getByText } = renderScreen();
    
    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('No more trails to discover')).toBeTruthy();
  });

  it('should show retry button in error state', () => {
    const mockRefetch = jest.fn();
    mockUseTrailCards.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load trails'),
      refetch: mockRefetch,
    });

    const { getByTestId } = renderScreen();
    
    const retryButton = getByTestId('retry-button');
    expect(retryButton).toBeTruthy();
    
    fireEvent.press(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should navigate to profile when profile button is pressed', () => {
    const { getByTestId } = renderScreen();
    
    fireEvent.press(getByTestId('profile-button'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Profile');
  });

  it('should navigate to friends when friends button is pressed', () => {
    const { getByTestId } = renderScreen();
    
    fireEvent.press(getByTestId('friends-button'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Friends');
  });

  it('should navigate to matches when matches button is pressed', () => {
    const { getByTestId } = renderScreen();
    
    fireEvent.press(getByTestId('matches-button'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Matches');
  });

        it('should handle swipe error gracefully', async () => {
        const mockSwipeMutation = jest.fn().mockRejectedValue(new Error('Swipe failed'));
        mockUseSwipeTrail.mockReturnValue({
          mutateAsync: mockSwipeMutation,
          isPending: false,
          error: null,
        });

        const { getByTestId } = renderScreen();
        
        // Simulate swipe that fails
        fireEvent.press(getByTestId('swipe-right-0'));
        
        // The error should be handled gracefully (no crash)
        await waitFor(() => {
          expect(mockSwipeMutation).toHaveBeenCalledWith({
            trailId: '1',
            direction: 'right',
          });
        });
      });

  it('should show loading state during swipe operation', () => {
    mockUseSwipeTrail.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true,
      error: null,
    });

    const { getByTestId } = renderScreen();
    
    expect(getByTestId('swipe-loading')).toBeTruthy();
  });
});
