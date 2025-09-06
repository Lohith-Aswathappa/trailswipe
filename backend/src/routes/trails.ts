import { Router, Request, Response } from 'express';
import { getPrismaClient, isDatabaseReady, getMockDatabase } from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { 
  trailsQuerySchema, 
  trailIdSchema,
  calculateTrailScore,
  filterTrails,
  sortTrailsByScore,
  paginateResults
} from '../utils/trails';

const router = Router();

// GET /trails/cards - Get trail cards for swiping
router.get('/cards', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const queryParams = trailsQuerySchema.parse(req.query);
    const { page, limit, maxDistance, difficulty, tags, elevation } = queryParams;

    // Get user profile with location and preferences
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    let userProfile: any;
    let swipedTrails: string[] = [];

    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      // Initialize sample data if not already done
      if (!mockDb.isSampleDataInitialized()) {
        mockDb.initializeSampleData();
      }

      // Get user profile
      const user = await mockDb.findUserById(req.user!.id);
      if (!user || !user.profile) {
        return res.status(400).json({ error: 'User profile not found. Please set your location.' });
      }

      userProfile = user.profile;
      
      // Check if user has location set
      if (!userProfile.location) {
        return res.status(400).json({ error: 'User location not set. Please set your location to discover trails.' });
      }
      
      // Get swiped trails
      const swipes = await mockDb.findSwipesByUser(req.user!.id);
      swipedTrails = swipes
        .filter(swipe => swipe.direction === 'left')
        .map(swipe => swipe.trailId);

      // Get trails excluding swiped left ones
      let trails = await mockDb.findTrailsExcludingSwiped(req.user!.id, 'left');
      
      // Apply filters
      const filters = { maxDistance, difficulty, tags, elevation };
      trails = filterTrails(trails, filters, userProfile.location);
      
      // Calculate scores
      trails = trails.map(trail => ({
        ...trail,
        score: calculateTrailScore(trail, userProfile.preferences, userProfile.location)
      }));
      
      // Sort by score
      trails = sortTrailsByScore(trails);
      
      // Paginate results
      const result = paginateResults(trails, page, limit);
      
      return res.json({
        trails: result.items,
        pagination: result.pagination
      });
    }

    // Use real database (implementation for when DB is available)
    // This would be implemented with Prisma queries
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    if (error instanceof Error && (error.name === 'ZodError' || error.message.includes('must be greater than'))) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
    console.error('Get trail cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /trails/saved - Get user's saved trails (swiped right)
router.get('/saved', authenticateToken, async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      // Initialize sample data if not already done
      if (!mockDb.isSampleDataInitialized()) {
        mockDb.initializeSampleData();
      }

      const savedTrails = await mockDb.findSavedTrails(req.user!.id);
      
      return res.json({
        trails: savedTrails
      });
    }

    // Use real database
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    console.error('Get saved trails error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /trails/:id - Get detailed trail information
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Validate trail ID
    const { id } = trailIdSchema.parse(req.params);

    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      // Initialize sample data if not already done
      if (!mockDb.isSampleDataInitialized()) {
        mockDb.initializeSampleData();
      }

      const trail = await mockDb.findTrailById(id);
      if (!trail) {
        return res.status(404).json({ error: 'Trail not found' });
      }

      return res.json(trail);
    }

    // Use real database
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid trail ID' });
    }
    console.error('Get trail details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as trailsRoutes };
