/**
 * ToonParser interface for parsing TOON format files.
 * 
 * TOON format structure:
 * --- table_name
 * column1 | column2 | column3
 * value1 | value2 | value3
 * value4 | value5 | value6
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import { ParseResult, ParseError } from '../../types/parser.types';
import { TableStructure } from '../models/TableStructure';

/**
 * Interface for parsing TOON format content.
 */
export interface ToonParser {
  /**
   * Parses TOON content into TableStructure objects.
   * 
   * @param content - The TOON formatted string to parse
   * @returns ParseResult containing tables, errors, and warnings
   */
  parse(content: string): ParseResult<TableStructure[]>;

  /**
   * Validates TOON content without full parsing.
   * 
   * @param content - The TOON formatted string to validate
   * @returns Array of ParseError objects
   */
  validate(content: string): ParseError[];

  /**
   * Formats TableStructure objects into TOON string format.
   * 
   * @param tables - Array of TableStructure objects to format
   * @returns TOON formatted string
   */
  format(tables: TableStructure[]): string;
}
