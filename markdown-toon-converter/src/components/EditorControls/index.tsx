import { useRef, useState } from "react";
import { useAppContext } from "@context/AppContext";
import { useToast } from "@hooks/useToast";
import { templates } from "@data/templates";
import importIcon from "@assets/icons/import-file-50.png";
import editIcon from "@assets/icons/editar-archivo-50.png";
import deleteIcon from "@assets/icons/eliminar-50.png";
import styles from "./index.module.css";

export const EditorControls = () => {
  const { content, setContent } = useAppContext();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension === "md" || extension === "markdown") {
        setContent(text);
        showSuccess(`File "${file.name}" loaded successfully`);
      } else {
        showError("Unsupported file type. Please use .md or .markdown files.");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      showError(
        `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setContent(template.content);
      setShowTemplates(false);
      showSuccess(`Template "${template.name}" loaded`);
    }
  };

  const handleClear = () => {
    if (!content) return;
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setContent("");
    setShowClearConfirm(false);
    showSuccess("Editor cleared");
  };

  const cancelClear = () => {
    setShowClearConfirm(false);
  };

  return (
    <div className={styles.editorControls}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        onClick={() => setShowTemplates(!showTemplates)}
        className={styles.controlButton}
      >
        <img src={editIcon} alt="Templates" className={styles.buttonIcon} />{" "}
        Templates
      </button>
      <button
        onClick={handleImportClick}
        className={`${styles.controlButton} ${styles.controlButtonIconOnly}`}
      >
        <img src={importIcon} alt="Import" className={styles.buttonIcon} />{" "}
      </button>

      <button
        onClick={handleClear}
        className={`${styles.controlButton} ${styles.controlButtonIconOnly}`}
        disabled={!content}
      >
        <img src={deleteIcon} alt="Clear" className={styles.buttonIcon} />
      </button>

      {showTemplates && (
        <div className={styles.templatesPanel}>
          <h4>Choose a Template</h4>
          <div className={styles.templatesGrid}>
            {templates.map((template) => (
              <button
                key={template.id}
                className={styles.templateCard}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className={styles.templateName}>{template.name}</div>
                <div className={styles.templateDescription}>
                  {template.description}
                </div>
              </button>
            ))}
          </div>
          <button
            className={styles.templatesClose}
            onClick={() => setShowTemplates(false)}
          >
            Close
          </button>
        </div>
      )}

      {showClearConfirm && (
        <div className={styles.confirmPanel}>
          <div className={styles.confirmContent}>
            <p>⚠️ Are you sure you want to clear the editor?</p>
            <div className={styles.confirmButtons}>
              <button
                onClick={confirmClear}
                className={`${styles.confirmButton} ${styles.confirmButtonDanger}`}
              >
                Yes, Clear
              </button>
              <button onClick={cancelClear} className={styles.confirmButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
