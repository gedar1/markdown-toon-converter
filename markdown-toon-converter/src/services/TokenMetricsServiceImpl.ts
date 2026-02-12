import { TokenMetrics, TokenMetricsService } from './TokenMetrics';

/**
 * Implementation of TokenMetricsService for calculating token efficiency metrics
 * 
 * This service provides consistent tokenization and metrics calculation to compare
 * TOON and Markdown formats, showing token savings and file size differences.
 */
export class TokenMetricsServiceImpl implements TokenMetricsService {
  /**
   * Tokenize text by splitting on whitespace and punctuation
   * 
   * This method provides consistent tokenization for accurate comparison
   * between TOON and Markdown formats. It splits text on:
   * - Whitespace (spaces, tabs, newlines, carriage returns)
   * - Pipe characters (|) which are structural in both formats
   * 
   * @param text - Text to tokenize
   * @returns Array of tokens (non-empty strings)
   */
  private tokenize(text: string): string[] {
    return text
      .split(/[\s\n\r\t|]+/)
      .filter(token => token.length > 0);
  }

  /**
   * Calculate token metrics comparing TOON and Markdown content
   * 
   * Calculates:
   * - Token counts for both formats using consistent tokenization
   * - Savings percentage (how much TOON reduces token count)
   * - File sizes in bytes for both formats
   * 
   * @param toonContent - Content in TOON format
   * @param markdownContent - Content in Markdown format
   * @returns TokenMetrics with all comparison data
   */
  calculate(toonContent: string, markdownContent: string): TokenMetrics {
    const toonTokens = this.tokenize(toonContent);
    const markdownTokens = this.tokenize(markdownContent);
    
    const toonCount = toonTokens.length;
    const markdownCount = markdownTokens.length;
    
    // Calculate savings percentage
    // If markdown has 0 tokens, savings is 0
    const savingsPercent = markdownCount > 0
      ? Math.round(((markdownCount - toonCount) / markdownCount) * 100)
      : 0;
    
    // Calculate file sizes in bytes
    // Using Blob to get accurate byte size (handles UTF-8 encoding)
    const toonBytes = new Blob([toonContent]).size;
    const markdownBytes = new Blob([markdownContent]).size;
    
    return {
      toonTokens: toonCount,
      markdownTokens: markdownCount,
      savingsPercent,
      toonBytes,
      markdownBytes
    };
  }
}
