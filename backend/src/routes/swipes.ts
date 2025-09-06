import { Router, Request, Response } from 'express';
import { getPrismaClient, isDatabaseReady, getMockDatabase } from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Validation schema for swipe data
const swipeSchema = z.object({
  trailId: z.string().min(1, 'Trail ID is required'),
  direction: z.enum(['left', 'right', 'up'], {
    errorMap: () => ({ message: 'Direction must be left, right, or up' })
  })
});

// POST /swipes - Record a swipe
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('=== Swipe Request Debug ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', req.body);
    console.log('========================');
    
    // Validate request body
    const { trailId, direction } = swipeSchema.parse(req.body);

    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      // Check if trail exists
      const trail = await mockDb.findTrailById(trailId);
      console.log('Looking for trail ID:', trailId);
      console.log('Available trail IDs:', mockDb.trails.map(t => t.id));
      console.log('Trail found:', !!trail);
      
      if (!trail) {
        return res.status(404).json({ error: 'Trail not found' });
      }

      // Check if user already swiped on this trail
      const existingSwipes = await mockDb.findSwipesByUser(req.user!.id);
      const alreadySwiped = existingSwipes.some(swipe => swipe.trailId === trailId);
      
      console.log('User existing swipes:', existingSwipes.map(s => ({ trailId: s.trailId, direction: s.direction })));
      console.log('Already swiped on this trail:', alreadySwiped);
      
      if (alreadySwiped) {
        return res.status(400).json({ error: 'Already swiped on this trail' });
      }

      // Create swipe
      const swipe = await mockDb.createSwipe({
        userId: req.user!.id,
        trailId,
        direction
      });

      // Check for potential matches if this is a right swipe
      let match = null;
      if (direction === 'right') {
        // Find other users who swiped right on the same trail
        const allSwipes = await mockDb.findAllSwipes();
        const rightSwipesOnSameTrail = allSwipes.filter(s => 
          s.trailId === trailId && 
          s.direction === 'right' && 
          s.userId !== req.user!.id
        );

        // Check if any of these users are friends with the current user
        for (const otherSwipe of rightSwipesOnSameTrail) {
          const areFriends = await mockDb.areFriends(req.user!.id, otherSwipe.userId);
          if (areFriends) {
            // Check if match already exists
            const existingMatch = await mockDb.findMatchByUsersAndTrail(
              req.user!.id, 
              otherSwipe.userId, 
              trailId
            );
            
            if (!existingMatch) {
              // Create match
              match = await mockDb.createMatch({
                userId1: req.user!.id,
                userId2: otherSwipe.userId,
                trailId
              });
              break; // Only create one match per swipe
            }
          }
        }
      }

      const response: any = {
        id: swipe.id,
        trailId: swipe.trailId,
        direction: swipe.direction,
        createdAt: swipe.createdAt
      };

      if (match) {
        response.match = {
          id: match.id,
          trailId: match.trailId,
          createdAt: match.createdAt
        };
      }

      return res.status(201).json(response);
    }

    // Use real database (implementation for when DB is available)
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid swipe data' });
    }
    console.error('Create swipe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /swipes/clear - Clear user's swipes (for testing)
router.post('/clear', authenticateToken, async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      // Remove all swipes for this user
      const beforeCount = mockDb.swipes.length;
      mockDb.swipes = mockDb.swipes.filter(swipe => swipe.userId !== req.user!.id);
      const afterCount = mockDb.swipes.length;
      
      return res.json({ 
        message: 'Swipes cleared successfully',
        cleared: beforeCount - afterCount,
        remaining: afterCount
      });
    }
    
    // Real database implementation would go here
    res.status(501).json({ error: 'Not implemented for real database' });
  } catch (error) {
    console.error('Error clearing swipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /swipes - Get user's swipe history
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      const swipes = await mockDb.findSwipesByUser(req.user!.id);
      
      return res.json({
        swipes: swipes.map(swipe => ({
          id: swipe.id,
          trailId: swipe.trailId,
          direction: swipe.direction,
          createdAt: swipe.createdAt
        }))
      });
    }

    // Use real database
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    console.error('Get swipes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as swipesRoutes };
