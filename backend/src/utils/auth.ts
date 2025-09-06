import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  preferences: z.object({
    difficulty: z.array(z.string()).optional(),
    maxDistance: z.number().optional(),
    elevation: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.array(z.number()).length(2)
  }).optional()
});

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

// Password verification
export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
  return await argon2.verify(hashedPassword, password);
}

// JWT token generation
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// JWT token verification
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}
