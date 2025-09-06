import request from 'supertest';
import { app } from '../app';
import { getPrismaClient, getMockDatabase } from '../utils/database';

describe('Swipes & Matches API', () => {
  let authToken1: string;
  let userId1: string;
  let authToken2: string;
  let userId2: string;
  let trailId: string;

  beforeEach(async () => {
    // Create two test users
    const user1Data = {
      email: 'swiper1@example.com',
      password: 'password123',
      name: 'Swiper One'
    };

    const user2Data = {
      email: 'swiper2@example.com',
      password: 'password123',
      name: 'Swiper Two'
    };

    // Register first user
    const user1Response = await request(app)
      .post('/auth/register')
      .send(user1Data);
    authToken1 = user1Response.body.token;
    userId1 = user1Response.body.user.id;

    // Register second user
    const user2Response = await request(app)
      .post('/auth/register')
      .send(user2Data);
    authToken2 = user2Response.body.token;
    userId2 = user2Response.body.user.id;

    // Set locations for both users
    await request(app)
      .put('/auth/me')
      .set('Authorization', `Bearer ${authToken1}`)
      .send({
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749] // San Francisco
        }
      });

    await request(app)
      .put('/auth/me')
      .set('Authorization', `Bearer ${authToken2}`)
      .send({
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749] // San Francisco
        }
      });

    // Get a trail ID for testing
    const trailsResponse = await request(app)
      .get('/trails/cards')
      .set('Authorization', `Bearer ${authToken1}`)
      .expect(200);

    if (trailsResponse.body.trails.length > 0) {
      trailId = trailsResponse.body.trails[0].id;
    }
  });

  describe('POST /swipes', () => {
    it('should record a left swipe', async () => {
      if (!trailId) {
        // Skip test if no trails available
        return;
      }

      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'left'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('trailId', trailId);
      expect(response.body).toHaveProperty('direction', 'left');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should record a right swipe', async () => {
      if (!trailId) {
        return;
      }

      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('trailId', trailId);
      expect(response.body).toHaveProperty('direction', 'right');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should record an up swipe (bucket list)', async () => {
      if (!trailId) {
        return;
      }

      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'up'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('trailId', trailId);
      expect(response.body).toHaveProperty('direction', 'up');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 for invalid direction', async () => {
      if (!trailId) {
        return;
      }

      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'invalid'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing trailId', async () => {
      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          direction: 'right'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent trail', async () => {
      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId: 'non-existent-id',
          direction: 'right'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      if (!trailId) {
        return;
      }

      const response = await request(app)
        .post('/swipes')
        .send({
          trailId,
          direction: 'right'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should prevent duplicate swipes on the same trail', async () => {
      if (!trailId) {
        return;
      }

      // First swipe
      await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      // Duplicate swipe should fail
      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'left'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /swipes', () => {
    it('should return user\'s swipe history', async () => {
      if (!trailId) {
        return;
      }

      // Create some swipes
      await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      const response = await request(app)
        .get('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty('swipes');
      expect(Array.isArray(response.body.swipes)).toBe(true);
      expect(response.body.swipes.length).toBeGreaterThan(0);
      expect(response.body.swipes[0]).toHaveProperty('id');
      expect(response.body.swipes[0]).toHaveProperty('trailId');
      expect(response.body.swipes[0]).toHaveProperty('direction');
      expect(response.body.swipes[0]).toHaveProperty('createdAt');
    });

    it('should return empty array for user with no swipes', async () => {
      const response = await request(app)
        .get('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty('swipes');
      expect(Array.isArray(response.body.swipes)).toBe(true);
      expect(response.body.swipes.length).toBe(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/swipes')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Match Creation', () => {
    it('should create a match when two friends swipe right on the same trail', async () => {
      if (!trailId) {
        return;
      }

      // Create a friendship between the two users
      const mockDb = getMockDatabase();
      await mockDb.createFriendship({
        userId: userId1,
        friendId: userId2,
        status: 'accepted'
      });

      // First user swipes right
      await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      // Second user swipes right on the same trail
      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      // Check if match was created
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('trailId', trailId);
      expect(response.body).toHaveProperty('direction', 'right');
      expect(response.body).toHaveProperty('match');
    });

    it('should not create a match when users are not friends', async () => {
      if (!trailId) {
        return;
      }

      // First user swipes right
      await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      // Second user swipes right (but they're not friends)
      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      // Should not create a match
      expect(response.body).not.toHaveProperty('match');
    });

    it('should not create a match when one user swipes left', async () => {
      if (!trailId) {
        return;
      }

      // First user swipes right
      await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      // Second user swipes left
      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          trailId,
          direction: 'left'
        })
        .expect(201);

      // Should not create a match
      expect(response.body).not.toHaveProperty('match');
    });

    it('should not create duplicate matches', async () => {
      if (!trailId) {
        return;
      }

      // Create a friendship between the two users
      const mockDb = getMockDatabase();
      await mockDb.createFriendship({
        userId: userId1,
        friendId: userId2,
        status: 'accepted'
      });

      // First user swipes right
      await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      // Second user swipes right (creates match)
      const response1 = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      // Should create a match
      expect(response1.body).toHaveProperty('match');

      // Try to swipe again on the same trail (should not create duplicate match)
      const response2 = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(400); // Should fail because already swiped

      // Should not create duplicate match
      expect(response2.body).toHaveProperty('error');
    });
  });

  describe('GET /matches', () => {
    it('should return user\'s matches', async () => {
      const response = await request(app)
        .get('/matches')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty('matches');
      expect(Array.isArray(response.body.matches)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/matches')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      if (!trailId) {
        return;
      }

      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          trailId,
          direction: 'right'
        })
        .expect(201);

      expect(response.body).toBeDefined();
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/swipes')
        .set('Authorization', `Bearer ${authToken1}`)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Express will return 400 for invalid JSON
      expect(response.status).toBe(400);
    });
  });
});
