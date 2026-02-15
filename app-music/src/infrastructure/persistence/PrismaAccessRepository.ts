import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/client';
import {
  IAccessRepository,
  AccessCode,
  AccessGrant,
} from '../../domain/access/repositories/IAccessRepository';

/**
 * Prisma implementation of IAccessRepository (ADAPTER)
 */
export class PrismaAccessRepository implements IAccessRepository {
  async findAccessCodeByCode(code: string): Promise<AccessCode | null> {
    return await prisma.accessCode.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  async findAccessCodeByPaymentId(paymentId: string): Promise<AccessCode | null> {
    return await prisma.accessCode.findUnique({
      where: { paymentId },
    });
  }

  async createAccessCode(data: {
    code: string;
    creatorId: string;
    paymentId: string;
    amount: number;
    currency: string;
    durationDays: number;
    expiresAt: Date | null;
  }): Promise<AccessCode> {
    return await prisma.accessCode.create({
      data: {
        ...data,
        isRedeemed: false,
        isValid: true,
      },
    });
  }

  async updateAccessCode(code: string, data: Partial<AccessCode>): Promise<AccessCode> {
    return await prisma.accessCode.update({
      where: { code: code.toUpperCase() },
      data,
    });
  }

  async findActiveGrant(subscriberId: string, creatorId: string): Promise<AccessGrant | null> {
    return await prisma.accessGrant.findFirst({
      where: {
        subscriberId,
        creatorId,
        isActive: true,
      },
    });
  }

  async findGrantById(grantId: string): Promise<AccessGrant | null> {
    return await prisma.accessGrant.findUnique({
      where: { id: grantId },
    });
  }

  async createAccessGrant(data: {
    subscriberId: string;
    creatorId: string;
    accessCode: string;
    expiresAt: Date;
  }): Promise<AccessGrant> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create access grant
      const grant = await tx.accessGrant.create({
        data: {
          ...data,
          isActive: true,
        },
      });

      // Update subscriber profile
      await tx.subscriberProfile.update({
        where: { userId: data.subscriberId },
        data: {
          activeAccessCount: { increment: 1 },
        },
      });

      // Update creator profile
      await tx.creatorProfile.update({
        where: { userId: data.creatorId },
        data: {
          subscriberCount: { increment: 1 },
        },
      });

      return grant;
    });
  }

  async revokeAccessGrant(grantId: string, revokedBy: string): Promise<void> {
    const grant = await prisma.accessGrant.findUnique({
      where: { id: grantId },
    });

    if (!grant) return;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Revoke grant
      await tx.accessGrant.update({
        where: { id: grantId },
        data: {
          isActive: false,
          revokedAt: new Date(),
          revokedBy,
        },
      });

      // Update subscriber profile
      await tx.subscriberProfile.update({
        where: { userId: grant.subscriberId },
        data: {
          activeAccessCount: { decrement: 1 },
        },
      });

      // Update creator profile
      await tx.creatorProfile.update({
        where: { userId: grant.creatorId },
        data: {
          subscriberCount: { decrement: 1 },
        },
      });
    });
  }

  async invalidateAccessCode(code: string, redeemedBy: string | null): Promise<void> {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const accessCode = await tx.accessCode.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!accessCode) return;

      // If code was redeemed, revoke the access grants
      if (redeemedBy) {
        await tx.accessGrant.updateMany({
          where: {
            accessCode: code.toUpperCase(),
            isActive: true,
          },
          data: {
            isActive: false,
            revokedAt: new Date(),
          },
        });

        // Update subscriber profile
        await tx.subscriberProfile.update({
          where: { userId: redeemedBy },
          data: {
            activeAccessCount: { decrement: 1 },
          },
        });

        // Update creator profile
        await tx.creatorProfile.update({
          where: { userId: accessCode.creatorId },
          data: {
            subscriberCount: { decrement: 1 },
          },
        });
      }

      // Mark code as invalid
      await tx.accessCode.update({
        where: { code: code.toUpperCase() },
        data: { isValid: false },
      });
    });
  }

  async updateGrantStatus(grantId: string, isActive: boolean): Promise<void> {
    await prisma.accessGrant.update({
      where: { id: grantId },
      data: { isActive },
    });
  }

  async findGrantsBySubscriber(subscriberId: string): Promise<AccessGrant[]> {
    return await prisma.accessGrant.findMany({
      where: {
        subscriberId,
        isActive: true,
      },
      orderBy: {
        grantedAt: 'desc',
      },
    });
  }
}
