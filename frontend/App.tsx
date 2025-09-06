import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { TrailDiscoveryScreen } from './src/screens/TrailDiscoveryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { CardDemo } from './src/components/CardDemo';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="CardDemo">
          <Stack.Screen 
            name="CardDemo" 
            component={CardDemo}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="TrailDiscovery" 
            component={TrailDiscoveryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Friends" 
            component={FriendsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Matches" 
            component={MatchesScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}