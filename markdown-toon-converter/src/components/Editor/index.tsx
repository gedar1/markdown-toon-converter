import { useEffect, useRef } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useServices } from '@context/ServicesContext';
import type { ParseError, ParseWarning } from '@app-types/parser.types';
import styles from './index.module.css';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'toon' | 'markdown';
  readOnly?: boolean;
  onValidationChange?: (errors: ParseError[], warnings: ParseWarning[], tableCount: number) => void;
}

export const Editor = ({ value, onChange, language, readOnly = false, onValidationChange }: EditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const languageRegisteredRef = useRef(false);
  const { markdownParser } = useServices();

  const handleEditorChange = (newValue: string | undefined) => {
    onChange(newValue || '');
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register TOON language only once
    if (!languageRegisteredRef.current) {
      registerToonLanguage(monaco);
      languageRegisteredRef.current = true;
    }
  };

  // Real-time validation
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !value) {
      onValidationChange?.([], [], 0);
      return;
    }

    const monaco = monacoRef.current;
    const editor = editorRef.current;
    const model = editor.getModel();
    
    if (!model) return;

    // Parse and validate
    const parseResult = markdownParser.parse(value);

    // Convert parse errors to Monaco markers
    const markers: editor.IMarkerData[] = parseResult.errors.map(error => ({
      severity: error.severity === 'error' 
        ? monaco.MarkerSeverity.Error 
        : error.severity === 'warning'
        ? monaco.MarkerSeverity.Warning
        : monaco.MarkerSeverity.Info,
      startLineNumber: error.line,
      startColumn: error.column || 1,
      endLineNumber: error.line,
      endColumn: model.getLineMaxColumn(error.line),
      message: error.message,
    }));

    // Add warnings as markers
    parseResult.warnings.forEach(warning => {
      markers.push({
        severity: monaco.MarkerSeverity.Warning,
        startLineNumber: warning.line,
        startColumn: 1,
        endLineNumber: warning.line,
        endColumn: model.getLineMaxColumn(warning.line),
        message: warning.message,
      });
    });

    // Set markers
    monaco.editor.setModelMarkers(model, 'validation', markers);

    // Notify parent component
    const tableCount = parseResult.data?.length || 0;
    onValidationChange?.(parseResult.errors, parseResult.warnings, tableCount);

  }, [value, language, onValidationChange, markdownParser]);

  return (
    <div className={styles.editorContainer}>
      <MonacoEditor
        height="100%"
        language={language === 'toon' ? 'toon' : 'markdown'}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          fontSize: 14,
          tabSize: 2,
          automaticLayout: true,
          glyphMargin: true,
          folding: true,
        }}
      />
    </div>
  );
}

/**
 * Registers TOON language with Monaco Editor.
 * Defines syntax highlighting rules for TOON format.
 * 
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4
 */
const registerToonLanguage = (monaco: typeof import('monaco-editor')) => {
  // Register the language
  monaco.languages.register({ id: 'toon' });

  // Define syntax highlighting rules
  monaco.languages.setMonarchTokensProvider('toon', {
    tokenizer: {
      root: [
        // Table name: --- table_name
        [/^---\s*.*$/, 'keyword.table-name'],
        
        // Pipe separator
        [/\|/, 'delimiter.pipe'],
        
        // Escaped pipe
        [/\\\|/, 'string.escape'],
        
        // Column headers (first line after table name, contains pipes)
        [/^[^-\n][^|\n]*\|[^|\n]*(\|[^|\n]*)*$/, 'type.column-header'],
        
        // Data cells (any text between pipes or at start/end)
        [/[^|\n]+/, 'string.cell-data'],
      ],
    },
  });

  // Define color theme for TOON tokens
  monaco.editor.defineTheme('toon-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword.table-name', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'delimiter.pipe', foreground: '808080' },
      { token: 'type.column-header', foreground: '4EC9B0', fontStyle: 'bold' },
      { token: 'string.cell-data', foreground: 'D4D4D4' },
      { token: 'string.escape', foreground: 'D7BA7D' },
    ],
    colors: {},
  });

  // Set the custom theme as default for TOON
  monaco.editor.setTheme('toon-dark');
}
