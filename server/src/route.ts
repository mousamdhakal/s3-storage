import express from 'express';
const { authenticateToken } = require('./middleware/authenticate');

import authRoutes from './routes/auth';
import userRoutes from './routes/user';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', authenticateToken, userRoutes);

export default router;
