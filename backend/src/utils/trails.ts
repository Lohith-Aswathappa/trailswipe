import { z } from 'zod';

// Validation schemas
export const trailsQuerySchema = z.object({
  page: z.string().optional().transform(val => {
    const num = val ? parseInt(val, 10) : 1;
    if (num < 1) throw new Error('Page must be greater than 0');
    return num;
  }),
  limit: z.string().optional().transform(val => {
    const num = val ? parseInt(val, 10) : 20;
    if (num < 1) throw new Error('Limit must be greater than 0');
    return num;
  }),
  maxDistance: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  difficulty: z.string().optional().transform(val => val ? val.split(',') : undefined),
  tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
  elevation: z.string().optional()
});

export const trailIdSchema = z.object({
  id: z.string().min(1, 'Trail ID is required')
});

// Trail scoring algorithm
export function calculateTrailScore(trail: any, userPreferences: any, userLocation: any): number {
  let score = 0;

  // Base score
  score += 10;

  // Difficulty preference scoring
  if (userPreferences.difficulty && userPreferences.difficulty.includes(trail.difficulty)) {
    score += 20;
  }

  // Distance scoring (closer is better)
  if (userLocation && trail.distance) {
    const maxDistance = userPreferences.maxDistance || 50;
    if (trail.distance <= maxDistance) {
      score += Math.max(0, 30 - (trail.distance / maxDistance) * 30);
    }
  }

  // Tag matching scoring
  if (userPreferences.tags && trail.tags) {
    const matchingTags = trail.tags.filter((tag: string) => 
      userPreferences.tags.includes(tag)
    );
    score += matchingTags.length * 10;
  }

  // Elevation preference scoring
  if (userPreferences.elevation && trail.elevation) {
    const elevation = trail.elevation;
    const preference = userPreferences.elevation;
    
    if (preference === 'low' && elevation < 500) score += 15;
    else if (preference === 'medium' && elevation >= 500 && elevation < 1500) score += 15;
    else if (preference === 'high' && elevation >= 1500) score += 15;
  }

  // Popularity bonus (if we had view counts, etc.)
  score += 5;

  return Math.round(score);
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Filter trails based on criteria
export function filterTrails(trails: any[], filters: any, userLocation: any): any[] {
  return trails.filter(trail => {
    // Distance filter
    if (filters.maxDistance && userLocation && trail.location) {
      const distance = calculateDistance(
        userLocation.coordinates[1], // lat
        userLocation.coordinates[0], // lon
        trail.location.coordinates[1],
        trail.location.coordinates[0]
      );
      if (distance > filters.maxDistance) return false;
    }
    
    // Also check trail's distance property if available
    if (filters.maxDistance && trail.distance && trail.distance > filters.maxDistance) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(trail.difficulty)) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = trail.tags.some((tag: string) => 
        filters.tags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Elevation filter
    if (filters.elevation && trail.elevation) {
      const elevation = trail.elevation;
      if (filters.elevation === 'low' && elevation >= 500) return false;
      if (filters.elevation === 'medium' && (elevation < 500 || elevation >= 1500)) return false;
      if (filters.elevation === 'high' && elevation < 1500) return false;
    }

    return true;
  });
}

// Sort trails by score
export function sortTrailsByScore(trails: any[]): any[] {
  return trails.sort((a, b) => (b.score || 0) - (a.score || 0));
}

// Paginate results
export function paginateResults<T>(items: T[], page: number, limit: number) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    items: items.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
      hasNext: endIndex < items.length,
      hasPrev: page > 1
    }
  };
}
