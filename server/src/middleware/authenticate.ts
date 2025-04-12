import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();
interface JwtPayload {
  userId: string;
  iat: number; // issued at timestamp
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
      if (user.passwordChangedAt.getTime() > tokenIssuedAt) {
        return res
          .status(401)
          .json({ message: 'Token expired due to password change' });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Middleware that attempts to authenticate a user from token but doesn't fail if no valid token exists.
 * Used for endpoints that can be accessed both authenticated and unauthenticated (like public files).
 */
export const optionalAuthenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      // Invalid user ID in token, but continue without authentication
      return next();
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
      if (user.passwordChangedAt.getTime() > tokenIssuedAt) {
        // Password changed after token issued, continue without authentication
        return next();
      }
    }

    // Authentication successful, attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Any JWT verification errors, continue without authentication
    next();
  }
};