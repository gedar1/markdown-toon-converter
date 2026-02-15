/**
 * Access Verification Service interface (PORT)
 *
 * EXTRACCIÓN: Lógica de verificación de acceso (antes estaba en content.service)
 * UBICACIÓN: domain/content/repositories/ (Puerto - Interface)
 * POR QUÉ: Content necesita verificar acceso pero no debe conocer cómo se implementa
 */
export interface IAccessVerificationService {
  /**
   * Verify if subscriber has access to creator's content
   */
  verifyAccess(subscriberId: string, creatorId: string): Promise<boolean>;
}
