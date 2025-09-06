import { Router, Request, Response } from 'express';
import { 
  registerSchema, 
  loginSchema, 
  updateProfileSchema,
  hashPassword, 
  verifyPassword, 
  generateToken 
} from '../utils/auth';
import { authenticateToken } from '../middleware/auth';
import { getPrismaClient, isDatabaseReady, getMockDatabase } from '../utils/database';

const router = Router();

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name } = validatedData;

    // Check if database is available
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database for testing
      const mockDb = getMockDatabase();
      
      // Check if user already exists
      const existingUser = await mockDb.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await mockDb.createUser({
        email,
        password: hashedPassword,
        name,
        preferences: {
          difficulty: ['easy', 'moderate'],
          maxDistance: 10,
          elevation: 'any',
          tags: []
        }
      });

      // Generate JWT token
      const token = generateToken(user.id);

      // Return user data (without password) and token
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json({
        token,
        user: userWithoutPassword
      });
    }

    // Use real database
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            name,
            preferences: {
              difficulty: ['easy', 'moderate'],
              maxDistance: 10,
              elevation: 'any',
              tags: []
            }
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Check if database is available
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database for testing
      const mockDb = getMockDatabase();
      
      // Find user by email
      const user = await mockDb.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(user.password, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      // Return user data (without password) and token
      const { password: _, ...userWithoutPassword } = user;
      return res.json({
        token,
        user: userWithoutPassword
      });
    }

    // Use real database
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(user.password, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if database is available
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database for testing
      const mockDb = getMockDatabase();
      
      const user = await mockDb.findUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }

    // Use real database
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /me
router.put('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = updateProfileSchema.parse(req.body);

    // Check if database is available
    const prisma = getPrismaClient();
    const isDbReady = isDatabaseReady();
    
    if (!prisma || !isDbReady) {
      // Use mock database for testing
      const mockDb = getMockDatabase();
      
      // Update user profile
      const updatedUser = await mockDb.updateUserProfile(req.user!.id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return updated user data without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.json(userWithoutPassword);
    }

    // Use real database
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        profile: {
          update: validatedData
        }
      },
      include: {
        profile: true
      }
    });

    // Return updated user data without password
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as authRoutes };
