// Updated fileRoutes.ts with public file access routes

import express from 'express';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authenticate';
import {
    uploadMiddleware,
    uploadFile,
    getFileUrl,
    deleteFile,
    listFiles,
    toggleFileVisibility,
    getPublicShareLink
} from '../controller/file';

const router = express.Router();

// Routes that require authentication
router.post('/upload', authenticateToken, uploadMiddleware, uploadFile);
router.get('/list', authenticateToken, listFiles);
router.delete('/:fileId', authenticateToken, deleteFile);
router.patch('/:fileId/visibility', authenticateToken, toggleFileVisibility);

// Routes with optional authentication
router.get('/:fileId/url', optionalAuthenticateToken, getFileUrl);
router.get('/:fileId/share', optionalAuthenticateToken, getPublicShareLink);

export default router;