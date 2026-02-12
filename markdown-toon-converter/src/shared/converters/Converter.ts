/**
 * Converter interface for bidirectional conversion between Markdown and TOON formats.
 * 
 * This interface provides methods to convert between Markdown and TOON formats,
 * as well as methods to convert TableStructure objects to formatted strings.
 * 
 * Validates: Requirements 3.1, 3.4, 3.5, 6.1, 6.4, 6.5
 */

import { TableStructure } from '../models/TableStructure';

/**
 * Configuration options for conversion operations.
 */
export interface ConversionOptions {
  /**
   * Whether to generate default table names for tables without names.
   * Default: true
   */
  generateTableNames?: boolean;

  /**
   * Whether to escape special characters (like pipes) in cell values.
   * Default: true
   */
  escapeSpecialChars?: boolean;

  /**
   * Whether to preserve formatting details during conversion.
   * Default: true
   */
  preserveFormatting?: boolean;

  /**
   * Prefix to use when generating default table names.
   * Default: "table_"
   */
  defaultTablePrefix?: string;
}

/**
 * Interface for converting between Markdown and TOON formats.
 */
export interface Converter {
  /**
   * Converts Markdown content to TOON format.
   * 
   * This method:
   * 1. Parses the Markdown content to extract tables
   * 2. Converts the tables to TOON format
   * 3. Returns the TOON formatted string
   * 
   * @param markdown - The Markdown formatted string to convert
   * @param options - Optional conversion options
   * @returns TOON formatted string
   * @throws Error if parsing fails
   */
  markdownToToon(markdown: string, options?: ConversionOptions): string;

  /**
   * Converts TOON content to Markdown format.
   * 
   * This method:
   * 1. Parses the TOON content to extract tables
   * 2. Converts the tables to Markdown format
   * 3. Returns the Markdown formatted string
   * 
   * @param toon - The TOON formatted string to convert
   * @param options - Optional conversion options
   * @returns Markdown formatted string
   * @throws Error if parsing fails
   */
  toonToMarkdown(toon: string, options?: ConversionOptions): string;

  /**
   * Converts an array of TableStructure objects to TOON format.
   * 
   * Each table is formatted as:
   * --- table_name
   * column1 | column2 | column3
   * value1 | value2 | value3
   * 
   * Multiple tables are separated by empty lines.
   * 
   * @param tables - Array of TableStructure objects to convert
   * @returns TOON formatted string
   */
  tablesToToon(tables: TableStructure[]): string;

  /**
   * Converts an array of TableStructure objects to Markdown format.
   * 
   * Each table is formatted as:
   * ## table_name
   * 
   * | column1 | column2 | column3 |
   * | --- | --- | --- |
   * | value1 | value2 | value3 |
   * 
   * Multiple tables are separated by empty lines.
   * 
   * @param tables - Array of TableStructure objects to convert
   * @returns Markdown formatted string
   */
  tablesToMarkdown(tables: TableStructure[]): string;
}
