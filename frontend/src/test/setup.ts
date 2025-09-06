import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockMapView = (props: any) => React.createElement(View, props);
  const MockMarker = (props: any) => React.createElement(View, props);
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() => 
    Promise.resolve({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
      },
    })
  ),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() => 
    Promise.resolve({
      canceled: false,
      assets: [{
        uri: 'file://test-image.jpg',
        width: 100,
        height: 100,
      }],
    })
  ),
}));


// Mock react-native-deck-swiper
jest.mock('react-native-deck-swiper', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return React.forwardRef((props: any, ref: any) => 
    React.createElement(View, { ...props, ref })
  );
});

// Global test utilities
declare global {
  var mockNavigation: any;
  var mockRoute: any;
}

global.mockNavigation = {
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

global.mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};
