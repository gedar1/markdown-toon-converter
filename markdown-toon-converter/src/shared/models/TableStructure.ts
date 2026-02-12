/**
 * TableStructure represents a table with a name, columns, and rows.
 * This is the core data model for representing both TOON and Markdown tables.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 6.1, 6.2, 6.3
 */
export class TableStructure {
  constructor(
    public name: string,
    public columns: string[],
    public rows: string[][]
  ) {
    this.validate();
  }

  /**
   * Validates the table structure integrity.
   * Throws an error if the structure is invalid.
   * 
   * Validation rules:
   * - Table name cannot be empty
   * - Table must have at least one column
   * - All rows must have the same number of cells as columns
   */
  validate(): void {
    if (!this.name || this.name.trim() === '') {
      throw new Error('Table name cannot be empty');
    }
    
    if (this.columns.length === 0) {
      throw new Error('Table must have at least one column');
    }
    
    for (const row of this.rows) {
      if (row.length !== this.columns.length) {
        throw new Error(
          `Row has ${row.length} cells but table has ${this.columns.length} columns`
        );
      }
    }
  }

  /**
   * Converts the table to TOON format.
   * 
   * TOON format:
   * --- table_name
   * column1 | column2 | column3
   * value1 | value2 | value3
   * value4 | value5 | value6
   * 
   * @returns TOON formatted string
   */
  toToon(): string {
    const header = `--- ${this.name}`;
    const columnRow = this.columns.join(' | ');
    const dataRows = this.rows.map(row => row.join(' | ')).join('\n');
    return `${header}\n${columnRow}\n${dataRows}`;
  }

  /**
   * Converts the table to Markdown format.
   * 
   * Markdown format:
   * ## table_name
   * 
   * | column1 | column2 | column3 |
   * | --- | --- | --- |
   * | value1 | value2 | value3 |
   * | value4 | value5 | value6 |
   * 
   * @returns Markdown formatted string
   */
  toMarkdown(): string {
    const header = `## ${this.name}\n\n`;
    const columnRow = '| ' + this.columns.join(' | ') + ' |';
    const separator = '| ' + this.columns.map(() => '---').join(' | ') + ' |';
    const dataRows = this.rows
      .map(row => '| ' + row.join(' | ') + ' |')
      .join('\n');
    return `${header}${columnRow}\n${separator}\n${dataRows}`;
  }

  /**
   * Creates a deep copy of the table structure.
   * 
   * @returns A new TableStructure instance with copied data
   */
  clone(): TableStructure {
    return new TableStructure(
      this.name,
      [...this.columns],
      this.rows.map(row => [...row])
    );
  }

  /**
   * Checks if this table is equal to another table.
   * Two tables are equal if they have the same name, columns, and rows.
   * 
   * @param other The table to compare with
   * @returns true if tables are equal, false otherwise
   */
  equals(other: TableStructure): boolean {
    if (this.name !== other.name) return false;
    if (this.columns.length !== other.columns.length) return false;
    if (this.rows.length !== other.rows.length) return false;
    
    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i] !== other.columns[i]) return false;
    }
    
    for (let i = 0; i < this.rows.length; i++) {
      for (let j = 0; j < this.rows[i].length; j++) {
        if (this.rows[i][j] !== other.rows[i][j]) return false;
      }
    }
    
    return true;
  }
}
