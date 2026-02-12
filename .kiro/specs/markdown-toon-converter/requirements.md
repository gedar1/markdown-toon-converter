# Requirements Document

## Introduction

Este documento especifica los requisitos para un convertidor bidireccional Markdown ↔ TOON con editor interactivo. El sistema permitirá convertir tablas y listas de Markdown a formato TOON (Token-Oriented Object Notation) y viceversa, además de proporcionar un editor visual para crear y editar archivos TOON con preview en tiempo real.

TOON es un formato tabular optimizado que reduce el uso de tokens en 60-80% comparado con JSON/Markdown, manteniendo legibilidad y facilitando el parsing automático. El proyecto actual ya cuenta con un parser TOON → HTML (toon-to-html.js) y múltiples archivos .toon con datos tabulares.

## Glossary

- **TOON**: Token-Oriented Object Notation, formato tabular optimizado para reducir tokens
- **Markdown_Parser**: Componente que analiza y extrae estructuras de archivos Markdown
- **TOON_Parser**: Componente que analiza y valida archivos TOON
- **Converter**: Sistema que transforma datos entre formatos Markdown y TOON
- **Editor**: Interfaz visual para crear y editar archivos TOON
- **Preview**: Visualización en tiempo real del contenido convertido
- **Table_Structure**: Estructura de datos que representa una tabla TOON con nombre, columnas y filas
- **Application**: La aplicación React + TypeScript completa

## Requirements

### Requirement 1: Parse Markdown to Extract Tables

**User Story:** As a developer, I want to parse Markdown files and extract tables, so that I can convert them to TOON format.

#### Acceptance Criteria

1. WHEN a valid Markdown file is provided, THE Markdown_Parser SHALL extract all tables into Table_Structure objects
2. WHEN a Markdown table has headers, THE Markdown_Parser SHALL identify them as column names
3. WHEN a Markdown table has data rows, THE Markdown_Parser SHALL parse each row into cell values
4. WHEN a Markdown file contains multiple tables, THE Markdown_Parser SHALL extract all of them independently
5. WHEN a Markdown file contains no tables, THE Markdown_Parser SHALL return an empty collection
6. WHEN a Markdown table has malformed syntax, THE Markdown_Parser SHALL skip it and log a warning

### Requirement 2: Parse Markdown to Extract Lists

**User Story:** As a developer, I want to parse Markdown files and extract lists, so that I can convert them to TOON format.

#### Acceptance Criteria

1. WHEN a valid Markdown file is provided, THE Markdown_Parser SHALL extract all unordered lists
2. WHEN a valid Markdown file is provided, THE Markdown_Parser SHALL extract all ordered lists
3. WHEN a list has nested items, THE Markdown_Parser SHALL preserve the hierarchical structure
4. WHEN a list item contains inline formatting, THE Markdown_Parser SHALL preserve the text content
5. WHEN a Markdown file contains multiple lists, THE Markdown_Parser SHALL extract all of them independently

### Requirement 3: Convert Markdown Tables to TOON Format

**User Story:** As a developer, I want to convert extracted Markdown tables to TOON format, so that I can reduce token usage.

#### Acceptance Criteria

1. WHEN a Table_Structure is provided, THE Converter SHALL generate a TOON table with format "--- table_name"
2. WHEN generating TOON output, THE Converter SHALL create a header row with column names separated by " | "
3. WHEN generating TOON output, THE Converter SHALL create data rows with cell values separated by " | "
4. WHEN a table name is not provided, THE Converter SHALL generate a default name based on content or position
5. WHEN cell values contain pipe characters, THE Converter SHALL escape them appropriately
6. FOR ALL valid Table_Structure objects, converting to TOON then parsing back SHALL produce an equivalent structure

### Requirement 4: Convert Markdown Lists to TOON Format

**User Story:** As a developer, I want to convert extracted Markdown lists to TOON format, so that I can represent hierarchical data efficiently.

#### Acceptance Criteria

1. WHEN an unordered list is provided, THE Converter SHALL generate a TOON table with list items as rows
2. WHEN an ordered list is provided, THE Converter SHALL generate a TOON table with index and item columns
3. WHEN a nested list is provided, THE Converter SHALL flatten it into a table with level/depth column
4. WHEN list items have metadata, THE Converter SHALL extract it into separate columns

### Requirement 5: Parse TOON Files

**User Story:** As a developer, I want to parse TOON files into structured data, so that I can convert them to other formats.

#### Acceptance Criteria

1. WHEN a valid TOON file is provided, THE TOON_Parser SHALL extract all tables into Table_Structure objects
2. WHEN a TOON table starts with "--- table_name", THE TOON_Parser SHALL extract the table name
3. WHEN a TOON table has a header row, THE TOON_Parser SHALL parse column names separated by " | "
4. WHEN a TOON table has data rows, THE TOON_Parser SHALL parse cell values separated by " | "
5. WHEN a TOON file contains multiple tables, THE TOON_Parser SHALL extract all of them independently
6. WHEN a TOON file has empty lines between tables, THE TOON_Parser SHALL ignore them
7. WHEN a TOON table has mismatched column counts, THE TOON_Parser SHALL return a descriptive error
8. FOR ALL valid TOON files, parsing then formatting then parsing SHALL produce an equivalent structure

### Requirement 6: Convert TOON to Markdown Tables

**User Story:** As a developer, I want to convert TOON tables to Markdown format, so that I can generate human-readable documentation.

#### Acceptance Criteria

