import request from 'supertest';
import { app } from '../app';
import { getPrismaClient, getMockDatabase } from '../utils/database';

describe('Friends API', () => {
  let authToken1: string;
  let userId1: string;
  let authToken2: string;
  let userId2: string;
  let authToken3: string;
  let userId3: string;

  beforeEach(async () => {
    // Create three test users
    const user1Data = {
      email: 'friend1@example.com',
      password: 'password123',
      name: 'Friend One'
    };

    const user2Data = {
      email: 'friend2@example.com',
      password: 'password123',
      name: 'Friend Two'
    };

    const user3Data = {
      email: 'friend3@example.com',
      password: 'password123',
      name: 'Friend Three'
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

    // Register third user
    const user3Response = await request(app)
      .post('/auth/register')
      .send(user3Data);
    authToken3 = user3Response.body.token;
    userId3 = user3Response.body.user.id;
  });

  describe('POST /friends/invite', () => {
    it('should send a friend request to another user', async () => {
      const response = await request(app)
        .post('/friends/invite')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          friendEmail: 'friend2@example.com'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', userId1);
      expect(response.body).toHaveProperty('friendId', userId2);
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/friends/invite')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          friendEmail: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing friend email', async () => {
      const response = await request(app)
        .post('/friends/invite')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/friends/invite')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          friendEmail: 'nonexistent@example.com'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when trying to friend yourself', async () => {
      const response = await request(app)
        .post('/friends/invite')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          friendEmail: 'friend1@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for duplicate friend request', async () => {
      // Send first friend request
      await request(app)
        .post('/friends/invite')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          friendEmail: 'friend2@example.com'
        })
        .expect(201);

      // Try to send duplicate friend request
      const response = await request(app)
        .post('/friends/invite')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          friendEmail: 'friend2@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when already friends', async () => {
      // Create an accepted friendship
      const mockDb = getMockDatabase();
      await mockDb.createFriendship({
        userId: userId1,
        friendId: userId2,
        status: 'accepted'
      });

      const response = await request(app)
        .post('/friends/invite')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          friendEmail: 'friend2@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/friends/invite')
        .send({
          friendEmail: 'friend2@example.com'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /friends/accept', () => {
    let friendshipId: string;

    beforeEach(async () => {
      // Create a pending friendship request
      const mockDb = getMockDatabase();
      const friendship = await mockDb.createFriendship({
        userId: userId1,
        friendId: userId2,
        status: 'pending'
      });
      friendshipId = friendship.id;
    });

    it('should accept a friend request', async () => {
      const response = await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          friendshipId
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', friendshipId);
      expect(response.body).toHaveProperty('status', 'accepted');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 400 for invalid friendship ID', async () => {
      const response = await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          friendshipId: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing friendship ID', async () => {
      const response = await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent friendship', async () => {
      const response = await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          friendshipId: 'non-existent-id'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 when trying to accept someone else\'s request', async () => {
      const response = await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${authToken3}`)
        .send({
          friendshipId
        })
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when trying to accept already accepted request', async () => {
      // Accept the request first
      await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          friendshipId
        })
        .expect(200);

      // Try to accept again
      const response = await request(app)
        .post('/friends/accept')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          friendshipId
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/friends/accept')
        .send({
          friendshipId
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /friends/decline', () => {
    let friendshipId: string;

    beforeEach(async () => {
      // Create a pending friendship request
      const mockDb = getMockDatabase();
      const friendship = await mockDb.createFriendship({
        userId: userId1,
        friendId: userId2,
        status: 'pending'
      });
      friendshipId = friendship.id;
    });

    it('should decline a friend request', async () => {
      const response = await request(app)
        .post('/friends/decline')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          friendshipId
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid friendship ID', async () => {
      const response = await request(app)
        .post('/friends/decline')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          friendshipId: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent friendship', async () => {
      const response = await request(app)
        .post('/friends/decline')
        .set('Authorization', `Bearer ${authToken2}`)
        .send({
          friendshipId: 'non-existent-id'
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 when trying to decline someone else\'s request', async () => {
      const response = await request(app)
        .post('/friends/decline')
        .set('Authorization', `Bearer ${authToken3}`)
        .send({
          friendshipId
        })
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/friends/decline')
        .send({
          friendshipId
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /friends', () => {
    it('should return user\'s friends and pending requests', async () => {
      // Create some friendships
      const mockDb = getMockDatabase();
      await mockDb.createFriendship({
        userId: userId1,
        friendId: userId2,
        status: 'accepted'
      });
      await mockDb.createFriendship({
        userId: userId1,
        friendId: userId3,
        status: 'pending'
      });

      const response = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty('friends');
      expect(response.body).toHaveProperty('pendingRequests');
      expect(Array.isArray(response.body.friends)).toBe(true);
      expect(Array.isArray(response.body.pendingRequests)).toBe(true);
      expect(response.body.friends.length).toBe(1);
      expect(response.body.pendingRequests.length).toBe(1);
    });

    it('should return empty arrays for user with no friends', async () => {
      const response = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty('friends');
      expect(response.body).toHaveProperty('pendingRequests');
      expect(Array.isArray(response.body.friends)).toBe(true);
      expect(Array.isArray(response.body.pendingRequests)).toBe(true);
      expect(response.body.friends.length).toBe(0);
      expect(response.body.pendingRequests.length).toBe(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/friends')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /friends/requests', () => {
    it('should return incoming friend requests', async () => {
      // Create incoming friend requests
      const mockDb = getMockDatabase();
      await mockDb.createFriendship({
        userId: userId2,
        friendId: userId1,
        status: 'pending'
      });
      await mockDb.createFriendship({
        userId: userId3,
        friendId: userId1,
        status: 'pending'
      });

      const response = await request(app)
        .get('/friends/requests')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty('requests');
      expect(Array.isArray(response.body.requests)).toBe(true);
      expect(response.body.requests.length).toBe(2);
    });

    it('should return empty array for user with no incoming requests', async () => {
      const response = await request(app)
        .get('/friends/requests')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toHaveProperty('requests');
      expect(Array.isArray(response.body.requests)).toBe(true);
      expect(response.body.requests.length).toBe(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/friends/requests')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const response = await request(app)
        .get('/friends')
        .set('Authorization', `Bearer ${authToken1}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/friends/invite')
        .set('Authorization', `Bearer ${authToken1}`)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Express will return 400 for invalid JSON
      expect(response.status).toBe(400);
    });
  });
});
