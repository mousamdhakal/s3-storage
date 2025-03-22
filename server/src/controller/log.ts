import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

// Get user's own logs
export const getUserLogs = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Unauthorized');
        }

        const userId = req.user.id;
        const {
            page = '1',
            limit = '20',
            sortBy = 'timestamp',
            sortOrder = 'desc',
            action = '',
            fileId = '',
            startDate = '',
            endDate = ''
        } = req.query;

        // Convert parameters
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build where condition
        const where: any = { userId };

        if (action) {
            where.action = action;
        }

        if (fileId) {
            where.fileId = fileId;
        }

        // Date filtering
        if (startDate || endDate) {
            where.timestamp = {};

            if (startDate) {
                where.timestamp.gte = new Date(startDate as string);
            }

            if (endDate) {
                where.timestamp.lte = new Date(endDate as string);
            }
        }

        // Get total count for pagination
        const totalLogs = await prisma.log.count({ where });

        // Get logs with pagination and sorting
        const logs = await prisma.log.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: {
                [sortBy as string]: sortOrder as 'asc' | 'desc',
            },
            include: {
                file: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });

        res.json({
            logs,
            pagination: {
                total: totalLogs,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(totalLogs / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get specific log details
export const getLogDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Unauthorized');
        }

        const userId = req.user.id;
        const logId = req.params.logId;

        const log = await prisma.log.findUnique({
            where: { id: logId },
            include: {
                file: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        size: true,
                        isPublic: true,
                    },
                },
            },
        });

        if (!log) {
            throw new AppError(404, 'Log not found');
        }

        // Check if log belongs to the user
        if (log.userId !== userId) {
            throw new AppError(403, 'Access denied');
        }

        res.json({ log });
    } catch (error) {
        next(error);
    }
};

// Get logs by file ID
export const getFileActivityLogs = async (
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

        // Check if file exists and belongs to user
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        if (file.userId !== userId) {
            throw new AppError(403, 'Access denied');
        }

        // Get logs for this file
        const logs = await prisma.log.findMany({
            where: {
                fileId,
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        res.json({ logs });
    } catch (error) {
        next(error);
    }
};

// Delete logs , not used in the application
export const deleteLogs = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Unauthorized');
        }

        const userId = req.user.id;
        const { olderThan } = req.query;

        if (!olderThan) {
            throw new AppError(400, 'Missing olderThan parameter');
        }

        const date = new Date(olderThan as string);

        const result = await prisma.log.deleteMany({
            where: {
                userId,
                timestamp: {
                    lt: date,
                },
            },
        });

        res.json({
            message: `${result.count} logs deleted successfully`,
        });
    } catch (error) {
        next(error);
    }
};
// Get user log statistics
export const getLogStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            throw new AppError(401, 'Unauthorized');
        }

        const userId = req.user.id;
        const { timeRange = '30days' } = req.query;

        // Calculate date range
        const endDate = new Date();
        let startDate = new Date();

        switch (timeRange as string) {
            case '7days':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '14days':
                startDate.setDate(endDate.getDate() - 14);
                break;
            case '30days':
            default:
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1year':
                startDate.setDate(endDate.getDate() - 365);
                break;
        }

        // Get action counts
        const actionCounts = await prisma.$queryRaw`
            SELECT action, COUNT(*) as count
            FROM "Log"
            WHERE "userId" = ${userId}
            AND timestamp >= ${startDate}
            GROUP BY action
            ORDER BY count DESC
        `;

        // Convert BigInt to Number in actionCounts
        const formattedActionCounts = (actionCounts as any[]).map(item => ({
            action: item.action,
            count: Number(item.count)
        }));

        // Get daily activity data
        const dailyActivity = await prisma.$queryRaw`
            SELECT 
                DATE_TRUNC('day', timestamp) as date,
                COUNT(*) as count
            FROM "Log"
            WHERE "userId" = ${userId}
            AND timestamp >= ${startDate}
            GROUP BY DATE_TRUNC('day', timestamp)
            ORDER BY date ASC
        `;

        // Format daily activity dates
        const formattedDailyActivity = (dailyActivity as any[]).map(item => ({
            date: item.date.toISOString().split('T')[0],
            count: Number(item.count)
        }));

        // Get most accessed files
        const mostAccessedFiles = await prisma.$queryRaw`
            SELECT 
                f.id,
                f.name,
                COUNT(*) as count
            FROM "Log" l
            JOIN "File" f ON l."fileId" = f.id
            WHERE l."userId" = ${userId}
            AND l.timestamp >= ${startDate}
            AND l."fileId" IS NOT NULL
            GROUP BY f.id, f.name
            ORDER BY count DESC
            LIMIT 5
        `;

        // Convert BigInt to Number in mostAccessedFiles
        const formattedMostAccessedFiles = (mostAccessedFiles as any[]).map(item => ({
            id: item.id,
            name: item.name,
            count: Number(item.count)
        }));

        // Get weekly trend data
        const weeklyTrend = await prisma.$queryRaw`
            SELECT 
                DATE_TRUNC('week', timestamp) as week,
                action,
                COUNT(*) as count
            FROM "Log"
            WHERE "userId" = ${userId}
            AND timestamp >= ${startDate}
            GROUP BY DATE_TRUNC('week', timestamp), action
            ORDER BY week ASC, action
        `;

        // Format weekly trend data
        const formattedWeeklyTrend = [];
        const weekMap = new Map();

        (weeklyTrend as any[]).forEach(item => {
            const weekStr = item.week.toISOString().split('T')[0];
            if (!weekMap.has(weekStr)) {
                weekMap.set(weekStr, {
                    week: weekStr,
                });
            }

            const weekData = weekMap.get(weekStr);
            weekData[item.action] = Number(item.count);
        });

        Array.from(weekMap.values()).forEach(week => {
            formattedWeeklyTrend.push(week);
        });

        res.json({
            actionCounts: formattedActionCounts,
            dailyActivity: formattedDailyActivity,
            mostAccessedFiles: formattedMostAccessedFiles,
            weeklyTrend: formattedWeeklyTrend
        });
    } catch (error) {
        next(error);
    }
};