// User types
export interface User {
  id: string;
  email: string;
  name: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  preferences: UserPreferences;
  location?: Location;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  difficulty: string[];
  maxDistance: number;
  elevation: string;
  tags: string[];
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Trail types
export interface Trail {
  id: string;
  name: string;
  description: string;
  distance: number;
  elevation: number;
  difficulty: string;
  tags: string[];
  location: Location;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  trailId: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  createdAt: string;
}

// Swipe types
export interface Swipe {
  id: string;
  userId: string;
  trailId: string;
  direction: 'left' | 'right' | 'up';
  createdAt: string;
}

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  trailId: string;
  createdAt: string;
}

// Friendship types
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Navigation types
export interface RootStackParamList {
  Onboarding: undefined;
  Main: undefined;
  TrailDetail: { trailId: string };
  Profile: undefined;
  Friends: undefined;
  Matches: undefined;
}

// Swipe deck types
export interface SwipeCardProps {
  trail: Trail;
  onSwipeLeft: (trailId: string) => void;
  onSwipeRight: (trailId: string) => void;
  onSwipeUp: (trailId: string) => void;
}

export interface SwipeDeckProps {
  trails: Trail[];
  onSwipeLeft: (trailId: string) => void;
  onSwipeRight: (trailId: string) => void;
  onSwipeUp: (trailId: string) => void;
  onEmpty: () => void;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// API Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}
