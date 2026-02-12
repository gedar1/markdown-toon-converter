import { useMarkdownConverter } from '@hooks/useMarkdownConverter';
import styles from './index.module.css';

interface PreviewProps {
  content: string;
  mode: 'toon' | 'html' | 'json';
  inputMode: 'markdown';
}

export const Preview = ({ content, mode }: PreviewProps) => {
  const { toon, html, json, error } = useMarkdownConverter(content);

  if (!content.trim()) {
    return (
      <div className={styles.previewEmpty}>
        <p>Enter Markdown content to see the preview</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.previewError}>
        <h3>❌ Conversion Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  // HTML mode: render in iframe
  if (mode === 'html' && html) {
    return (
      <div className={styles.previewHtml}>
        <iframe
          srcDoc={html}
          title="HTML Preview"
          className={styles.htmlIframe}
          sandbox="allow-same-origin"
        />
      </div>
    );
  }

  // TOON or JSON mode: show as code
  let displayContent: string | null = null;

  switch (mode) {
    case 'toon':
      displayContent = toon;
      break;
    case 'json':
      displayContent = json;
      break;
    default:
      displayContent = null;
  }

  if (!displayContent) {
    return (
      <div className={styles.previewError}>
        <h3>❌ Conversion Failed</h3>
        <p>Unable to convert content to {mode.toUpperCase()} format</p>
      </div>
    );
  }

  return (
    <div className={styles.previewResult}>
      <pre>{displayContent}</pre>
    </div>
  );
}
