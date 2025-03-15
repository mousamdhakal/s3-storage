import express from 'express';
const { authenticateToken } = require('./middleware/authenticate');

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import fileRoutes from './routes/file'

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', authenticateToken, userRoutes);
router.use('/file', fileRoutes);

export default router;
