# Implementation Plan: Markdown ↔ TOON Converter

## Overview

Este plan implementa un convertidor bidireccional Markdown ↔ TOON con editor interactivo usando React 18+ y TypeScript 5+. La implementación sigue una arquitectura de capas (Domain → Application → Presentation) y utiliza testing dual (unit tests + property-based tests con fast-check).

El enfoque es incremental: primero construimos los parsers y estructuras de datos core, luego los servicios de conversión, y finalmente los componentes de UI. Cada fase incluye tests para validar la funcionalidad antes de continuar.

## Tasks

- [x] 1. Setup project structure and dependencies
  - Initialize Vite + React + TypeScript project
  - Install dependencies: react, typescript, vite, fast-check, vitest, @testing-library/react
  - Configure TypeScript with strict mode
  - Setup Vitest for testing
  - Create directory structure: src/{domain,application,presentation}/{parsers,converters,components}
  - _Requirements: All (foundation)_

- [ ] 2. Implement core TableStructure model
  - [x] 2.1 Create TableStructure class with validation
    - Implement constructor with name, columns, rows
    - Add validate() method to check structure integrity
    - Add toToon() method for TOON serialization
    - Add toMarkdown() method for Markdown serialization
    - Add clone() and equals() methods for testing
    - _Requirements: 3.1, 3.2, 3.3, 6.1, 6.2, 6.3_
  
  - [ ]* 2.2 Write unit tests for TableStructure
    - Test valid table creation
    - Test validation errors (empty name, no columns, mismatched rows)
    - Test toToon() output format
    - Test toMarkdown() output format
    - Test equals() method
    - _Requirements: 3.1, 6.1_
  
  - [ ]* 2.3 Write property test for TableStructure validation
    - **Property: Table structure validation**
    - **Validates: Requirements 3.1, 6.1**
    - Generate random valid tables and verify they pass validation
    - Generate random invalid tables and verify they fail validation

- [ ] 3. Implement TOON Parser
  - [x] 3.1 Create ToonParser interface and implementation
    - Implement parse() method returning ParseResult<TableStructure[]>
    - Implement validate() method returning ParseError[]
    - Implement format() method converting tables to TOON string
    - Handle table headers (--- table_name)
    - Handle column headers (pipe-separated)
    - Handle data rows (pipe-separated)
    - Handle empty lines between tables
    - Detect and report column count mismatches
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 3.2 Write unit tests for TOON Parser
    - Test parsing single table
    - Test parsing multiple tables
    - Test empty file handling
    - Test malformed table error reporting
    - Test column count mismatch detection
    - Test empty lines between tables
    - _Requirements: 5.1, 5.5, 5.6, 5.7_
  
  - [ ]* 3.3 Write property test for TOON round-trip
    - **Property 1: TOON Round-Trip Preservation**
    - **Validates: Requirements 3.6, 5.8**
    - Generate random TableStructure, convert to TOON, parse back, verify equality
  
  - [ ]* 3.4 Write property test for multi-table parsing
    - **Property 5: TOON Multi-Table Parsing**
    - **Validates: Requirements 5.1, 5.5, 5.6**
    - Generate random number of tables, format to TOON, parse, verify count matches
  
  - [ ]* 3.5 Write property test for column count validation
    - **Property 6: Column Count Validation**
    - **Validates: Requirements 5.7, 11.1**
    - Generate tables with mismatched columns, verify errors are reported with line numbers

- [ ] 4. Checkpoint - Ensure TOON parsing tests pass
  - Run all TOON parser tests
  - Verify round-trip property holds
  - Ask the user if questions arise

