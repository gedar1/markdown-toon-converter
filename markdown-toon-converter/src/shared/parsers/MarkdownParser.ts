/**
 * MarkdownParser interface for parsing Markdown format files.
 * 
 * Markdown table structure:
 * ## table_name
 * 
 * | column1 | column2 | column3 |
 * | --- | --- | --- |
 * | value1 | value2 | value3 |
 * | value4 | value5 | value6 |
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.5
 */

import { ParseResult } from '../../types/parser.types';
import { TableStructure } from '../models/TableStructure';

/**
 * Interface for parsing Markdown format content.
 */
export interface MarkdownParser {
  /**
   * Parses Markdown content into TableStructure objects.
   * Extracts both tables and lists from the content.
   * 
   * @param content - The Markdown formatted string to parse
   * @returns ParseResult containing tables, errors, and warnings
   */
  parse(content: string): ParseResult<TableStructure[]>;

  /**
   * Extracts only tables from Markdown content.
   * 
   * @param content - The Markdown formatted string to parse
   * @returns Array of TableStructure objects representing tables
   */
  extractTables(content: string): TableStructure[];

  /**
   * Extracts only lists from Markdown content.
   * Converts lists to TableStructure format.
   * 
   * @param content - The Markdown formatted string to parse
   * @returns Array of TableStructure objects representing lists
   */
  extractLists(content: string): TableStructure[];
}
