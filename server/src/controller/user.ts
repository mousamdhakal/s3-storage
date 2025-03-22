import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errors';
import { ChangePasswordRequest, UpdateUserRequest } from '../types/user';
import { createLog, LogAction } from '../services/logging';

const prisma = new PrismaClient();

const changePassword = async (
  req: Request<{}, {}, ChangePasswordRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const userId = req.user.id;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new AppError(400, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Log password change
    await createLog(
      userId,
      LogAction.CHANGE_PASSWORD,
      'Changed account password'
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (
  req: Request<{}, {}, UpdateUserRequest>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, firstname, lastname } = req.body;

    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    const userId = req.user.id;

    // Check if email already exists if email is being updated
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          AND: [
            { email },
            { id: { not: userId } }, // Exclude current user
          ],
        },
      });

      if (existingEmail) {
        throw new AppError(400, 'Email already exists');
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email }),
        ...(firstname && { firstname }),
        ...(lastname && { lastname }),
      },
    });



    // Log the update
    const updatedFields = [];
    if (email) updatedFields.push('email');
    if (firstname) updatedFields.push('firstname');
    if (lastname) updatedFields.push('lastname');

    await createLog(
      userId,
      LogAction.UPDATE_USER,
      `Updated user profile fields: ${updatedFields.join(', ')}`
    );

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update exports
export { changePassword, updateUser };
