import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { LoginCredentials, RegisterData, User, UserPreferences } from '../types';

const AUTH_KEYS = {
  profile: ['auth', 'profile'] as const,
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current user profile
  const { data: user, isLoading: isProfileLoading } = useQuery({
    queryKey: AUTH_KEYS.profile,
    queryFn: apiService.getProfile,
    enabled: isInitialized, // Enable after we've checked for stored data
  });

  // Check for stored user data on app startup
  useEffect(() => {
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user_data');
        const storedToken = await AsyncStorage.getItem('auth_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          queryClient.setQueryData(AUTH_KEYS.profile, userData);
          console.log('Found stored user data:', userData);
        } else {
          console.log('No stored user data found');
        }
      } catch (error) {
        console.log('Error checking stored user:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    checkStoredUser();
  }, [queryClient]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { user, token } = await apiService.login(credentials);
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return { user, token };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.profile, data.user);
      console.log('Login successful, user data set:', data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const { user, token } = await apiService.register(data);
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return { user, token };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.profile, data.user);
      console.log('Registration successful, user data set:', data.user);
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserPreferences>) => {
      const updatedUser = await apiService.updateProfile(data);
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(AUTH_KEYS.profile, updatedUser);
    },
  });

  // Logout function
  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
    queryClient.clear();
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading: !isInitialized || isProfileLoading || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
};