- [ ] 5. Implement Markdown Parser
  - [ ] 5.1 Create MarkdownParser interface and implementation
    - Implement parse() method returning ParseResult<TableStructure[]>
    - Implement extractTables() method to find and parse Markdown tables
    - Implement extractLists() method to find and parse lists
    - Handle table headers with pipe delimiters
    - Handle table separator rows (dashes and pipes)
    - Handle table data rows
    - Detect table names from preceding headings
    - Generate default table names when not found
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.5_
  
  - [ ]* 5.2 Write unit tests for Markdown table parsing
    - Test parsing single table with heading
    - Test parsing table without heading (default name)
    - Test parsing multiple tables
    - Test empty file handling
    - Test malformed table skipping
    - _Requirements: 1.1, 1.4, 1.5, 1.6_
  
  - [ ]* 5.3 Write unit tests for Markdown list parsing
    - Test unordered list extraction
    - Test ordered list extraction
    - Test multiple lists in one file
    - Test nested list handling
    - Test list items with inline formatting
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 5.4 Write property test for table extraction completeness
    - **Property 3: Markdown Table Extraction Completeness**
    - **Validates: Requirements 1.1, 1.4**
    - Generate Markdown with N tables, verify N tables extracted
  
  - [ ]* 5.5 Write property test for list extraction completeness
    - **Property 4: Markdown List Extraction Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.5**
    - Generate Markdown with lists, verify all items extracted
  
  - [ ]* 5.6 Write property test for malformed table handling
    - **Property 7: Malformed Markdown Table Handling**
    - **Validates: Requirements 1.6**
    - Generate Markdown with malformed tables, verify parser continues and logs warnings

- [ ] 6. Implement Converter service
  - [x] 6.1 Create Converter interface and implementation
    - Implement markdownToToon() method
    - Implement toonToMarkdown() method
    - Implement tablesToToon() method
    - Implement tablesToMarkdown() method
    - Handle special characters in cell values (pipe escaping)
    - Generate default table names when missing
    - _Requirements: 3.1, 3.4, 3.5, 6.1, 6.4, 6.5_
  
  - [ ]* 6.2 Write unit tests for Converter
    - Test Markdown to TOON conversion
    - Test TOON to Markdown conversion
    - Test special character escaping
    - Test default name generation
    - _Requirements: 3.1, 3.4, 3.5, 6.1, 6.4, 6.5_
  
  - [ ]* 6.3 Write property test for Markdown round-trip
    - **Property 2: Markdown Round-Trip Data Integrity**
    - **Validates: Requirements 6.6**
    - Generate random TableStructure, convert to Markdown, parse back, verify data integrity
  
  - [ ]* 6.4 Write property test for default name generation
    - **Property 10: Default Table Name Generation**
    - **Validates: Requirements 3.4**
    - Generate tables without names, verify unique names are generated

- [ ] 7. Implement list conversion logic
  - [x] 7.1 Add list-to-TOON conversion methods
    - Implement unordered list to TOON conversion
    - Implement ordered list to TOON conversion with index column
    - Implement nested list flattening with level column
    - Implement metadata extraction from list items
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 7.2 Write property tests for list conversion
    - **Property 11: Unordered List to TOON Conversion**
    - **Validates: Requirements 4.1**
    - **Property 12: Ordered List to TOON Conversion**
    - **Validates: Requirements 4.2**
    - **Property 13: Nested List Flattening**
    - **Validates: Requirements 4.3**
    - **Property 14: List Metadata Extraction**
    - **Validates: Requirements 4.4**

- [x] 8. Checkpoint - Ensure all parsers and converters work
  - Run all parser and converter tests
  - Verify all round-trip properties hold
  - Ask the user if questions arise

- [ ] 9. Implement TokenMetrics service
  - [x] 9.1 Create TokenMetricsService class
    - Implement tokenize() method for consistent tokenization
    - Implement calculate() method returning TokenMetrics
    - Calculate token counts for TOON and Markdown
    - Calculate savings percentage
    - Calculate file sizes in bytes
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [ ]* 9.2 Write property tests for token metrics
    - **Property 36: TOON Token Count Calculation**
    - **Validates: Requirements 14.1**
    - **Property 37: Markdown Token Count Calculation**
    - **Validates: Requirements 14.2**
    - **Property 40: Consistent Tokenization**
    - **Validates: Requirements 14.5**
    - Generate random content, verify tokenization is deterministic

- [ ] 10. Setup React application structure
  - [x] 10.1 Create main App component
    - Setup application state management (useState hooks)
    - Create layout structure (header, editor, preview, controls)
    - Implement responsive layout with CSS Grid/Flexbox
    - Add viewport-based layout switching (mobile vs desktop)
    - _Requirements: 15.1, 15.2, 15.5_
  
  - [x] 10.2 Create basic styling and theme
    - Create CSS variables for colors and spacing
    - Implement responsive breakpoints
    - Add touch-friendly sizing for mobile (44px minimum)
    - _Requirements: 15.3_

