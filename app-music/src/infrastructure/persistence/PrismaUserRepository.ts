import { Prisma, UserType } from '@prisma/client';
import { prisma } from '../../shared/database/client';
import { IUserRepository, User, UserProfile } from '../../domain/auth/repositories/IUserRepository';

/**
 * Prisma implementation of IUserRepository (ADAPTER)
 * This is the concrete implementation that uses Prisma
 */
export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async create(data: {
    email: string;
    passwordHash: string;
    userType: UserType;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<{ user: User; profile: UserProfile }> {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          userType: data.userType,
          displayName: data.displayName,
          bio: data.bio || null,
          avatarUrl: data.avatarUrl || null,
        },
      });

      // Create type-specific profile
      let userProfile;
      if (data.userType === 'creator') {
        userProfile = await tx.creatorProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      } else {
        userProfile = await tx.subscriberProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      return { user: newUser, profile: userProfile };
    });

    return result;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async getProfile(userId: string, userType: UserType): Promise<UserProfile | null> {
    if (userType === 'creator') {
      return await prisma.creatorProfile.findUnique({
        where: { userId },
      });
    } else {
      return await prisma.subscriberProfile.findUnique({
        where: { userId },
      });
    }
  }
}
