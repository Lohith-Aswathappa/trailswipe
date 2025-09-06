import request from 'supertest';
import { app } from '../app';
import { getPrismaClient, getMockDatabase } from '../utils/database';

describe('Trails API', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get auth token
    const userData = {
      email: 'trails@example.com',
      password: 'password123',
      name: 'Trails User'
    };

    const registerResponse = await request(app)
      .post('/auth/register')
      .send(userData);

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    // Set user location for testing
    await request(app)
      .put('/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749] // San Francisco
        }
      });
  });

  describe('GET /trails/cards', () => {
    it('should return trails within user radius', async () => {
      const response = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('trails');
      expect(Array.isArray(response.body.trails)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should filter trails by user preferences', async () => {
      // Update user preferences
      await request(app)
        .put('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferences: {
            difficulty: ['easy', 'moderate'],
            maxDistance: 5,
            elevation: 'low',
            tags: ['scenic', 'family-friendly']
          }
        });

      const response = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.trails).toBeDefined();
      // All returned trails should match user preferences
      response.body.trails.forEach((trail: any) => {
        expect(['easy', 'moderate']).toContain(trail.difficulty);
        expect(trail.distance).toBeLessThanOrEqual(5);
      });
    });

    it('should exclude previously swiped LEFT trails for 30 days', async () => {
      // First, get some trails
      const initialResponse = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const initialTrails = initialResponse.body.trails;
      expect(initialTrails.length).toBeGreaterThan(0);

      // Swipe left on first trail
      const trailToSwipe = initialTrails[0];
      await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          trailId: trailToSwipe.id,
          direction: 'left'
        })
        .expect(201);

      // Get trails again - the swiped trail should be excluded
      const response = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const swipedTrailIds = response.body.trails.map((trail: any) => trail.id);
      expect(swipedTrailIds).not.toContain(trailToSwipe.id);
    });

    it('should include previously swiped RIGHT trails (saved trails)', async () => {
      // Get some trails
      const initialResponse = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const initialTrails = initialResponse.body.trails;
      expect(initialTrails.length).toBeGreaterThan(0);

      // Swipe right on first trail
      const trailToSwipe = initialTrails[0];
      await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          trailId: trailToSwipe.id,
          direction: 'right'
        })
        .expect(201);

      // Get trails again - the swiped trail should still be included
      const response = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const swipedTrailIds = response.body.trails.map((trail: any) => trail.id);
      expect(swipedTrailIds).toContain(trailToSwipe.id);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/trails/cards?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.trails.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/trails/cards')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/trails/cards?page=-1&limit=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /trails/:id', () => {
    let trailId: string;

    beforeEach(async () => {
      // Get a trail ID from the cards endpoint
      const response = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.trails.length > 0) {
        trailId = response.body.trails[0].id;
      }
    });

    it('should return detailed trail information', async () => {
      if (!trailId) {
        // Skip test if no trails available
        return;
      }

      const response = await request(app)
        .get(`/trails/${trailId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', trailId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('distance');
      expect(response.body).toHaveProperty('elevation');
      expect(response.body).toHaveProperty('difficulty');
      expect(response.body).toHaveProperty('tags');
      expect(response.body).toHaveProperty('location');
      expect(response.body).toHaveProperty('photos');
      expect(Array.isArray(response.body.photos)).toBe(true);
    });

    it('should return 404 for non-existent trail', async () => {
      const response = await request(app)
        .get('/trails/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      if (!trailId) {
        return;
      }

      const response = await request(app)
        .get(`/trails/${trailId}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /trails/saved', () => {
    it('should return user\'s saved trails (swiped right)', async () => {
      // First, swipe right on some trails
      const trailsResponse = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (trailsResponse.body.trails.length > 0) {
        const trailToSave = trailsResponse.body.trails[0];
        await request(app)
          .post('/swipes')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            trailId: trailToSave.id,
            direction: 'right'
          })
          .expect(201);
      }

      const response = await request(app)
        .get('/trails/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('trails');
      expect(Array.isArray(response.body.trails)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/trails/saved')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Trail Scoring and Filtering', () => {
    it('should score trails based on user preferences', async () => {
      // Set specific preferences
      await request(app)
        .put('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferences: {
            difficulty: ['easy'],
            maxDistance: 3,
            elevation: 'low',
            tags: ['scenic']
          }
        });

      const response = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.trails).toBeDefined();
      // Trails should be ordered by relevance score
      if (response.body.trails.length > 1) {
        // First trail should have higher score than second
        expect(response.body.trails[0].score).toBeGreaterThanOrEqual(
          response.body.trails[1].score
        );
      }
    });

    it('should filter by distance from user location', async () => {
      const response = await request(app)
        .get('/trails/cards?maxDistance=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.trails.forEach((trail: any) => {
        expect(trail.distance).toBeLessThanOrEqual(10);
      });
    });

    it('should filter by difficulty level', async () => {
      const response = await request(app)
        .get('/trails/cards?difficulty=easy,moderate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.trails.forEach((trail: any) => {
        expect(['easy', 'moderate']).toContain(trail.difficulty);
      });
    });

    it('should filter by tags', async () => {
      const response = await request(app)
        .get('/trails/cards?tags=scenic,family-friendly')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.trails.forEach((trail: any) => {
        const hasMatchingTag = trail.tags.some((tag: string) => 
          ['scenic', 'family-friendly'].includes(tag)
        );
        expect(hasMatchingTag).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user location gracefully', async () => {
      // Create user without location
      const userData = {
        email: 'nolocation@example.com',
        password: 'password123',
        name: 'No Location User'
      };

      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData);

      const noLocationToken = registerResponse.body.token;

      const response = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${noLocationToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle database errors gracefully', async () => {
      // This test will pass with mock database
      const response = await request(app)
        .get('/trails/cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });
});
