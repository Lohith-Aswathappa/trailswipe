import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SwipeDeck } from '../components/SwipeDeck';
import { Trail } from '../types';

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
    description: 'Steep climb to the highest point in San Francisco',
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

describe('SwipeDeck Component', () => {
  const mockOnSwipeLeft = jest.fn();
  const mockOnSwipeRight = jest.fn();
  const mockOnSwipeUp = jest.fn();
  const mockOnEmpty = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render swipe deck with trails', () => {
    const { getByTestId } = render(
      <SwipeDeck
        trails={mockTrails}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
      />
    );

    expect(getByTestId('swipe-deck')).toBeTruthy();
    expect(getByTestId('swipe-card-0')).toBeTruthy();
    expect(getByTestId('swipe-card-1')).toBeTruthy();
  });

  it('should call onSwipeLeft when card is swiped left', async () => {
    const { getByTestId } = render(
      <SwipeDeck
        trails={mockTrails}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
      />
    );

    fireEvent.press(getByTestId('swipe-left-0'));
    
    await waitFor(() => {
      expect(mockOnSwipeLeft).toHaveBeenCalledWith('1');
    });
  });

  it('should call onSwipeRight when card is swiped right', async () => {
    const { getByTestId } = render(
      <SwipeDeck
        trails={mockTrails}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
      />
    );

    fireEvent.press(getByTestId('swipe-right-0'));
    
    await waitFor(() => {
      expect(mockOnSwipeRight).toHaveBeenCalledWith('1');
    });
  });

  it('should call onSwipeUp when card is swiped up', async () => {
    const { getByTestId } = render(
      <SwipeDeck
        trails={mockTrails}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
      />
    );

    fireEvent.press(getByTestId('swipe-up-0'));
    
    await waitFor(() => {
      expect(mockOnSwipeUp).toHaveBeenCalledWith('1');
    });
  });

  it('should call onEmpty when all cards are swiped', async () => {
    const { getByTestId } = render(
      <SwipeDeck
        trails={mockTrails}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
      />
    );

    // Simulate swiping all cards
    fireEvent.press(getByTestId('swipe-left-0'));
    fireEvent.press(getByTestId('swipe-left-1'));
    
    await waitFor(() => {
      expect(mockOnEmpty).toHaveBeenCalled();
    });
  });

  it('should handle empty trails array', () => {
    const { getByTestId } = render(
      <SwipeDeck
        trails={[]}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
      />
    );

    // Should show empty state instead of swipe deck
    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('should render loading state when trails are loading', () => {
    const { getByTestId } = render(
      <SwipeDeck
        trails={[]}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
        isLoading={true}
      />
    );

    expect(getByTestId('loading-state')).toBeTruthy();
  });

  it('should render error state when there is an error', () => {
    const { getByTestId } = render(
      <SwipeDeck
        trails={[]}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
        error="Failed to load trails"
      />
    );

    expect(getByTestId('error-state')).toBeTruthy();
    expect(getByTestId('error-message')).toHaveTextContent('Failed to load trails');
  });

  it('should show retry button in error state', () => {
    const mockOnRetry = jest.fn();
    const { getByTestId } = render(
      <SwipeDeck
        trails={[]}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
        error="Failed to load trails"
        onRetry={mockOnRetry}
      />
    );

    const retryButton = getByTestId('retry-button');
    expect(retryButton).toBeTruthy();
    
    fireEvent.press(retryButton);
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('should handle swipe gestures correctly', async () => {
    const { getByTestId } = render(
      <SwipeDeck
        trails={mockTrails}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
        onEmpty={mockOnEmpty}
      />
    );

    // Test multiple swipes
    fireEvent.press(getByTestId('swipe-right-0')); // First card right
    fireEvent.press(getByTestId('swipe-left-1'));  // Second card left
    
    await waitFor(() => {
      expect(mockOnSwipeRight).toHaveBeenCalledWith('1');
      expect(mockOnSwipeLeft).toHaveBeenCalledWith('2');
    });
  });
});
