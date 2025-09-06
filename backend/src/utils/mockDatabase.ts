// Mock database implementation for testing when real database is not available
import { hashPassword } from './auth';
import { sampleTrails } from './sampleTrails';
export interface MockUser {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id: string;
    userId: string;
    name: string;
    preferences: any;
    location?: any;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface MockTrail {
  id: string;
  name: string;
  description: string;
  distance: number;
  elevation: number;
  difficulty: string;
  tags: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  photos: MockPhoto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MockPhoto {
  id: string;
  trailId: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface MockSwipe {
  id: string;
  userId: string;
  trailId: string;
  direction: 'left' | 'right' | 'up';
  createdAt: Date;
}

export interface MockMatch {
  id: string;
  userId1: string;
  userId2: string;
  trailId: string;
  createdAt: Date;
}

export interface MockFriendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: Date;
}

class MockDatabase {
  public users: MockUser[] = [];
  public trails: MockTrail[] = [];
  public photos: MockPhoto[] = [];
  public swipes: MockSwipe[] = [];
  public matches: MockMatch[] = [];
  public friendships: MockFriendship[] = [];
  public nextId = 1;

  async findUserByEmail(email: string): Promise<MockUser | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findUserById(id: string): Promise<MockUser | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    preferences?: any;
  }): Promise<MockUser> {
    const id = this.nextId.toString();
    this.nextId++;

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    const user: MockUser = {
      id,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: `profile_${id}`,
        userId: id,
        name: userData.name,
        preferences: userData.preferences || {
          difficulty: ['easy', 'moderate'],
          maxDistance: 10,
          elevation: 'any',
          tags: []
        },
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749] // Default to San Francisco
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    this.users.push(user);
    return user;
  }

  async updateUserProfile(userId: string, updateData: any): Promise<MockUser | null> {
    const user = this.users.find(u => u.id === userId);
    if (!user || !user.profile) return null;

    if (updateData.preferences) {
      user.profile.preferences = { ...user.profile.preferences, ...updateData.preferences };
    }
    if (updateData.location) {
      user.profile.location = updateData.location;
    }

    user.profile.updatedAt = new Date();
    user.updatedAt = new Date();

    return user;
  }

  // Trail methods
  async findTrailById(id: string): Promise<MockTrail | null> {
    return this.trails.find(trail => trail.id === id) || null;
  }

  async findTrailsByUserLocation(userLocation: any, maxDistance?: number): Promise<MockTrail[]> {
    if (!userLocation) return [];
    
    return this.trails.filter(trail => {
      if (!trail.location) return false;
      
      // Calculate distance (simplified for mock)
      const distance = Math.abs(trail.location.coordinates[0] - userLocation.coordinates[0]) + 
                     Math.abs(trail.location.coordinates[1] - userLocation.coordinates[1]);
      
      return !maxDistance || distance <= maxDistance;
    });
  }

  async findTrailsExcludingSwiped(userId: string, direction: 'left' | 'right'): Promise<MockTrail[]> {
    const swipedTrailIds = this.swipes
      .filter(swipe => swipe.userId === userId && swipe.direction === direction)
      .map(swipe => swipe.trailId);
    
    return this.trails.filter(trail => !swipedTrailIds.includes(trail.id));
  }

  async findSavedTrails(userId: string): Promise<MockTrail[]> {
    const savedTrailIds = this.swipes
      .filter(swipe => swipe.userId === userId && swipe.direction === 'right')
      .map(swipe => swipe.trailId);
    
    return this.trails.filter(trail => savedTrailIds.includes(trail.id));
  }

  async createSwipe(swipeData: {
    userId: string;
    trailId: string;
    direction: 'left' | 'right' | 'up';
  }): Promise<MockSwipe> {
    const id = this.nextId.toString();
    this.nextId++;

    const swipe: MockSwipe = {
      id,
      userId: swipeData.userId,
      trailId: swipeData.trailId,
      direction: swipeData.direction,
      createdAt: new Date()
    };

    this.swipes.push(swipe);
    return swipe;
  }

  async findSwipesByUser(userId: string): Promise<MockSwipe[]> {
    return this.swipes.filter(swipe => swipe.userId === userId);
  }

  async findAllSwipes(): Promise<MockSwipe[]> {
    return this.swipes;
  }

