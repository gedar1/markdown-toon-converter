import { ITokenService, TokenPayload } from '../../domain/auth/repositories/ITokenService';
import { generateToken, verifyToken } from '../../shared/utils/crypto';

/**
 * JWT implementation of ITokenService (ADAPTER)
 */
export class JwtTokenService implements ITokenService {
  generate(payload: TokenPayload): string {
    return generateToken(payload);
  }

  verify(token: string): TokenPayload {
    return verifyToken(token);
  }
}