- [ ] 11. Implement Editor component
  - [ ] 11.1 Create Editor component with Monaco or CodeMirror
    - Setup code editor with TypeScript/JavaScript mode
    - Implement onChange handler
    - Implement onValidate handler
    - Add syntax highlighting for TOON format
    - Add line numbers and basic editor features
    - _Requirements: 7.1, 7.2, 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 11.2 Write component tests for Editor
    - Test editor renders with initial content
    - Test onChange callback fires on user input
    - Test syntax highlighting is applied
    - _Requirements: 7.1, 10.1_

- [ ] 12. Implement real-time validation
  - [ ] 12.1 Add validation logic to Editor
    - Integrate ToonParser.validate() on content change
    - Display errors inline with line numbers
    - Display warnings for missing names/headers
    - Display success message when valid
    - Show table count on success
    - _Requirements: 7.2, 7.3, 7.4, 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 12.2 Write property tests for validation feedback
    - **Property 15: Real-Time Validation Feedback**
    - **Validates: Requirements 7.2, 7.3, 7.4**
    - **Property 26: Inconsistent Column Count Error**
    - **Validates: Requirements 11.1**
    - **Property 27: Missing Table Name Warning**
    - **Validates: Requirements 11.2**

- [ ] 13. Implement Preview component
  - [x] 13.1 Create Preview component with mode switching
    - Implement Markdown preview mode (render as Markdown tables)
    - Implement HTML preview mode (render as HTML tables)
    - Implement JSON preview mode (display structured JSON)
    - Handle invalid content with error display
    - Update preview when editor content changes
    - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 13.2 Write component tests for Preview
    - Test Markdown mode rendering
    - Test HTML mode rendering
    - Test JSON mode rendering
    - Test error display for invalid content
    - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 13.3 Write property tests for preview rendering
    - **Property 17: Preview Mode Rendering**
    - **Validates: Requirements 8.1, 8.3, 8.4, 8.5**
    - **Property 18: Invalid Content Error Display**
    - **Validates: Requirements 8.6**

- [ ] 14. Implement multi-table support in UI
  - [ ] 14.1 Update Preview to handle multiple tables
    - Render each table separately with name as heading
    - Add visual separation between tables
    - Display validation errors per table
    - _Requirements: 12.1, 12.2, 12.4_
  
  - [ ]* 14.2 Write property tests for multi-table handling
    - **Property 31: Multiple Table Parsing**
    - **Validates: Requirements 12.1**
    - **Property 32: Multiple Table Preview Rendering**
    - **Validates: Requirements 12.2**
    - **Property 34: Independent Table Validation**
    - **Validates: Requirements 12.4**

- [ ] 15. Checkpoint - Ensure editor and preview work together
  - Test typing in editor updates preview
  - Test validation errors display correctly
  - Test all preview modes work
  - Ask the user if questions arise

- [ ] 16. Implement file import functionality
  - [x] 16.1 Create file import handlers
    - Add file input element for .toon and .md files
    - Implement TOON file import (load content directly)
    - Implement Markdown file import (convert to TOON)
    - Handle file read errors with user-friendly messages
    - Populate editor with imported content
    - _Requirements: 9.1, 9.2, 9.6_
  
  - [ ]* 16.2 Write property tests for file import
    - **Property 19: TOON File Import**
    - **Validates: Requirements 9.1**
    - **Property 20: Markdown File Import and Conversion**
    - **Validates: Requirements 9.2**
    - **Property 24: Import Error Handling**
    - **Validates: Requirements 9.6**

- [ ] 17. Implement file export functionality
  - [x] 17.1 Create export handlers for all formats
    - Implement export as TOON (.toon file download)
    - Implement export as Markdown (.md file download)
    - Implement export as HTML (generate viewer like toon-to-html.js)
    - Use browser download API for file downloads
    - _Requirements: 9.3, 9.4, 9.5_
  
  - [ ]* 17.2 Write property tests for file export
    - **Property 21: TOON Export**
    - **Validates: Requirements 9.3**
    - **Property 22: Markdown Export**
    - **Validates: Requirements 9.4**
    - **Property 23: HTML Export**
    - **Validates: Requirements 9.5**
  
  - [ ]* 17.3 Write property test for multi-table Markdown export
    - **Property 33: Multiple Table Markdown Export**
    - **Validates: Requirements 12.3**

