import { Editor } from "../Editor";
import { ValidationStatus } from "../ValidationStatus";
import { EditorControls } from "../EditorControls";
import { useAppContext } from "@context/AppContext";
import styles from "./index.module.css";

const EditorSection = () => {
  const {
    content,
    validationErrors,
    validationWarnings,
    tableCount,
    setContent,
    setValidation,
  } = useAppContext();

  return (
    <div className="editor-section">
      <div className={styles.editorHeader}>
        <h2>Markdown Editor</h2>
        <EditorControls />
      </div>
      <Editor
        value={content}
        onChange={setContent}
        language="markdown"
        onValidationChange={setValidation}
      />
      <ValidationStatus
        errors={validationErrors}
        warnings={validationWarnings}
        tableCount={tableCount}
        hasContent={content.trim().length > 0}
      />
    </div>
  );
};

export default EditorSection;