1. WHEN a Table_Structure is provided, THE Converter SHALL generate a Markdown table with header row
2. WHEN generating Markdown output, THE Converter SHALL create a separator row with dashes and pipes
3. WHEN generating Markdown output, THE Converter SHALL create data rows with cell values in pipe-delimited format
4. WHEN a table name exists, THE Converter SHALL add it as a heading above the table
5. WHEN cell values contain pipe characters, THE Converter SHALL escape them with backslashes
6. FOR ALL valid Table_Structure objects, converting to Markdown then parsing back SHALL preserve data integrity

### Requirement 7: Implement Interactive Editor Component

**User Story:** As a user, I want an interactive editor to create and edit TOON files, so that I can work with TOON format visually.

#### Acceptance Criteria

1. WHEN the editor loads, THE Application SHALL display a text area for TOON input
2. WHEN a user types in the editor, THE Application SHALL validate TOON syntax in real-time
3. WHEN TOON syntax is invalid, THE Application SHALL highlight errors with descriptive messages
4. WHEN TOON syntax is valid, THE Application SHALL display a success indicator
5. WHEN a user loads a TOON file, THE Application SHALL populate the editor with its content
6. WHEN a user clears the editor, THE Application SHALL reset to an empty state

### Requirement 8: Implement Real-Time Preview

**User Story:** As a user, I want to see a real-time preview of my TOON content, so that I can verify the output immediately.

#### Acceptance Criteria

1. WHEN valid TOON content is in the editor, THE Application SHALL display a formatted preview
2. WHEN the editor content changes, THE Application SHALL update the preview within 300ms
3. WHEN the preview mode is "Markdown", THE Application SHALL display converted Markdown tables
4. WHEN the preview mode is "HTML", THE Application SHALL display rendered HTML tables
5. WHEN the preview mode is "JSON", THE Application SHALL display structured JSON representation
6. WHEN TOON content is invalid, THE Application SHALL display an error message in the preview area

### Requirement 9: Support File Import and Export

**User Story:** As a user, I want to import and export files in different formats, so that I can integrate with existing workflows.

#### Acceptance Criteria

1. WHEN a user selects a .toon file, THE Application SHALL load and display its content in the editor
2. WHEN a user selects a .md file, THE Application SHALL convert it to TOON and display in the editor
3. WHEN a user clicks export as TOON, THE Application SHALL download the editor content as a .toon file
4. WHEN a user clicks export as Markdown, THE Application SHALL convert to Markdown and download as .md file
5. WHEN a user clicks export as HTML, THE Application SHALL generate an HTML viewer and download it
6. WHEN a file import fails, THE Application SHALL display a descriptive error message

### Requirement 10: Provide Syntax Highlighting

**User Story:** As a user, I want syntax highlighting in the editor, so that I can easily identify TOON structure elements.

#### Acceptance Criteria

1. WHEN TOON content is displayed, THE Application SHALL highlight table names with distinct color
2. WHEN TOON content is displayed, THE Application SHALL highlight column headers with distinct color
3. WHEN TOON content is displayed, THE Application SHALL highlight pipe separators with distinct color
4. WHEN TOON content is displayed, THE Application SHALL highlight data cells with default text color
5. WHERE syntax highlighting is enabled, THE Application SHALL apply highlighting without impacting editor performance

### Requirement 11: Validate TOON Structure

**User Story:** As a user, I want automatic validation of TOON structure, so that I can catch errors early.

#### Acceptance Criteria

1. WHEN a table has inconsistent column counts, THE Application SHALL display an error with row number
2. WHEN a table name is missing after "---", THE Application SHALL display a warning
3. WHEN a table has no header row, THE Application SHALL display a warning
4. WHEN a table has no data rows, THE Application SHALL display an informational message
5. WHEN all validation passes, THE Application SHALL display a success message with table count

### Requirement 12: Support Multiple Tables in Single File

**User Story:** As a user, I want to work with multiple TOON tables in a single file, so that I can organize related data together.

#### Acceptance Criteria

1. WHEN a TOON file contains multiple tables, THE Application SHALL parse and display all of them
2. WHEN previewing multiple tables, THE Application SHALL render each table separately with its name
3. WHEN exporting multiple tables to Markdown, THE Application SHALL include all tables with headings
4. WHEN validating multiple tables, THE Application SHALL report errors for each table independently

### Requirement 13: Provide Example Templates

**User Story:** As a user, I want access to example TOON templates, so that I can quickly start creating new files.

#### Acceptance Criteria

1. WHEN a user clicks "New from Template", THE Application SHALL display a list of available templates
2. WHEN a user selects a template, THE Application SHALL load it into the editor
3. THE Application SHALL provide at least 5 different template examples
4. WHEN a template is loaded, THE Application SHALL allow immediate editing

### Requirement 14: Calculate Token Savings

**User Story:** As a user, I want to see token savings statistics, so that I can understand the efficiency gains of TOON format.

#### Acceptance Criteria

1. WHEN TOON content is displayed, THE Application SHALL calculate the token count
2. WHEN Markdown equivalent is available, THE Application SHALL calculate its token count
3. WHEN both formats are available, THE Application SHALL display the percentage of tokens saved
4. WHEN displaying statistics, THE Application SHALL show file size comparison in bytes
5. THE Application SHALL use a consistent tokenization method for accurate comparison

### Requirement 15: Implement Responsive UI Design

**User Story:** As a user, I want the application to work on different screen sizes, so that I can use it on various devices.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE Application SHALL stack editor and preview vertically
2. WHEN the viewport width is 768px or greater, THE Application SHALL display editor and preview side-by-side
3. WHEN on mobile devices, THE Application SHALL provide touch-friendly controls with minimum 44px tap targets
4. WHEN the window is resized, THE Application SHALL adjust layout smoothly within 300ms
5. THE Application SHALL maintain functionality across viewport sizes from 320px to 2560px width
