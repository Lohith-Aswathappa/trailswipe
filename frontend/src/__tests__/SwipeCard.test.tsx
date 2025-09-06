import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SwipeCard } from '../components/SwipeCard';
import { Trail } from '../types';

// Mock trail data
const mockTrail: Trail = {
  id: '1',
  name: 'Golden Gate Park Loop',
  description: 'A beautiful loop through Golden Gate Park with scenic views',
  distance: 3.2,
  elevation: 150,
  difficulty: 'easy',
  tags: ['scenic', 'family-friendly', 'paved'],
  location: {
    type: 'Point',
    coordinates: [-122.4615, 37.7694]
  },
  photos: [{
    id: '1',
    trailId: '1',
    url: 'https://example.com/trail1.jpg',
    alt: 'Golden Gate Park',
    isPrimary: true,
    createdAt: '2024-01-01T00:00:00Z'
  }],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

describe('SwipeCard Component', () => {
  const mockOnSwipeLeft = jest.fn();
  const mockOnSwipeRight = jest.fn();
  const mockOnSwipeUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render trail information correctly', () => {
    const { getByText } = render(
      <SwipeCard
        trail={mockTrail}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    expect(getByText('Golden Gate Park Loop')).toBeTruthy();
    expect(getByText('A beautiful loop through Golden Gate Park with scenic views')).toBeTruthy();
    expect(getByText('3.2 km')).toBeTruthy();
    expect(getByText('150m elevation')).toBeTruthy();
    expect(getByText('Easy')).toBeTruthy();
  });

  it('should render trail tags', () => {
    const { getByText } = render(
      <SwipeCard
        trail={mockTrail}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    expect(getByText('scenic')).toBeTruthy();
    expect(getByText('family-friendly')).toBeTruthy();
    expect(getByText('paved')).toBeTruthy();
  });

  it('should render primary trail photo', () => {
    const { getByTestId } = render(
      <SwipeCard
        trail={mockTrail}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    const image = getByTestId('trail-photo');
    expect(image).toBeTruthy();
    expect(image.props.source.uri).toBe('https://example.com/trail1.jpg');
  });

  it('should render swipe action buttons', () => {
    const { getByTestId } = render(
      <SwipeCard
        trail={mockTrail}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    expect(getByTestId('swipe-left-button')).toBeTruthy();
    expect(getByTestId('swipe-right-button')).toBeTruthy();
    expect(getByTestId('swipe-up-button')).toBeTruthy();
  });

  it('should call onSwipeLeft when left button is pressed', () => {
    const { getByTestId } = render(
      <SwipeCard
        trail={mockTrail}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    fireEvent.press(getByTestId('swipe-left-button'));
    expect(mockOnSwipeLeft).toHaveBeenCalledWith('1');
  });

  it('should call onSwipeRight when right button is pressed', () => {
    const { getByTestId } = render(
      <SwipeCard
        trail={mockTrail}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    fireEvent.press(getByTestId('swipe-right-button'));
    expect(mockOnSwipeRight).toHaveBeenCalledWith('1');
  });

  it('should call onSwipeUp when up button is pressed', () => {
    const { getByTestId } = render(
      <SwipeCard
        trail={mockTrail}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    fireEvent.press(getByTestId('swipe-up-button'));
    expect(mockOnSwipeUp).toHaveBeenCalledWith('1');
  });

  it('should handle trail without photos gracefully', () => {
    const trailWithoutPhotos = { ...mockTrail, photos: [] };
    
    const { getByTestId } = render(
      <SwipeCard
        trail={trailWithoutPhotos}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    // Should show placeholder image
    const placeholderImage = getByTestId('trail-photo-placeholder');
    expect(placeholderImage).toBeTruthy();
  });

  it('should format distance and elevation correctly', () => {
    const trailWithDifferentValues = {
      ...mockTrail,
      distance: 1.5,
      elevation: 2500
    };

    const { getByText } = render(
      <SwipeCard
        trail={trailWithDifferentValues}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    expect(getByText('1.5 km')).toBeTruthy();
    expect(getByText('2500m elevation')).toBeTruthy();
  });

  it('should capitalize difficulty level', () => {
    const trailWithDifferentDifficulty = {
      ...mockTrail,
      difficulty: 'moderate'
    };

    const { getByText } = render(
      <SwipeCard
        trail={trailWithDifferentDifficulty}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        onSwipeUp={mockOnSwipeUp}
      />
    );

    expect(getByText('Moderate')).toBeTruthy();
  });
});
