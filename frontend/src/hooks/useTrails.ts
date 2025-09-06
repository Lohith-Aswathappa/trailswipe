import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Trail } from '../types';

const TRAIL_KEYS = {
  cards: (params?: any) => ['trails', 'cards', params] as const,
  detail: (id: string) => ['trails', 'detail', id] as const,
  saved: ['trails', 'saved'] as const,
};

export const useTrailCards = (params?: {
  page?: number;
  limit?: number;
  maxDistance?: number;
  difficulty?: string[];
  tags?: string[];
  elevation?: string;
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: TRAIL_KEYS.cards(params),
    queryFn: () => apiService.getTrailCards(params),
    enabled: enabled,
  });
};

export const useTrailDetail = (trailId: string) => {
  return useQuery({
    queryKey: TRAIL_KEYS.detail(trailId),
    queryFn: () => apiService.getTrailById(trailId),
    enabled: !!trailId,
  });
};

export const useSavedTrails = () => {
  return useQuery({
    queryKey: TRAIL_KEYS.saved,
    queryFn: () => apiService.getSavedTrails(),
  });
};

export const useSwipeTrail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      trailId: string;
      direction: 'left' | 'right' | 'up';
    }) => {
      console.log('useSwipeTrail - attempting swipe:', data);
      try {
        const result = await apiService.createSwipe(data);
        console.log('useSwipeTrail - swipe successful:', result);
        return result;
      } catch (error) {
        // Check if it's a duplicate swipe error first
        if (error.response?.data?.error === 'Already swiped on this trail') {
          console.log('useSwipeTrail - duplicate swipe detected (normal behavior)');
          throw error; // Still throw to be handled by component
        }
        
        console.error('useSwipeTrail - swipe failed:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate trail cards to refresh the deck
      queryClient.invalidateQueries({ queryKey: ['trails', 'cards'] });
      
      // If it was a right swipe, invalidate saved trails
      if (variables.direction === 'right') {
        queryClient.invalidateQueries({ queryKey: TRAIL_KEYS.saved });
      }
    },
  });
};
