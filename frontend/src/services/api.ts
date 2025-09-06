import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  Trail, 
  Swipe, 
  Match, 
  Friendship, 
  LoginCredentials, 
  RegisterData,
  UserPreferences,
  PaginatedResponse
} from '../types';

const API_BASE_URL = 'http://localhost:3001'; // Backend URL

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('=== API Request Debug ===');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Token present:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'None');
      console.log('========================');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set');
      } else {
        console.log('No token found - request will fail');
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string }> = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response: AxiosResponse<{ user: User; token: string }> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: Partial<Profile>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put('/auth/me', data);
    return response.data;
  }

  // Trails endpoints
  async getTrailCards(params?: {
    page?: number;
    limit?: number;
    maxDistance?: number;
    difficulty?: string[];
    tags?: string[];
    elevation?: string;
  }): Promise<PaginatedResponse<Trail>> {
    const response: AxiosResponse<PaginatedResponse<Trail>> = await this.api.get('/trails/cards', { params });
    return response.data;
  }

  async getTrailById(trailId: string): Promise<Trail> {
    const response: AxiosResponse<Trail> = await this.api.get(`/trails/${trailId}`);
    return response.data;
  }

  async getSavedTrails(): Promise<{ trails: Trail[] }> {
    const response: AxiosResponse<{ trails: Trail[] }> = await this.api.get('/trails/saved');
    return response.data;
  }

  // Swipes endpoints
  async createSwipe(data: {
    trailId: string;
    direction: 'left' | 'right' | 'up';
  }): Promise<Swipe & { match?: Match }> {
    const response: AxiosResponse<Swipe & { match?: Match }> = await this.api.post('/swipes', data);
    return response.data;
  }

  async getSwipes(): Promise<{ swipes: Swipe[] }> {
    const response: AxiosResponse<{ swipes: Swipe[] }> = await this.api.get('/swipes');
    return response.data;
  }

  async clearSwipes(): Promise<{ message: string; cleared: number; remaining: number }> {
    const response: AxiosResponse<{ message: string; cleared: number; remaining: number }> = await this.api.post('/swipes/clear');
    return response.data;
  }

  // Matches endpoints
  async getMatches(): Promise<{ matches: Match[] }> {
    const response: AxiosResponse<{ matches: Match[] }> = await this.api.get('/matches');
    return response.data;
  }

  // Friends endpoints
  async inviteFriend(friendEmail: string): Promise<Friendship> {
    const response: AxiosResponse<Friendship> = await this.api.post('/friends/invite', { friendEmail });
    return response.data;
  }

  async acceptFriend(friendshipId: string): Promise<Friendship> {
    const response: AxiosResponse<Friendship> = await this.api.post('/friends/accept', { friendshipId });
    return response.data;
  }

  async declineFriend(friendshipId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/friends/decline', { friendshipId });
    return response.data;
  }

  async getFriends(): Promise<{ friends: Friendship[]; pendingRequests: Friendship[] }> {
    const response: AxiosResponse<{ friends: Friendship[]; pendingRequests: Friendship[] }> = await this.api.get('/friends');
    return response.data;
  }

  async getFriendRequests(): Promise<{ requests: Friendship[] }> {
    const response: AxiosResponse<{ requests: Friendship[] }> = await this.api.get('/friends/requests');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
