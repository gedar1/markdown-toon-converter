import { useState } from "react";
import type { ParseError, ParseWarning } from "@app-types/parser.types";
import styles from "./index.module.css";

interface ValidationStatusProps {
  errors: ParseError[];
  warnings: ParseWarning[];
  tableCount: number;
  hasContent: boolean;
}

export const ValidationStatus = ({
  errors,
  warnings,
  tableCount,
  hasContent,
}: ValidationStatusProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!hasContent) {
    return null;
  }

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;

  // Compact summary for collapsed state
  if (isCollapsed) {
    return (
      <div className={`${styles.validationStatus} ${styles.collapsed}`}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsCollapsed(false)}
          title="Show validation details"
        >
          {hasErrors && (
            <span className={styles.compactIcon}>❌ {errors.length}</span>
          )}
          {hasWarnings && (
            <span className={styles.compactIcon}>⚠️ {warnings.length}</span>
          )}
          {!hasErrors && !hasWarnings && (
            <span className={styles.compactIcon}>✅ {tableCount}</span>
          )}
          <span className={styles.expandIcon}>▼</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.validationStatus}>
      <button
        className={styles.closeButton}
        onClick={() => setIsCollapsed(true)}
        title="Hide validation details"
      >
        ✕
      </button>

      {hasErrors && (
        <div
          className={`${styles.validationSection} ${styles.validationErrors}`}
        >
          <div className={styles.validationHeader}>
            <span className={styles.validationIcon}>❌</span>
            <strong>Errors ({errors.length})</strong>
          </div>
          <ul className={styles.validationList}>
            {errors.map((error, index) => (
              <li key={index} className={styles.validationItem}>
                <span className={styles.validationLocation}>
                  Line {error.line}:
                </span>
                <span className={styles.validationMessage}>
                  {error.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasWarnings && (
        <div
          className={`${styles.validationSection} ${styles.validationWarnings}`}
        >
          <div className={styles.validationHeader}>
            <span className={styles.validationIcon}>⚠️</span>
            <strong>Warnings ({warnings.length})</strong>
          </div>
          <ul className={styles.validationList}>
            {warnings.map((warning, index) => (
              <li key={index} className={styles.validationItem}>
                <span className={styles.validationLocation}>
                  Line {warning.line}:
                </span>
                <span className={styles.validationMessage}>
                  {warning.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasErrors && !hasWarnings && (
        <div
          className={`${styles.validationSection} ${styles.validationSuccess}`}
        >
          <div className={styles.validationHeader}>
            <span className={styles.validationIcon}>✅</span>
            <strong>Valid</strong>
          </div>
          <p className={styles.validationMessage}>
            Successfully parsed {tableCount}{" "}
            {tableCount === 1 ? "table" : "tables"}
          </p>
        </div>
      )}
    </div>
  );
};
