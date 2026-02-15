import { ICodeGeneratorService } from '../../domain/access/repositories/ICodeGeneratorService';
import { generateUniqueAccessCode } from '../../shared/utils/crypto';

/**
 * Access Code Generator implementation (ADAPTER)
 */
export class AccessCodeGeneratorService implements ICodeGeneratorService {
  async generateUniqueCode(checkExists: (code: string) => Promise<boolean>): Promise<string> {
    return await generateUniqueAccessCode(checkExists);
  }
}
