/**
 * Password service interface (PORT)
 */
export interface IPasswordService {
  /**
   * Hash a plain text password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare plain text password with hash
   */
  compare(password: string, hash: string): Promise<boolean>;

  /**
   * Validate password complexity
   */
  validate(password: string): boolean;
}
