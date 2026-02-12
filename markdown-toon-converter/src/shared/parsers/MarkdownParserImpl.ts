/**
 * Implementation of MarkdownParser interface.
 * Parses Markdown tables and lists into TableStructure objects.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.5
 */

import { MarkdownParser } from "./MarkdownParser";
import { ParseResult, ParseWarning } from "../../types/parser.types";
import { TableStructure } from "../models/TableStructure";

export class MarkdownParserImpl implements MarkdownParser {
  /**
   * Parses Markdown content into TableStructure objects.
   * Extracts both tables and lists from the content.
   *
   * @param content - The Markdown formatted string to parse
   * @returns ParseResult containing tables, errors, and warnings
   */
  parse(content: string): ParseResult<TableStructure[]> {
    const warnings: ParseWarning[] = [];

    try {
      const tables = this.extractTables(content);
      const lists = this.extractLists(content);
      const codeBlocks = this.extractCodeBlocks(content);

      return {
        success: true,
        data: [...tables, ...lists, ...codeBlocks],
        errors: [],
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [
          {
            line: 0,
            column: 0,
            message:
              error instanceof Error ? error.message : "Unknown parsing error",
            severity: "error",
          },
        ],
        warnings,
      };
    }
  }

  /**
   * Extracts tables from Markdown content.
   *
   * Algorithm:
   * 1. Split content into lines
   * 2. Scan for lines starting and ending with pipe (|)
   * 3. Parse header row (first pipe-delimited line)
   * 4. Skip separator row (second line with dashes)
   * 5. Parse data rows until non-table line encountered
   * 6. Look for table name in preceding heading (lines starting with #)
   * 7. Generate default name if no heading found
   *
   * @param content - The Markdown formatted string to parse
   * @returns Array of TableStructure objects representing tables
   */
  extractTables(content: string): TableStructure[] {
    const tables: TableStructure[] = [];
    const lines = content.split("\n");

    let i = 0;
    let tableCounter = 1;

    while (i < lines.length) {
      const line = lines[i].trim();

      // Detect table by pipe characters at start and end
      if (line.startsWith("|") && line.endsWith("|")) {
        // Look for table name in previous heading (check up to 2 lines back for empty lines)
        let tableName = `table_${tableCounter}`;

        // Check previous line
        if (i > 0) {
          const prevLine = lines[i - 1].trim();
          if (prevLine.startsWith("#")) {
            tableName = prevLine.replace(/^#+\s*/, "").trim();
          } else if (prevLine === "" && i > 1) {
            // Check two lines back if previous line is empty
            const prevPrevLine = lines[i - 2].trim();
            if (prevPrevLine.startsWith("#")) {
              tableName = prevPrevLine.replace(/^#+\s*/, "").trim();
            }
          }
        }

        // Parse header row
        const columns = this.parseTableRow(line);

        if (columns.length === 0) {
          i++;
          continue;
        }

        // Skip separator row (should be next line)
        i++;
        if (i >= lines.length) break;

        const separatorLine = lines[i].trim();
        // Verify it's a separator row (contains dashes and pipes)
        if (!this.isSeparatorRow(separatorLine)) {
          // If not a separator, this might not be a valid table
          // Skip this potential table
          continue;
        }

        // Parse data rows
        const rows: string[][] = [];
        i++;

        while (i < lines.length) {
          const dataLine = lines[i].trim();

          // Stop if we hit a non-table line
          if (!dataLine.startsWith("|") || !dataLine.endsWith("|")) {
            break;
          }

          const cells = this.parseTableRow(dataLine);

          // Only add rows with matching column count
          if (cells.length === columns.length) {
            rows.push(cells);
          }

          i++;
        }

        // Only create table if we have both columns and at least one row
        if (columns.length > 0 && rows.length > 0) {
          try {
            tables.push(new TableStructure(tableName, columns, rows));
            tableCounter++;
          } catch (error) {
            // Skip invalid tables
            console.warn(
              `Skipping invalid table: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        }
      } else {
        i++;
      }
    }

    return tables;
  }

  /**
   * Extracts lists from Markdown content.
   * Converts both ordered and unordered lists to TableStructure format.
   *
   * Enhanced Algorithm:
   * 1. Scan for lines starting with list markers (-, *, +, or numbers)
   * 2. Collect consecutive list items, including nested sub-items
   * 3. Analyze list structure to detect patterns:
   *    - **Title** with nested description → [step, title, description]
   *    - Title: Description → [step, title, description]
   *    - Simple items → [item]
   * 4. When list ends, create TableStructure with appropriate columns
   * 5. Generate sequential list names (list_1, list_2, etc.)
   *
   * @param content - The Markdown formatted string to parse
   * @returns Array of TableStructure objects representing lists
   */
  extractLists(content: string): TableStructure[] {
    const lists: TableStructure[] = [];
    const lines = content.split("\n");

    let currentList: string[] = [];
    let listCounter = 1;
    let inList = false;
    let isOrdered = false;
    let currentItem = "";
    let currentItemIndent = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Calculate indentation level
      const indent = line.length - line.trimStart().length;

      // Detect list items (unordered: -, *, + or ordered: 1., 2., etc.)
      const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);
      const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

      if (unorderedMatch || orderedMatch) {
        const itemText = unorderedMatch ? unorderedMatch[1] : orderedMatch![1];

        // Check if this is a nested item (indented more than current item)
        if (inList && indent > currentItemIndent) {
          // This is a sub-item, append to current item
          if (currentItem) {
            currentItem += " " + itemText;
          }
        } else {
          // This is a new top-level item
          // Save previous item if exists
          if (currentItem) {
            currentList.push(currentItem);
          }

          // Start new item
          currentItem = itemText;
          currentItemIndent = indent;
          inList = true;

          // Determine if ordered (only from top-level items)
          if (indent === 0 || !inList) {
            isOrdered = !!orderedMatch;
          }
        }
      } else if (inList && trimmed === "") {
        // Empty line might end the list or be within it
        // Look ahead to see if list continues
        let listContinues = false;
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (nextLine === "") continue;
          if (/^[-*+]\s+/.test(nextLine) || /^\d+\.\s+/.test(nextLine)) {
            listContinues = true;
          }
          break;
        }

        if (!listContinues) {
          // End of list
          if (currentItem) {
            currentList.push(currentItem);
            currentItem = "";
          }
          if (currentList.length > 0) {
            this.saveStructuredList(lists, currentList, listCounter, isOrdered);
            listCounter++;
            currentList = [];
          }
          inList = false;
        }
      } else if (inList) {
        // Non-list line while in list - end the list
        if (currentItem) {
          currentList.push(currentItem);
          currentItem = "";
        }
        if (currentList.length > 0) {
          this.saveStructuredList(lists, currentList, listCounter, isOrdered);
          listCounter++;
          currentList = [];
        }
        inList = false;
      }
    }

    // Save last item and list if exists
    if (currentItem) {
      currentList.push(currentItem);
    }
    if (currentList.length > 0) {
      this.saveStructuredList(lists, currentList, listCounter, isOrdered);
    }

    return lists;
  }

  /**
   * Analyzes list items to detect structural patterns and saves as TableStructure.
   *
   * Detects patterns:
   * 1. **Bold Title** Description → structured with title/description columns
   * 2. Title: Description → structured with title/description columns
   * 3. Simple text → single item column
   *
   * @param lists - Array to add the list to
   * @param items - List items to save
   * @param counter - List counter for naming
   * @param isOrdered - Whether the list is ordered (numbered)
   */
  private saveStructuredList(
    lists: TableStructure[],
    items: string[],
    counter: number,
    isOrdered: boolean,
  ): void {
    try {
      // Analyze the structure of list items
      const structure = this.analyzeListStructure(items);

      let columns: string[];
      let rows: string[][];

      if (structure.type === "bold-description") {
        // Pattern: **Title** Description
        columns = isOrdered
          ? ["step", "title", "description"]
          : ["title", "description"];
        rows = items.map((item, index) => {
          const match = item.match(/\*\*(.+?)\*\*\s+(.+)/s);
          if (match) {
            const [, title, description] = match;
            return isOrdered
              ? [(index + 1).toString(), title.trim(), description.trim()]
              : [title.trim(), description.trim()];
          }
          // Fallback if pattern doesn't match
          return isOrdered ? [(index + 1).toString(), item, ""] : [item, ""];
        });
      } else if (structure.type === "colon-description") {
        // Pattern: Title: Description
        columns = isOrdered
          ? ["step", "title", "description"]
          : ["title", "description"];
        rows = items.map((item, index) => {
          const match = item.match(/^([^:]+):\s*(.+)/s);
          if (match) {
            const [, title, description] = match;
            return isOrdered
              ? [(index + 1).toString(), title.trim(), description.trim()]
              : [title.trim(), description.trim()];
          }
          // Fallback if pattern doesn't match
          return isOrdered ? [(index + 1).toString(), item, ""] : [item, ""];
        });
      } else {
        // Simple list: single column
        columns = isOrdered ? ["step", "item"] : ["item"];
        rows = items.map((item, index) => {
          return isOrdered ? [(index + 1).toString(), item] : [item];
        });
      }

      const table = new TableStructure(`list_${counter}`, columns, rows);
      lists.push(table);
    } catch (error) {
      // Skip invalid lists
      console.warn(
        `Skipping invalid list: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Analyzes list items to detect structural patterns.
   *
   * @param items - List items to analyze
   * @returns Structure type and confidence
   */
  private analyzeListStructure(items: string[]): {
    type: "bold-description" | "colon-description" | "simple";
    confidence: number;
  } {
    if (items.length === 0) {
      return { type: "simple", confidence: 1.0 };
    }

    // Check for **Bold** Description pattern
    const boldDescriptionCount = items.filter((item) =>
      /\*\*(.+?)\*\*\s+(.+)/s.test(item),
    ).length;

    const boldDescriptionRatio = boldDescriptionCount / items.length;

    if (boldDescriptionRatio >= 0.7) {
      return { type: "bold-description", confidence: boldDescriptionRatio };
    }

    // Check for Title: Description pattern
    const colonDescriptionCount = items.filter((item) =>
      /^([^:]+):\s*(.+)/s.test(item),
    ).length;

    const colonDescriptionRatio = colonDescriptionCount / items.length;

    if (colonDescriptionRatio >= 0.7) {
      return { type: "colon-description", confidence: colonDescriptionRatio };
    }

    // Default to simple list
    return { type: "simple", confidence: 1.0 };
  }

  /**
   * Parses a table row (pipe-delimited) into an array of cell values.
   * Removes leading and trailing pipes, splits by pipe, and trims each cell.
   *
   * Note: This simple implementation doesn't handle escaped pipes within cells.
   * In Markdown, pipes within cells should be escaped as \|, but many Markdown
   * parsers are lenient about this.
   *
   * @param line - A table row line (e.g., "| cell1 | cell2 | cell3 |")
   * @returns Array of cell values
   */
  private parseTableRow(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let i = 0;

    // Skip leading pipe and whitespace
    while (i < line.length && (line[i] === "|" || line[i] === " ")) {
      i++;
    }

    while (i < line.length) {
      if (line[i] === "\\" && i + 1 < line.length && line[i + 1] === "|") {
        // Escaped pipe: add the pipe to current cell
        current += "|";
        i += 2;
      } else if (line[i] === "|") {
        // Unescaped pipe: end of cell
        result.push(current.trim());
        current = "";
        i++;
      } else {
        // Regular character
        current += line[i];
        i++;
      }
    }

    // Add the last cell if not empty
    const lastCell = current.trim();
    if (lastCell.length > 0) {
      result.push(lastCell);
    }

    return result.filter((cell) => cell !== "");
  }

  /**
   * Checks if a line is a table separator row.
   * Separator rows contain only dashes, pipes, spaces, and colons.
   * Example: | --- | --- | --- |
   *
   * @param line - The line to check
   * @returns true if the line is a separator row
   */
  private isSeparatorRow(line: string): boolean {
    // Separator row should contain only: |, -, :, and whitespace
    return /^[\s|:-]+$/.test(line) && line.includes("-");
  }

  /**
   * Extracts code blocks from Markdown content and converts them to TableStructure.
   *
   * Detects fenced code blocks (```) and converts them to metadata tables.
   * For short code (< 10 lines), includes the code inline.
   * For long code (>= 10 lines), creates a reference with line count and summary.
   *
   * @param content - The Markdown formatted string to parse
   * @returns Array of TableStructure objects representing code blocks
   */
  extractCodeBlocks(content: string): TableStructure[] {
    const codeBlocks: TableStructure[] = [];
    const lines = content.split("\n");
    let codeBlockCounter = 1;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      // Detect start of code block: ```language
      if (line.startsWith("```")) {
        const language = line.substring(3).trim() || "text";
        const startLine = i;
        i++;

        // Collect code lines until closing ```
        const codeLines: string[] = [];
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }

        // Skip closing ```
        if (i < lines.length) {
          i++;
        }

        const lineCount = codeLines.length;

        // Look for context before code block (heading or description)
        let context = `code_block_${codeBlockCounter}`;
        for (let j = startLine - 1; j >= Math.max(0, startLine - 3); j--) {
          const prevLine = lines[j].trim();
          if (prevLine.startsWith("#")) {
            context = prevLine.replace(/^#+\s*/, "").trim();
            break;
          } else if (prevLine.length > 0 && !prevLine.startsWith("```")) {
            context = prevLine.substring(0, 50); // First 50 chars as context
            break;
          }
        }

        // Strategy: Always create metadata reference (safer for TOON format)
        const firstLine = this.escapeForToon(codeLines[0]?.trim() || "");
        const lastLine = this.escapeForToon(
          codeLines[codeLines.length - 1]?.trim() || "",
        );
        const summary = this.generateCodeSummary(
          codeLines.join("\n"),
          language,
        );
        const escapedContext = this.escapeForToon(context);
        const escapedSummary = this.escapeForToon(summary);

        const table = new TableStructure(
          `code_${codeBlockCounter}`,
          [
            "language",
            "lines",
            "context",
            "summary",
            "first_line",
            "last_line",
          ],
          [
            [
              language,
              lineCount.toString(),
              escapedContext,
              escapedSummary,
              firstLine.substring(0, 50),
              lastLine.substring(0, 50),
            ],
          ],
        );
        codeBlocks.push(table);

        codeBlockCounter++;
      } else {
        i++;
      }
    }

    return codeBlocks;
  }

  /**
   * Escapes special characters for TOON format.
   * Escapes pipes (|) and removes newlines.
   *
   * @param text - Text to escape
   * @returns Escaped text safe for TOON cells
   */
  private escapeForToon(text: string): string {
    return text
      .replace(/\|/g, "\\|") // Escape pipes
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/\r/g, "") // Remove carriage returns
      .trim();
  }

  /**
   * Generates a summary of code content based on language and patterns.
   *
   * @param code - The code content to summarize
   * @param language - The programming language
   * @returns A brief summary of what the code does
   */
  private generateCodeSummary(code: string, language: string): string {
    const lines = code
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Detect common patterns
    const patterns: string[] = [];

    // Function/method declarations
    if (/^(export\s+)?(const|function|class|interface|type)\s+\w+/.test(code)) {
      const match = code.match(
        /^(export\s+)?(const|function|class|interface|type)\s+(\w+)/m,
      );
      if (match) {
        patterns.push(`Defines ${match[2]} ${match[3]}`);
      }
    }

    // Imports
    const importCount = lines.filter((l) => l.startsWith("import")).length;
    if (importCount > 0) {
      patterns.push(`${importCount} imports`);
    }

    // Exports
    const exportCount = lines.filter((l) => l.startsWith("export")).length;
    if (exportCount > 0) {
      patterns.push(`${exportCount} exports`);
    }

    // React components
    if (language === "tsx" || language === "jsx") {
      if (/return\s*\(?\s*</.test(code)) {
        patterns.push("React component");
      }
    }

    // Hooks
    if (/use[A-Z]\w+/.test(code)) {
      patterns.push("Uses React hooks");
    }

    // API calls
    if (/fetch\(|axios\.|api\./i.test(code)) {
      patterns.push("Makes API calls");
    }

    // Event handlers
    if (/on[A-Z]\w+|handle[A-Z]\w+/.test(code)) {
      patterns.push("Event handlers");
    }

    return patterns.length > 0
      ? patterns.join(", ")
      : `${language} code (${lines.length} lines)`;
  }
}
