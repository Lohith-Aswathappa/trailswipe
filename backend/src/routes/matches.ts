import { Router, Request, Response } from 'express';
import { getPrismaClient, isDatabaseReady, getMockDatabase } from '../utils/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /matches - Get user's matches
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      const matches = await mockDb.findMatchesByUser(req.user!.id);
      
      return res.json({
        matches: matches.map(match => ({
          id: match.id,
          trailId: match.trailId,
          otherUserId: match.userId1 === req.user!.id ? match.userId2 : match.userId1,
          createdAt: match.createdAt
        }))
      });
    }

    // Use real database (implementation for when DB is available)
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as matchesRoutes };
