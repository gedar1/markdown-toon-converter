/**
 * Implementation of the ToonParser interface.
 * 
 * This parser handles TOON format files with the following structure:
 * - Table headers: --- table_name
 * - Column headers: column1 | column2 | column3
 * - Data rows: value1 | value2 | value3
 * - Empty lines between tables are ignored
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import { ToonParser } from './ToonParser';
import { ParseResult, ParseError, ParseWarning } from '../../types/parser.types';
import { TableStructure } from '../models/TableStructure';

export class ToonParserImpl implements ToonParser {
  /**
   * Parses TOON content into TableStructure objects.
   * 
   * The parser processes the content line by line:
   * 1. Lines starting with "---" indicate a new table
   * 2. The first non-empty line after a table header is the column row
   * 3. Subsequent lines are data rows
   * 4. Empty lines are skipped
   * 5. Column count mismatches are reported as errors
   * 
   * @param content - The TOON formatted string to parse
   * @returns ParseResult containing tables, errors, and warnings
   */
  parse(content: string): ParseResult<TableStructure[]> {
    const tables: TableStructure[] = [];
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];
    
    const lines = content.split('\n').map(line => line.trimEnd());
    let currentTable: Partial<TableStructure> | null = null;
    let lineNumber = 0;
    
    for (const line of lines) {
      lineNumber++;
      
      // Skip empty lines
      if (line.trim() === '') {
        continue;
      }
      
      // Table header: --- table_name
      if (line.startsWith('---')) {
        // Save previous table if exists
        if (currentTable?.columns && currentTable.rows) {
          try {
            tables.push(new TableStructure(
              currentTable.name!,
              currentTable.columns,
              currentTable.rows
            ));
          } catch (e) {
            errors.push({
              line: lineNumber - 1,
              column: 0,
              message: (e as Error).message,
              severity: 'error'
            });
          }
        }
        
        const tableName = line.substring(3).trim();
        if (!tableName) {
          warnings.push({
            line: lineNumber,
            message: 'Table name is empty'
          });
        }
        
        currentTable = {
          name: tableName || `table_${tables.length + 1}`,
          columns: [],
          rows: []
        };
        continue;
      }
      
      // Process table content
      if (currentTable) {
        if (currentTable.columns?.length === 0 || !currentTable.columns) {
          // First line after header: columns
          currentTable.columns = this.splitByPipe(line);
        } else {
          // Data rows
          const cells = this.splitByPipe(line);
          
          if (cells.length !== currentTable.columns.length) {
            errors.push({
              line: lineNumber,
              column: 0,
              message: `Expected ${currentTable.columns.length} columns but found ${cells.length}`,
              severity: 'error'
            });
          } else {
            currentTable.rows!.push(cells);
          }
        }
      }
    }
    
    // Save last table
    if (currentTable?.columns && currentTable.rows) {
      try {
        tables.push(new TableStructure(
          currentTable.name!,
          currentTable.columns,
          currentTable.rows
        ));
      } catch (e) {
        errors.push({
          line: lineNumber,
          column: 0,
          message: (e as Error).message,
          severity: 'error'
        });
      }
    }
    
    return {
      success: errors.length === 0,
      data: tables,
      errors,
      warnings
    };
  }

  /**
   * Validates TOON content without full parsing.
   * 
   * This is a convenience method that calls parse() and returns only the errors.
   * 
   * @param content - The TOON formatted string to validate
   * @returns Array of ParseError objects
   */
  validate(content: string): ParseError[] {
    return this.parse(content).errors;
  }

  /**
   * Formats TableStructure objects into TOON string format.
   * 
   * Each table is formatted as:
   * --- table_name
   * column1 | column2 | column3
   * value1 | value2 | value3
   * 
   * Multiple tables are separated by empty lines.
   * 
   * @param tables - Array of TableStructure objects to format
   * @returns TOON formatted string
   */
  format(tables: TableStructure[]): string {
    return tables.map(table => table.toToon()).join('\n\n');
  }

  /**
   * Splits a line by pipe character, respecting escaped pipes (\|).
   * Escaped pipes are unescaped in the result.
   * 
   * @param line - The line to split
   * @returns Array of cell values with trimmed whitespace
   */
  private splitByPipe(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let i = 0;
    
    while (i < line.length) {
      if (line[i] === '\\' && i + 1 < line.length && line[i + 1] === '|') {
        // Escaped pipe: add the pipe to current cell and skip the backslash
        current += '|';
        i += 2;
      } else if (line[i] === '|') {
        // Unescaped pipe: end of cell
        result.push(current.trim());
        current = '';
        i++;
      } else {
        // Regular character
        current += line[i];
        i++;
      }
    }
    
    // Add the last cell
    if (current.length > 0 || result.length > 0) {
      result.push(current.trim());
    }
    
    return result;
  }
}
