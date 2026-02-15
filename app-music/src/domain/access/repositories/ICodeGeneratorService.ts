/**
 * Code Generator Service interface (PORT)
 */
export interface ICodeGeneratorService {
  /**
   * Generate a unique access code
   * @param checkExists - Function to check if code already exists
   */
  generateUniqueCode(checkExists: (code: string) => Promise<boolean>): Promise<string>;
}
