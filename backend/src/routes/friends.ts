import { Router, Request, Response } from 'express';
import { getPrismaClient, isDatabaseReady, getMockDatabase } from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { 
  inviteFriendSchema, 
  friendshipActionSchema,
  isValidEmail,
  isSameUser
} from '../utils/friends';

const router = Router();

// POST /friends/invite - Send friend request
router.post('/invite', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { friendEmail } = inviteFriendSchema.parse(req.body);

    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      // Find friend by email
      const friend = await mockDb.findUserByEmail(friendEmail);
      if (!friend) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if trying to friend yourself
      if (isSameUser(req.user!.id, friend.id)) {
        return res.status(400).json({ error: 'Cannot send friend request to yourself' });
      }

      // Check if friendship already exists
      const existingFriendship = await mockDb.findFriendship(req.user!.id, friend.id);
      if (existingFriendship) {
        if (existingFriendship.status === 'accepted') {
          return res.status(400).json({ error: 'Already friends with this user' });
        } else {
          return res.status(400).json({ error: 'Friend request already sent' });
        }
      }

      // Create friendship request
      const friendship = await mockDb.createFriendship({
        userId: req.user!.id,
        friendId: friend.id,
        status: 'pending'
      });

      return res.status(201).json({
        id: friendship.id,
        userId: friendship.userId,
        friendId: friendship.friendId,
        status: friendship.status,
        createdAt: friendship.createdAt
      });
    }

    // Use real database (implementation for when DB is available)
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /friends/accept - Accept friend request
router.post('/accept', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { friendshipId } = friendshipActionSchema.parse(req.body);

    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      // Find friendship
      const friendship = await mockDb.findFriendshipById(friendshipId);
      if (!friendship) {
        return res.status(404).json({ error: 'Friend request not found' });
      }

      // Check if user is the recipient of the request
      if (friendship.friendId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to accept this request' });
      }

      // Check if already accepted
      if (friendship.status === 'accepted') {
        return res.status(400).json({ error: 'Friend request already accepted' });
      }

      // Accept the friendship
      const updatedFriendship = await mockDb.updateFriendshipStatus(friendshipId, 'accepted');
      
      return res.status(200).json({
        id: updatedFriendship!.id,
        status: updatedFriendship!.status,
        updatedAt: updatedFriendship!.createdAt
      });
    }

    // Use real database
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /friends/decline - Decline friend request
router.post('/decline', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { friendshipId } = friendshipActionSchema.parse(req.body);

    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      // Find friendship
      const friendship = await mockDb.findFriendshipById(friendshipId);
      if (!friendship) {
        return res.status(404).json({ error: 'Friend request not found' });
      }

      // Check if user is the recipient of the request
      if (friendship.friendId !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to decline this request' });
      }

      // Decline the friendship (remove it)
      await mockDb.updateFriendshipStatus(friendshipId, 'declined');
      
      return res.status(200).json({
        message: 'Friend request declined'
      });
    }

    // Use real database
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /friends - Get user's friends and pending requests
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      const [friends, pendingRequests] = await Promise.all([
        mockDb.findAcceptedFriendships(req.user!.id),
        mockDb.findPendingFriendships(req.user!.id)
      ]);

      return res.json({
        friends: friends.map(friendship => ({
          id: friendship.id,
          friendId: friendship.userId === req.user!.id ? friendship.friendId : friendship.userId,
          status: friendship.status,
          createdAt: friendship.createdAt
        })),
        pendingRequests: pendingRequests.map(friendship => ({
          id: friendship.id,
          friendId: friendship.userId === req.user!.id ? friendship.friendId : friendship.userId,
          status: friendship.status,
          createdAt: friendship.createdAt
        }))
      });
    }

    // Use real database
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /friends/requests - Get incoming friend requests
router.get('/requests', authenticateToken, async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database
      const mockDb = getMockDatabase();
      
      const requests = await mockDb.findIncomingFriendRequests(req.user!.id);

      return res.json({
        requests: requests.map(friendship => ({
          id: friendship.id,
          userId: friendship.userId,
          status: friendship.status,
          createdAt: friendship.createdAt
        }))
      });
    }

    // Use real database
    return res.status(503).json({ error: 'Database not available' });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as friendsRoutes };
