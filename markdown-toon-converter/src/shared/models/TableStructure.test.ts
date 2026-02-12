import { describe, it, expect } from 'vitest';
import { TableStructure } from './TableStructure';

describe('TableStructure', () => {
  describe('constructor and validation', () => {
    it('should create a valid table structure', () => {
      const table = new TableStructure(
        'users',
        ['id', 'name', 'email'],
        [
          ['1', 'Alice', 'alice@example.com'],
          ['2', 'Bob', 'bob@example.com']
        ]
      );

      expect(table.name).toBe('users');
      expect(table.columns).toEqual(['id', 'name', 'email']);
      expect(table.rows).toHaveLength(2);
    });

    it('should throw error for empty table name', () => {
      expect(() => {
        new TableStructure('', ['col1'], [['val1']]);
      }).toThrow('Table name cannot be empty');
    });

    it('should throw error for whitespace-only table name', () => {
      expect(() => {
        new TableStructure('   ', ['col1'], [['val1']]);
      }).toThrow('Table name cannot be empty');
    });

    it('should throw error for no columns', () => {
      expect(() => {
        new TableStructure('table', [], []);
      }).toThrow('Table must have at least one column');
    });

    it('should throw error for mismatched row length', () => {
      expect(() => {
        new TableStructure(
          'table',
          ['col1', 'col2'],
          [['val1', 'val2', 'val3']]
        );
      }).toThrow('Row has 3 cells but table has 2 columns');
    });

    it('should allow table with no rows', () => {
      const table = new TableStructure('empty', ['col1', 'col2'], []);
      expect(table.rows).toHaveLength(0);
    });
  });

  describe('toToon', () => {
    it('should convert table to TOON format', () => {
      const table = new TableStructure(
        'users',
        ['id', 'name'],
        [
          ['1', 'Alice'],
          ['2', 'Bob']
        ]
      );

      const toon = table.toToon();
      expect(toon).toBe(
        '--- users\n' +
        'id | name\n' +
        '1 | Alice\n' +
        '2 | Bob'
      );
    });

    it('should handle single row table', () => {
      const table = new TableStructure(
        'single',
        ['col'],
        [['val']]
      );

      const toon = table.toToon();
      expect(toon).toBe('--- single\ncol\nval');
    });

    it('should handle empty table', () => {
      const table = new TableStructure(
        'empty',
        ['col1', 'col2'],
        []
      );

      const toon = table.toToon();
      expect(toon).toBe('--- empty\ncol1 | col2\n');
    });
  });

  describe('toMarkdown', () => {
    it('should convert table to Markdown format', () => {
      const table = new TableStructure(
        'users',
        ['id', 'name'],
        [
          ['1', 'Alice'],
          ['2', 'Bob']
        ]
      );

      const markdown = table.toMarkdown();
      expect(markdown).toBe(
        '## users\n\n' +
        '| id | name |\n' +
        '| --- | --- |\n' +
        '| 1 | Alice |\n' +
        '| 2 | Bob |'
      );
    });

    it('should handle single column table', () => {
      const table = new TableStructure(
        'items',
        ['item'],
        [['apple'], ['banana']]
      );

      const markdown = table.toMarkdown();
      expect(markdown).toBe(
        '## items\n\n' +
        '| item |\n' +
        '| --- |\n' +
        '| apple |\n' +
        '| banana |'
      );
    });

    it('should handle empty table', () => {
      const table = new TableStructure(
        'empty',
        ['col1', 'col2'],
        []
      );

      const markdown = table.toMarkdown();
      expect(markdown).toBe(
        '## empty\n\n' +
        '| col1 | col2 |\n' +
        '| --- | --- |\n'
      );
    });
  });

  describe('clone', () => {
    it('should create a deep copy of the table', () => {
      const original = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.name).toBe(original.name);
      expect(cloned.columns).not.toBe(original.columns);
      expect(cloned.columns).toEqual(original.columns);
      expect(cloned.rows).not.toBe(original.rows);
      expect(cloned.rows).toEqual(original.rows);
    });

    it('should not affect original when modifying clone', () => {
      const original = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      const cloned = original.clone();
      cloned.columns.push('email');
      cloned.rows[0].push('alice@example.com');

      expect(original.columns).toHaveLength(2);
      expect(original.rows[0]).toHaveLength(2);
    });
  });

  describe('equals', () => {
    it('should return true for identical tables', () => {
      const table1 = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      const table2 = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      expect(table1.equals(table2)).toBe(true);
    });

    it('should return false for different names', () => {
      const table1 = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      const table2 = new TableStructure(
        'people',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      expect(table1.equals(table2)).toBe(false);
    });

    it('should return false for different columns', () => {
      const table1 = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      const table2 = new TableStructure(
        'users',
        ['id', 'email'],
        [['1', 'Alice']]
      );

      expect(table1.equals(table2)).toBe(false);
    });

    it('should return false for different row count', () => {
      const table1 = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      const table2 = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice'], ['2', 'Bob']]
      );

      expect(table1.equals(table2)).toBe(false);
    });

    it('should return false for different row values', () => {
      const table1 = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      const table2 = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Bob']]
      );

      expect(table1.equals(table2)).toBe(false);
    });

    it('should return true for cloned table', () => {
      const original = new TableStructure(
        'users',
        ['id', 'name'],
        [['1', 'Alice']]
      );

      const cloned = original.clone();

      expect(original.equals(cloned)).toBe(true);
    });
  });
});
