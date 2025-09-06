import { PrismaClient } from '@prisma/client';
import { mockDatabase } from './mockDatabase';

let prisma: PrismaClient | null = null;
let isDatabaseAvailable = false;

export function getPrismaClient(): PrismaClient | null {
  if (prisma) {
    return prisma;
  }

  try {
    // Set a default DATABASE_URL for testing if not provided
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/trailswipe_test';
    }

    prisma = new PrismaClient();
    return prisma;
  } catch (error) {
    console.warn('Database not available:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function testDatabaseConnection(): Promise<boolean> {
  const client = getPrismaClient();
  if (!client) {
    return false;
  }

  try {
    await client.$queryRaw`SELECT 1`;
    isDatabaseAvailable = true;
    return true;
  } catch (error) {
    console.warn('Database connection test failed:', error instanceof Error ? error.message : 'Unknown error');
    isDatabaseAvailable = false;
    return false;
  }
}

export function isDatabaseReady(): boolean {
  return isDatabaseAvailable;
}

export function getMockDatabase() {
  return mockDatabase;
}
