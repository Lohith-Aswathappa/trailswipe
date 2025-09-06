import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { getPrismaClient, isDatabaseReady, getMockDatabase } from '../utils/database';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    // Check if database is available
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database for testing
      const mockDb = getMockDatabase();
      
      // Verify user still exists in database
      const user = await mockDb.findUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = { id: user.id, email: user.email };
      return next();
    }

    // Use real database
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
