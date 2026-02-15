import { IContentRepository, Content } from '../repositories/IContentRepository';
import { IAccessVerificationService } from '../repositories/IAccessVerificationService';
import { ValidationError, NotFoundError, AccessDeniedError } from '../../../shared/errors/AppError';
import { validateUUID } from '../../../shared/utils/validation';

/**
 * Get content input
 */
export interface GetContentInput {
  contentId: string;
  subscriberId?: string;
}

/**
 * Get Content Use Case
 *
 * EXTRACCIÓN: Lógica para obtener contenido con verificación de acceso
 * UBICACIÓN: domain/content/use-cases/
 */
export class GetContent {
  constructor(
    readonly contentRepository: IContentRepository,
    readonly accessVerification: IAccessVerificationService
  ) {}

  async execute(input: GetContentInput): Promise<Content> {
    const { contentId, subscriberId } = input;

    // Validate content ID
    if (!validateUUID(contentId)) {
      throw new ValidationError('Invalid content ID format');
    }

    // Find content
    const content = await this.contentRepository.findById(contentId);

    if (!content) {
      throw new NotFoundError('Content');
    }

    // If subscriber is provided, verify access
    if (subscriberId) {
      const hasAccess = await this.accessVerification.verifyAccess(subscriberId, content.creatorId);

      if (!hasAccess) {
        throw new AccessDeniedError('You do not have access to this content');
      }
    }

    return content;
  }
}
