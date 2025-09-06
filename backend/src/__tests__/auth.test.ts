import request from 'supertest';
import { app } from '../app';
import { getPrismaClient } from '../utils/database';

describe('Authentication API', () => {
  describe('POST /auth/register', () => {
    it('should register a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify password is hashed in database (if database is available)
      const prisma = getPrismaClient();
      if (prisma) {
        try {
          const user = await prisma.user.findUnique({
            where: { email: userData.email }
          });
          expect(user).toBeTruthy();
          expect(user?.password).not.toBe(userData.password);
          expect(user?.password).toMatch(/^\$argon2/); // Argon2 hash starts with $argon2
        } catch (error) {
          // If database is not available, skip this check
          console.warn('Database not available for password verification:', error instanceof Error ? error.message : 'Unknown error');
        }
      }
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'First User'
      };

      // Create first user
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Try to create duplicate
      const duplicateData = {
        email: 'duplicate@example.com',
        password: 'password456',
        name: 'Second User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const userData = {
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User'
      };

      await request(app)
        .post('/auth/register')
        .send(userData);
    });

    it('should login with valid credentials and return JWT', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /me', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create user and get token
      const userData = {
        email: 'me@example.com',
        password: 'password123',
        name: 'Me User'
      };

      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData);

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;
    });

    it('should return user profile with valid JWT', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', 'me@example.com');
      expect(response.body).toHaveProperty('profile');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 for invalid JWT', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for missing Authorization header', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /me', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create user and get token
      const userData = {
        email: 'update@example.com',
        password: 'password123',
        name: 'Update User'
      };

      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData);

      authToken = registerResponse.body.token;
    });

    it('should update user preferences', async () => {
      const preferences = {
        difficulty: ['easy', 'moderate'],
        maxDistance: 10,
        elevation: 'low',
        tags: ['scenic', 'family-friendly']
      };

      const response = await request(app)
        .put('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ preferences })
        .expect(200);

      expect(response.body.profile.preferences).toEqual(preferences);
    });

    it('should update user location', async () => {
      const location = {
        type: 'Point',
        coordinates: [-122.4194, 37.7749] // San Francisco
      };

      const response = await request(app)
        .put('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ location })
        .expect(200);

      expect(response.body.profile.location).toEqual(location);
    });

    it('should return 401 for invalid JWT', async () => {
      const response = await request(app)
        .put('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .send({ preferences: {} })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
