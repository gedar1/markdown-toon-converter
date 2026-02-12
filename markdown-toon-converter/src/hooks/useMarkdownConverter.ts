/**
 * Custom hook for Markdown conversion operations.
 * Encapsulates conversion logic and provides memoized results.
 */

import { useMemo } from 'react';
import { useServices } from '../context/ServicesContext';
import type { TableStructure } from '../shared/models/TableStructure';

export interface ConversionResult {
  toon: string | null;
  html: string | null;
  json: string | null;
  tables: TableStructure[] | null;
  error: string | null;
}

export const useMarkdownConverter = (markdownContent: string): ConversionResult => {
  const { converter, toonParser } = useServices();

  return useMemo(() => {
    if (!markdownContent.trim()) {
      return {
        toon: null,
        html: null,
        json: null,
        tables: null,
        error: null,
      };
    }

    try {
      // Convert Markdown to TOON
      const toonContent = converter.markdownToToon(markdownContent);
      
      // Parse TOON to get tables
      const parseResult = toonParser.parse(toonContent);
      
      if (!parseResult.success || !parseResult.data) {
        return {
          toon: null,
          html: null,
          json: null,
          tables: null,
          error: 'Failed to parse converted TOON',
        };
      }

      const tables = parseResult.data;

      // Generate HTML
      const html = generateHtml(tables);

      // Generate JSON
      const json = JSON.stringify(
        tables.map(table => ({
          name: table.name,
          columns: table.columns,
          rows: table.rows,
        })),
        null,
        2
      );

      return {
        toon: toonContent,
        html,
        json,
        tables,
        error: null,
      };
    } catch (error) {
      return {
        toon: null,
        html: null,
        json: null,
        tables: null,
        error: error instanceof Error ? error.message : 'Unknown conversion error',
      };
    }
  }, [markdownContent, converter, toonParser]);
}

const generateHtml = (tables: TableStructure[]): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TOON Tables</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background-color: #f5f5f5;
    }
    h1 { color: #333; }
    h2 { color: #646cff; margin-top: 2rem; }
    table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #646cff;
      color: white;
      font-weight: 600;
    }
    tr:hover { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>TOON Tables</h1>
${tables.map(table => `
  <h2>${table.name}</h2>
  <table>
    <thead>
      <tr>
        ${table.columns.map(col => `<th>${col}</th>`).join('\n        ')}
      </tr>
    </thead>
    <tbody>
      ${table.rows.map(row => `<tr>
        ${row.map(cell => `<td>${cell}</td>`).join('\n        ')}
      </tr>`).join('\n      ')}
    </tbody>
  </table>
`).join('\n')}
</body>
</html>`;
}
