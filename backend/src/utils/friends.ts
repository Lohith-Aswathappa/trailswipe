import { z } from 'zod';

// Validation schemas
export const inviteFriendSchema = z.object({
  friendEmail: z.string().email('Invalid email format')
});

export const friendshipActionSchema = z.object({
  friendshipId: z.string().min(1, 'Friendship ID is required')
});

// Helper function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to check if users are the same
export function isSameUser(userId1: string, userId2: string): boolean {
  return userId1 === userId2;
}
