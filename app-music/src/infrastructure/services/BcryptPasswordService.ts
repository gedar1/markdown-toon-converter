import { IPasswordService } from '../../domain/auth/repositories/IPasswordService';
import { hashPassword, comparePassword } from '../../shared/utils/crypto';
import { validatePassword } from '../../shared/utils/validation';

/**
 * Bcrypt implementation of IPasswordService (ADAPTER)
 */
export class BcryptPasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return await hashPassword(password);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await comparePassword(password, hash);
  }

  validate(password: string): boolean {
    return validatePassword(password);
  }
}
