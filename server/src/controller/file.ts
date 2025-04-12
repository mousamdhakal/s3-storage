import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { AppError } from '../utils/errors';
import * as s3 from '../services/s3';
import { createLog, LogAction } from '../services/logging';

const prisma = new PrismaClient();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// File upload middleware
export const uploadMiddleware = upload.single('file');

// Upload a file
export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Unauthorized');
        }

        if (!req.file) {
            throw new AppError(400, 'No file uploaded');
        }

        const userId = req.user.id;
        const { folder = '', isPublic = false } = req.body;
        const file = req.file;

        // Upload to S3 with public flag
        const s3Key = await s3.uploadFile(
            userId,
            file.originalname,
            file.buffer,
            file.mimetype,
            isPublic === 'true' || isPublic === true
        );

        // Save metadata to database
        const fileRecord = await prisma.file.create({
            data: {
                name: file.originalname,
                key: s3Key,
                size: file.size,
                type: file.mimetype,
                folder: folder || null,
                userId: userId,
                isPublic: isPublic === 'true' || isPublic === true,
            },
        });

        // Log the upload action
        await createLog(
            userId,
            LogAction.UPLOAD,
            `Uploaded file: ${file.originalname}`,
            fileRecord.id
        );

        res.status(201).json({
            message: 'File uploaded successfully',
            file: {
                id: fileRecord.id,
                name: fileRecord.name,
                size: fileRecord.size,
                type: fileRecord.type,
                folder: fileRecord.folder,
                uploadedAt: fileRecord.uploadedAt,
                isPublic: fileRecord.isPublic,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get a file download URL
export const getFileUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        const fileId = req.params.fileId;

        // Get file metadata
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        // Check ownership or if file is public
        if (!file.isPublic && (!userId || file.userId !== userId)) {
            throw new AppError(403, 'Access denied');
        }

        // Update last accessed timestamp
        await prisma.file.update({
            where: { id: fileId },
            data: { lastAccessed: new Date() },
        });

        // Generate URL based on file access level
        let downloadUrl;
        if (file.isPublic) {
            downloadUrl = await s3.getPublicFileUrl(file.key);
            if (!downloadUrl) {
                // If we couldn't get a public URL, fall back to signed URL
                downloadUrl = await s3.getFileUrl(file.userId, file.key);
            }
        } else {
            // Private file, needs user to be logged in
            if (!userId) {
                throw new AppError(401, 'Authentication required');
            }
            downloadUrl = await s3.getFileUrl(userId, file.key);
        }

        // Log the download action if user is authenticated
        if (userId) {
            await createLog(
                userId,
                LogAction.DOWNLOAD,
                `Downloaded file: ${file.name}`,
                fileId
            );
        }

        res.json({
            url: downloadUrl,
            file: {
                id: file.id,
                name: file.name,
                size: file.size,
                type: file.type,
                isPublic: file.isPublic,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Toggle file visibility (public/private)
export const toggleFileVisibility = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Unauthorized');
        }

        const userId = req.user.id;
        const fileId = req.params.fileId;

        // Get file metadata
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        // Check ownership
        if (file.userId !== userId) {
            throw new AppError(403, 'Access denied');
        }

        // Toggle visibility in S3
        await s3.setFileVisibility(userId, file.key, !file.isPublic);

        // Toggle visibility in database
        const updatedFile = await prisma.file.update({
            where: { id: fileId },
            data: { isPublic: !file.isPublic },
        });

        // Log the action
        await createLog(
            userId,
            LogAction.TOGGLE_VISIBILITY,
            `Toggled file visibility: ${file.name} (${file.isPublic} -> ${updatedFile.isPublic})`,
            fileId
        );

        res.json({
            message: `File is now ${updatedFile.isPublic ? 'public' : 'private'}`,
            file: {
                id: updatedFile.id,
                name: updatedFile.name,
                isPublic: updatedFile.isPublic,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get public file share link (no authentication required)
export const getPublicShareLink = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const fileId = req.params.fileId;

        // Get file metadata
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        // Check if file is public
        if (!file.isPublic) {
            throw new AppError(403, 'This file is not publicly shared');
        }

        // Generate a shareable URL for your application
        const baseUrl = process.env.APP_URL || 'http://localhost:5173';
        const shareUrl = `${baseUrl}/file/view/${fileId}`;

        if (req?.user?.id) {
            // Log the share action
            await createLog(
                req.user?.id,
                LogAction.SHARE,
                `Shared file: ${file.name}`,
                fileId
            );
        }

        res.json({
            shareUrl,
            file: {
                id: file.id,
                name: file.name,
                type: file.type,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Delete a file
export const deleteFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Unauthorized');
        }

        const userId = req.user.id;
        const fileId = req.params.fileId;

        // Get file metadata
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        // Check ownership
        if (file.userId !== userId) {
            throw new AppError(403, 'Access denied');
        }

        // Delete from S3
        await s3.deleteFile(userId, file.key);

        // Remove from database
        await prisma.file.delete({
            where: { id: fileId },
        });

        // Log the action
        await createLog(
            userId,
            LogAction.DELETE,
            `Deleted file: ${file.name}`,
        );

        res.json({
            message: 'File deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// List user files
export const listFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Unauthorized');
        }

        const userId = req.user.id;
        const { folder = '' } = req.query;

        // Get files from database
        const files = await prisma.file.findMany({
            where: {
                userId,
                ...(folder ? { folder: folder as string } : {}),
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });

        // Generate presigned URLs for each file
        const filesWithUrls = await Promise.all(
            files.map(async (file) => {
                // Get appropriate URL based on whether file is public or private
                let url;
                if (file.isPublic) {
                    url = await s3.getPublicFileUrl(file.key) ||
                        await s3.getFileUrl(userId, file.key);
                } else {
                    url = await s3.getFileUrl(userId, file.key);
                }

                return {
                    id: file.id,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    folder: file.folder,
                    uploadedAt: file.uploadedAt,
                    lastAccessed: file.lastAccessed,
                    isPublic: file.isPublic,
                    url: url, // Add the presigned URL
                };
            })
        );

        // Log the action
        await createLog(
            userId,
            LogAction.VIEW_FILES,
            `Listed files in folder: ${folder}`,
        );

        res.json({
            files: filesWithUrls,
        });
    } catch (error) {
        next(error);
    }
};