- [ ] 18. Implement template system
  - [x] 18.1 Create template data and UI
    - Define at least 5 example TOON templates
    - Create template selector UI component
    - Implement template loading into editor
    - Ensure editor is editable after template load
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 18.2 Write property test for template loading
    - **Property 35: Template Loading**
    - **Validates: Requirements 13.2, 13.4**

- [ ] 19. Implement token metrics display
  - [x] 19.1 Add metrics panel to UI
    - Integrate TokenMetricsService
    - Display TOON token count
    - Display Markdown token count
    - Display savings percentage
    - Display file sizes in bytes
    - Update metrics when content changes
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [ ]* 19.2 Write property tests for metrics display
    - **Property 38: Token Savings Display**
    - **Validates: Requirements 14.3**
    - **Property 39: File Size Comparison**
    - **Validates: Requirements 14.4**

- [ ] 20. Implement Controls component
  - [x] 20.1 Create Controls component with all actions
    - Add import button (triggers file input)
    - Add export buttons (TOON, Markdown, HTML)
    - Add template selector button
    - Add clear editor button
    - Add preview mode selector (Markdown, HTML, JSON)
    - Style buttons for accessibility and touch-friendliness
    - _Requirements: 7.6, 13.1_
  
  - [ ]* 20.2 Write component tests for Controls
    - Test all buttons render
    - Test button click handlers fire
    - Test file input triggers on import button
    - _Requirements: 7.6, 13.1_

- [ ] 21. Add syntax highlighting for TOON
  - [ ] 21.1 Create custom TOON syntax highlighter
    - Define highlighting rules for table names (---)
    - Define highlighting rules for column headers
    - Define highlighting rules for pipe separators
    - Define highlighting rules for data cells
    - Integrate with Monaco/CodeMirror
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 21.2 Write property test for syntax highlighting
    - **Property 25: Syntax Highlighting Application**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [ ] 22. Implement responsive design
  - [ ] 22.1 Add responsive CSS and layout logic
    - Implement vertical stacking for viewports < 768px
    - Implement side-by-side layout for viewports >= 768px
    - Add smooth transitions for layout changes
    - Test functionality at 320px, 768px, 1024px, 2560px widths
    - _Requirements: 15.1, 15.2, 15.5_
  
  - [ ]* 22.2 Write property test for viewport functionality
    - **Property 41: Viewport Functionality Preservation**
    - **Validates: Requirements 15.5**

- [ ] 23. Add error boundary and global error handling
  - [ ] 23.1 Create ErrorBoundary component
    - Catch React errors and display user-friendly message
    - Log errors to console for debugging
    - Provide "retry" or "reset" action
    - _Requirements: All (error handling)_

- [ ] 24. Polish UI and add final touches
  - [ ] 24.1 Improve visual design
    - Add loading states for async operations
    - Add success/error toast notifications
    - Improve color scheme and typography
    - Add keyboard shortcuts (Ctrl+S for export, etc.)
    - Add help/documentation modal
    - _Requirements: All (user experience)_

- [ ] 25. Final checkpoint - End-to-end testing
  - Test complete workflow: import MD → edit → export TOON
  - Test complete workflow: create TOON → preview → export HTML
  - Test complete workflow: load template → modify → export MD
  - Verify all property tests pass (100+ iterations each)
  - Verify all unit tests pass
  - Ask the user if questions arise

- [ ] 26. Create documentation
  - [ ] 26.1 Write README.md
    - Add project overview and features
    - Add installation instructions
    - Add usage guide with screenshots
    - Add TOON format reference
    - Add development setup instructions
    - Add testing instructions
    - _Requirements: All (documentation)_
  
  - [ ] 26.2 Add inline code documentation
    - Add JSDoc comments to all public interfaces
    - Add comments for complex logic
    - Add examples in comments where helpful
    - _Requirements: All (documentation)_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: domain layer → application layer → presentation layer
- All property tests must reference their design document property number
- Fast-check will be used for property-based testing with minimum 100 iterations per test
