import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle known AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Handle Prisma specific errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(400).json({
        message: 'A record with that value already exists.',
      });
    }
  }

  // Log unexpected errors
  console.error('Unhandled error:', err);

  // Return generic error for unhandled cases
  res.status(500).json({
    message: 'Something went wrong',
  });
};
