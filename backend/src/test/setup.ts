import { getPrismaClient, getMockDatabase, testDatabaseConnection } from '../utils/database';

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/trailswipe_test';
  
  // Test database connection
  await testDatabaseConnection();
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(async () => {
  // Clean database before each test
  try {
    const prisma = getPrismaClient();
    if (prisma) {
      await prisma.match.deleteMany();
      await prisma.swipe.deleteMany();
      await prisma.friendship.deleteMany();
      await prisma.photo.deleteMany();
      await prisma.trail.deleteMany();
      await prisma.profile.deleteMany();
      await prisma.user.deleteMany();
      await prisma.$disconnect();
    }
  } catch (error) {
    // If database is not available, skip cleanup
    console.warn('Database not available for test cleanup:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Always clear mock database and reinitialize sample data
  const mockDb = getMockDatabase();
  mockDb.clear();
  mockDb.initializeSampleData();
});
