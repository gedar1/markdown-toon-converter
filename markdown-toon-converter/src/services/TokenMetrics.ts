/**
 * Token metrics for comparing TOON and Markdown formats
 */
export interface TokenMetrics {
  toonTokens: number;
  markdownTokens: number;
  savingsPercent: number;
  toonBytes: number;
  markdownBytes: number;
}

/**
 * Service for calculating token metrics and efficiency comparisons
 * between TOON and Markdown formats
 */
export interface TokenMetricsService {
  /**
   * Calculate token metrics comparing TOON and Markdown content
   * @param toonContent - Content in TOON format
   * @param markdownContent - Content in Markdown format
   * @returns Token metrics with counts, savings, and file sizes
   */
  calculate(toonContent: string, markdownContent: string): TokenMetrics;
}
