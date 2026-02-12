import { Preview } from "@components/Preview";
import { useAppContext } from "@context/AppContext";
import { useServices } from "@context/ServicesContext";
import { useToast } from "@hooks/useToast";
import exportIcon from "@assets/icons/submit-document-50.png";
import styles from "./index.module.css";

const PreviewSection = () => {
  const { content, previewMode, setPreviewMode } = useAppContext();
  const { converter, toonParser } = useServices();
  const { showSuccess, showError } = useToast();

  const handleExport = () => {
    if (!content) {
      showError("No content to export");
      return;
    }

    try {
      let fileContent = "";
      let fileName = "";
      let mimeType = "";

      switch (previewMode) {
        case "toon": {
          fileContent = converter.markdownToToon(content);
          fileName = "export.toon";
          mimeType = "text/plain";
          break;
        }
        case "html": {
          const toonContent = converter.markdownToToon(content);
          const parseResult = toonParser.parse(toonContent);
          if (!parseResult.success || !parseResult.data) {
            throw new Error("Invalid Markdown content");
          }
          const tables = parseResult.data;

          fileContent = `<!DOCTYPE html>
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
    h2 { color: #4a9eff; margin-top: 2rem; }
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
      background-color: #4a9eff;
      color: white;
      font-weight: 600;
    }
    tr:hover { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>TOON Tables</h1>
${tables
  .map(
    (table) => `
  <h2>${table.name}</h2>
  <table>
    <thead>
      <tr>
        ${table.columns.map((col) => `<th>${col}</th>`).join("\n        ")}
      </tr>
    </thead>
    <tbody>
      ${table.rows
        .map(
          (row) => `<tr>
        ${row.map((cell) => `<td>${cell}</td>`).join("\n        ")}
      </tr>`,
        )
        .join("\n      ")}
    </tbody>
  </table>
`,
  )
  .join("\n")}
</body>
</html>`;
          fileName = "export.html";
          mimeType = "text/html";
          break;
        }
        case "json": {
          const toonContent = converter.markdownToToon(content);
          const parseResult = toonParser.parse(toonContent);
          if (!parseResult.success || !parseResult.data) {
            throw new Error("Invalid Markdown content");
          }
          fileContent = JSON.stringify(parseResult.data, null, 2);
          fileName = "export.json";
          mimeType = "application/json";
          break;
        }
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      showSuccess(
        `${previewMode.toUpperCase()} file exported successfully as ${fileName}`,
      );
    } catch (error) {
      showError(
        `Failed to export: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className={styles.previewSection}>
      <div className={styles.previewHeader}>
        <h2>Preview</h2>
        <div className={styles.previewControls}>
          <div className={styles.previewModeSelector}>
            <button
              className={previewMode === "toon" ? styles.active : ""}
              onClick={() => setPreviewMode("toon")}
            >
              TOON
            </button>
            <button
              className={previewMode === "html" ? styles.active : ""}
              onClick={() => setPreviewMode("html")}
            >
              HTML
            </button>
            <button
              className={previewMode === "json" ? styles.active : ""}
              onClick={() => setPreviewMode("json")}
            >
              JSON
            </button>
          </div>
          <button
            onClick={handleExport}
            className={styles.exportButton}
            disabled={!content}
            title={`Export as ${previewMode.toUpperCase()}`}
          >
            <img src={exportIcon} alt="Export" className={styles.buttonIcon} />{" "}
            {previewMode.toUpperCase()}
          </button>
        </div>
      </div>
      <div className={styles.previewContent}>
        <Preview content={content} mode={previewMode} inputMode="markdown" />
      </div>
    </div>
  );
};

export default PreviewSection;