  // Match methods
  async createMatch(matchData: {
    userId1: string;
    userId2: string;
    trailId: string;
  }): Promise<MockMatch> {
    const id = this.nextId.toString();
    this.nextId++;

    const match: MockMatch = {
      id,
      userId1: matchData.userId1,
      userId2: matchData.userId2,
      trailId: matchData.trailId,
      createdAt: new Date()
    };

    this.matches.push(match);
    return match;
  }

  async findMatchesByUser(userId: string): Promise<MockMatch[]> {
    return this.matches.filter(match => 
      match.userId1 === userId || match.userId2 === userId
    );
  }

  async findMatchByUsersAndTrail(userId1: string, userId2: string, trailId: string): Promise<MockMatch | null> {
    return this.matches.find(match => 
      ((match.userId1 === userId1 && match.userId2 === userId2) ||
       (match.userId1 === userId2 && match.userId2 === userId1)) &&
      match.trailId === trailId
    ) || null;
  }

  // Friendship methods
  async createFriendship(friendshipData: {
    userId: string;
    friendId: string;
    status: 'pending' | 'accepted';
  }): Promise<MockFriendship> {
    const id = this.nextId.toString();
    this.nextId++;

    const friendship: MockFriendship = {
      id,
      userId: friendshipData.userId,
      friendId: friendshipData.friendId,
      status: friendshipData.status,
      createdAt: new Date()
    };

    this.friendships.push(friendship);
    return friendship;
  }

  async findFriendship(userId: string, friendId: string): Promise<MockFriendship | null> {
    return this.friendships.find(friendship => 
      (friendship.userId === userId && friendship.friendId === friendId) ||
      (friendship.userId === friendId && friendship.friendId === userId)
    ) || null;
  }

  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.findFriendship(userId1, userId2);
    return friendship?.status === 'accepted' || false;
  }

  async findFriendshipsByUser(userId: string): Promise<MockFriendship[]> {
    return this.friendships.filter(friendship => 
      friendship.userId === userId || friendship.friendId === userId
    );
  }

  async findAcceptedFriendships(userId: string): Promise<MockFriendship[]> {
    return this.friendships.filter(friendship => 
      (friendship.userId === userId || friendship.friendId === userId) &&
      friendship.status === 'accepted'
    );
  }

  async findPendingFriendships(userId: string): Promise<MockFriendship[]> {
    return this.friendships.filter(friendship => 
      (friendship.userId === userId || friendship.friendId === userId) &&
      friendship.status === 'pending'
    );
  }

  async findIncomingFriendRequests(userId: string): Promise<MockFriendship[]> {
    return this.friendships.filter(friendship => 
      friendship.friendId === userId && friendship.status === 'pending'
    );
  }

  async findOutgoingFriendRequests(userId: string): Promise<MockFriendship[]> {
    return this.friendships.filter(friendship => 
      friendship.userId === userId && friendship.status === 'pending'
    );
  }

  async updateFriendshipStatus(friendshipId: string, status: 'accepted' | 'declined'): Promise<MockFriendship | null> {
    const friendshipIndex = this.friendships.findIndex(f => f.id === friendshipId);
    if (friendshipIndex === -1) return null;

    if (status === 'accepted') {
      this.friendships[friendshipIndex].status = 'accepted';
    } else {
      // Remove declined friendship
      this.friendships.splice(friendshipIndex, 1);
      return null;
    }

    return this.friendships[friendshipIndex];
  }

  async findFriendshipById(friendshipId: string): Promise<MockFriendship | null> {
    return this.friendships.find(friendship => friendship.id === friendshipId) || null;
  }

  // Check if sample data is initialized
  isSampleDataInitialized(): boolean {
    return this.trails.length > 0;
  }

  // Initialize with sample data
  initializeSampleData(): void {
    // Create a test user
    this.createUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      preferences: {
        difficulty: ['easy', 'moderate'],
        maxDistance: 10,
        elevation: 'any',
        tags: []
      }
    });

    // Use the imported sample trails (100 trails)

    sampleTrails.forEach(trailData => {
      const id = this.nextId.toString();
      this.nextId++;

      const trail: MockTrail = {
        ...trailData,
        id,
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.trails.push(trail);
    });
  }

  clear(): void {
    this.users = [];
    this.trails = [];
    this.photos = [];
    this.swipes = [];
    this.matches = [];
    this.friendships = [];
    this.nextId = 1;
  }
}

export const mockDatabase = new MockDatabase();
