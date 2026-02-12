/**
 * Core types for parsing operations.
 * These types are shared across all parsers (TOON and Markdown).
 */

/**
 * Represents an error encountered during parsing.
 */
export interface ParseError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Represents a warning encountered during parsing.
 */
export interface ParseWarning {
  line: number;
  message: string;
}

/**
 * Result of a parsing operation.
 * Contains the parsed data (if successful), errors, and warnings.
 */
export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: ParseError[];
  warnings: ParseWarning[];
}
