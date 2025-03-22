import express from 'express';
const { authenticateToken } = require('./middleware/authenticate');

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import fileRoutes from './routes/file'
import logRoutes from './routes/log';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', authenticateToken, userRoutes);
router.use('/file', fileRoutes);
router.use('/logs', authenticateToken, logRoutes);

export default router;
