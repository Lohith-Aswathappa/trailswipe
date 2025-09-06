import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SimpleSwipeCard } from './SimpleSwipeCard';
import { Trail } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Generate 100 sample trails for testing
const generateSampleTrails = (): Trail[] => {
  const trailNames = [
    'Golden Gate Park Loop', 'Lands End Trail', 'Twin Peaks Summit', 'Mount Davidson', 'Corona Heights',
    'Buena Vista Park', 'Presidio Loop', 'Crissy Field Walk', 'Fort Point Trail', 'Baker Beach Trail',
    'Lombard Street Steps', 'Coit Tower Stairs', 'Filbert Steps', 'Greenwich Steps', 'Valencia Street Walk',
    'Mission Dolores Park', 'Dolores Street Stroll', 'Castro District Walk', 'Noe Valley Loop', 'Glen Canyon Park',
    'Bernal Heights Hill', 'McLaren Park', 'Candlestick Point', 'Bayview Hill', 'Hunters Point',
    'Potrero Hill', 'Dogpatch Walk', 'SOMA Stroll', 'Financial District', 'Chinatown Alleyways',
    'North Beach Walk', 'Russian Hill', 'Telegraph Hill', 'Nob Hill', 'Pacific Heights',
    'Marina District', 'Cow Hollow', 'Presidio Heights', 'Richmond District', 'Sunset District',
    'West Portal', 'Stonestown', 'Lake Merced', 'Stern Grove', 'Mount Sutro',
    'Tank Hill', 'Kite Hill', 'Corona Heights', 'Buena Vista', 'Alamo Square',
    'Hayes Valley', 'Fillmore District', 'Japantown', 'Western Addition', 'Tenderloin',
    'Civic Center', 'Union Square', 'SOMA', 'Mission Bay', 'Dogpatch',
    'Potrero Hill', 'Bayview', 'Hunters Point', 'Visitacion Valley', 'Excelsior',
    'Outer Mission', 'Glen Park', 'Diamond Heights', 'Twin Peaks', 'Castro',
    'Noe Valley', 'Mission', 'Bernal Heights', 'Potrero Hill', 'Dogpatch',
    'SOMA', 'Financial District', 'Chinatown', 'North Beach', 'Russian Hill',
    'Telegraph Hill', 'Nob Hill', 'Pacific Heights', 'Marina', 'Cow Hollow',
    'Presidio Heights', 'Richmond', 'Sunset', 'West Portal', 'Stonestown',
    'Lake Merced', 'Stern Grove', 'Mount Sutro', 'Tank Hill', 'Kite Hill',
    'Corona Heights', 'Buena Vista', 'Alamo Square', 'Hayes Valley', 'Fillmore'
  ];

  const descriptions = [
    'A scenic trail with beautiful views of the city skyline and bay.',
    'Perfect for a morning jog with gentle inclines and well-maintained paths.',
    'Challenging hike with rewarding panoramic views at the summit.',
    'Family-friendly trail suitable for all skill levels and ages.',
    'Urban walk through historic neighborhoods with local charm.',
    'Coastal trail with ocean views and refreshing sea breezes.',
    'Forest trail through native trees and peaceful surroundings.',
    'City walk showcasing architectural highlights and local culture.',
    'Mountain trail with elevation gain and stunning vistas.',
    'Riverside path perfect for cycling and leisurely strolls.'
  ];

  const difficulties = ['easy', 'moderate', 'hard'];
  const tagOptions = ['scenic', 'family-friendly', 'paved', 'dirt', 'challenging', 'coastal', 'forest', 'urban', 'historic', 'dog-friendly'];

  return Array.from({ length: 100 }, (_, index) => ({
    id: `trail-${index + 1}`,
    name: trailNames[index % trailNames.length],
    description: descriptions[index % descriptions.length],
    distance: Math.round((Math.random() * 15 + 0.5) * 10) / 10, // 0.5 to 15.5 km
    elevation: Math.round(Math.random() * 1000 + 50), // 50 to 1050m
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    tags: tagOptions.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1),
    photos: [
      {
        id: `photo-${index + 1}`,
        url: `https://picsum.photos/800/600?random=${index + 1}`,
        isPrimary: true,
      }
    ],
    location: {
      type: 'Point' as const,
      coordinates: [
        -122.4 + (Math.random() - 0.5) * 0.2, // San Francisco area
        37.7 + (Math.random() - 0.5) * 0.2
      ] as [number, number],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

const sampleTrails = generateSampleTrails();

export const CardDemo: React.FC = () => {
  const [currentTrailIndex, setCurrentTrailIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);

  const currentTrail = sampleTrails[currentTrailIndex];

  const handleSwipeLeft = () => {
    setSwipeCount(prev => prev + 1);
    setCurrentTrailIndex(prev => (prev + 1) % sampleTrails.length);
    console.log('Swiped left on:', currentTrail.name);
  };

  const handleSwipeRight = () => {
    setSwipeCount(prev => prev + 1);
    setCurrentTrailIndex(prev => (prev + 1) % sampleTrails.length);
    console.log('Swiped right on:', currentTrail.name);
  };

  const handleSwipeUp = () => {
    setSwipeCount(prev => prev + 1);
    setCurrentTrailIndex(prev => (prev + 1) % sampleTrails.length);
    console.log('Swiped up on:', currentTrail.name);
  };

  const handleTap = () => {
    console.log('Tapped on:', currentTrail.name);
  };

  const handleLongPress = () => {
    console.log('Long pressed on:', currentTrail.name);
  };

  return (
    <View style={styles.container}>
      {/* 3D Card */}
      <View style={styles.cardContainer}>
        {currentTrail && (
          <SimpleSwipeCard
            key={currentTrail.id}
            trail={currentTrail}
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
    backgroundColor: '#1a1a1a',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
