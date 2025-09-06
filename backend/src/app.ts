import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './routes/auth';
import { trailsRoutes } from './routes/trails';
import { swipesRoutes } from './routes/swipes';
import { matchesRoutes } from './routes/matches';
import { friendsRoutes } from './routes/friends';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/trails', trailsRoutes);
app.use('/swipes', swipesRoutes);
app.use('/matches', matchesRoutes);
app.use('/friends', friendsRoutes);

export { app };
