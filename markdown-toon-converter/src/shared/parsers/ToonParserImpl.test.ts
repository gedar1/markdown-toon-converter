/**
 * Unit tests for ToonParserImpl.
 * 
 * Tests cover:
 * - Parsing single tables
 * - Parsing multiple tables
 * - Empty file handling
 * - Malformed table error reporting
 * - Column count mismatch detection
 * - Empty lines between tables
 * 
 * Validates: Requirements 5.1, 5.5, 5.6, 5.7
 */

import { describe, it, expect } from 'vitest';
import { ToonParserImpl } from './ToonParserImpl';

describe('ToonParserImpl', () => {
  const parser = new ToonParserImpl();

  describe('parse', () => {
    it('should parse a simple TOON table correctly', () => {
      const toon = `--- users
id | name | email
1 | Alice | alice@example.com
2 | Bob | bob@example.com`;

      const result = parser.parse(toon);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].name).toBe('users');
      expect(result.data![0].columns).toEqual(['id', 'name', 'email']);
      expect(result.data![0].rows).toHaveLength(2);
      expect(result.data![0].rows[0]).toEqual(['1', 'Alice', 'alice@example.com']);
      expect(result.data![0].rows[1]).toEqual(['2', 'Bob', 'bob@example.com']);
    });

    it('should parse multiple tables separated by empty lines', () => {
      const toon = `--- users
id | name
1 | Alice

--- products
id | title
100 | Widget`;

      const result = parser.parse(toon);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].name).toBe('users');
      expect(result.data![1].name).toBe('products');
    });

    it('should handle empty TOON file', () => {
      const result = parser.parse('');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle file with only whitespace', () => {
      const result = parser.parse('   \n\n  \n');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should report error for mismatched column count', () => {
      const toon = `--- users
id | name
1 | Alice | extra`;

      const result = parser.parse(toon);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Expected 2 columns but found 3');
      expect(result.errors[0].line).toBe(3);
    });

    it('should warn about empty table name', () => {
      const toon = `---
id | name
1 | Alice`;

      const result = parser.parse(toon);
      
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Table name is empty');
      expect(result.data![0].name).toMatch(/table_\d+/);
    });

    it('should handle table with no data rows', () => {
      const toon = `--- empty_table
id | name`;

      const result = parser.parse(toon);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].rows).toHaveLength(0);
    });

    it('should trim whitespace from cells', () => {
      const toon = `--- users
id | name | email
  1  |  Alice  |  alice@example.com  `;

      const result = parser.parse(toon);
      
      expect(result.success).toBe(true);
      expect(result.data![0].rows[0]).toEqual(['1', 'Alice', 'alice@example.com']);
    });

    it('should handle multiple column count errors', () => {
      const toon = `--- users
id | name
1 | Alice | extra
2 | Bob
3 | Charlie | too | many`;

      const result = parser.parse(toon);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validate', () => {
    it('should return errors from parse', () => {
      const toon = `--- users
id | name
1 | Alice | extra`;

      const errors = parser.validate(toon);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Expected 2 columns but found 3');
    });

    it('should return empty array for valid content', () => {
      const toon = `--- users
id | name
1 | Alice`;

      const errors = parser.validate(toon);
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('format', () => {
    it('should format single table to TOON string', () => {
      const result = parser.parse(`--- users
id | name
1 | Alice`);

      const formatted = parser.format(result.data!);
      
      expect(formatted).toContain('--- users');
      expect(formatted).toContain('id | name');
      expect(formatted).toContain('1 | Alice');
    });

    it('should format multiple tables with empty line separator', () => {
      const result = parser.parse(`--- users
id | name
1 | Alice

--- products
id | title
100 | Widget`);

      const formatted = parser.format(result.data!);
      
      expect(formatted).toContain('--- users');
      expect(formatted).toContain('--- products');
      expect(formatted).toContain('\n\n');
    });

    it('should format empty array to empty string', () => {
      const formatted = parser.format([]);
      
      expect(formatted).toBe('');
    });
  });
});
