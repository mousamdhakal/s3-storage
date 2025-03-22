import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum LogAction {
    UPLOAD = 'UPLOAD',
    DOWNLOAD = 'DOWNLOAD',
    DELETE = 'DELETE',
    SHARE = 'SHARE',
    VIEW = 'VIEW',
    VIEW_FILES = 'VIEW_FILES',
    TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY',
    UPDATE_USER = 'UPDATE_USER',
    CHANGE_PASSWORD = 'CHANGE_PASSWORD',
    REGISTER = 'REGISTER',
    LOGIN = 'LOGIN',
}

export const createLog = async (
    userId: string,
    action: LogAction,
    details?: string,
    fileId?: string
) => {
    return prisma.log.create({
        data: {
            userId,
            action,
            details,
            fileId,
        },
    });
};