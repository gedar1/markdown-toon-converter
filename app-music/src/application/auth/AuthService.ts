import {
  RegisterUser,
  RegisterUserInput,
  RegisterUserOutput,
} from '../../domain/auth/use-cases/RegisterUser';
import { LoginUser, LoginUserInput, LoginUserOutput } from '../../domain/auth/use-cases/LoginUser';
import { ValidateToken, TokenValidationOutput } from '../../domain/auth/use-cases/ValidateToken';
import { ChangePassword, ChangePasswordInput } from '../../domain/auth/use-cases/ChangePassword';
import { PrismaUserRepository } from '../../infrastructure/persistence/PrismaUserRepository';
import { JwtTokenService } from '../../infrastructure/services/JwtTokenService';
import { BcryptPasswordService } from '../../infrastructure/services/BcryptPasswordService';

/**
 * Application Service
 * Orchestrates use cases and dependency injection
 */
export class AuthService {
  readonly registerUser: RegisterUser;
  readonly loginUser: LoginUser;
  readonly validateTokenUseCase: ValidateToken;
  readonly changePasswordUseCase: ChangePassword;

  constructor() {
    // Dependency Injection - Create adapters
    const userRepository = new PrismaUserRepository();
    const tokenService = new JwtTokenService();
    const passwordService = new BcryptPasswordService();

    // Initialize use cases with dependencies
    this.registerUser = new RegisterUser(userRepository, passwordService, tokenService);
    this.loginUser = new LoginUser(userRepository, passwordService, tokenService);
    this.validateTokenUseCase = new ValidateToken(userRepository, tokenService);
    this.changePasswordUseCase = new ChangePassword(userRepository, passwordService);
  }

  /**
   * Register a new user
   */
  async register(input: RegisterUserInput): Promise<RegisterUserOutput> {
    return await this.registerUser.execute(input);
  }

  /**
   * Login user
   */
  async login(input: LoginUserInput): Promise<LoginUserOutput> {
    return await this.loginUser.execute(input);
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<TokenValidationOutput> {
    return await this.validateTokenUseCase.execute(token);
  }

  /**
   * Change user password
   */
  async changePassword(input: ChangePasswordInput): Promise<void> {
    return await this.changePasswordUseCase.execute(input);
  }
}

// Export singleton instance
export const authService = new AuthService();
