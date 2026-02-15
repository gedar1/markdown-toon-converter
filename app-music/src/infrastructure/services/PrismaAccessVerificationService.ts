import { prisma } from '../../shared/database/client';
import { IAccessVerificationService } from '../../domain/content/repositories/IAccessVerificationService';

/**
 * Prisma implementation of IAccessVerificationService (ADAPTER)
 *
 * EXTRACCIÓN: Verificación de acceso usando Prisma
 * UBICACIÓN: infrastructure/services/
 * POR QUÉ: Content necesita verificar acceso pero no debe conocer cómo
 * NOTA: Reutiliza la lógica de access grants
 */
export class PrismaAccessVerificationService implements IAccessVerificationService {
  async verifyAccess(subscriberId: string, creatorId: string): Promise<boolean> {
    const grant = await prisma.accessGrant.findFirst({
      where: {
        subscriberId,
        creatorId,
        isActive: true,
      },
    });

    if (!grant) {
      return false;
    }

    // Check expiration
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      return false;
    }

    return true;
  }
}
