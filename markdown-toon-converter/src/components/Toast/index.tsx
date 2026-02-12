import { useEffect } from "react";
import styles from "./index.module.css";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export const Toast = ({
  message,
  type,
  onClose,
  duration = 3000,
}: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";

  return (
    <div
      className={`${styles.toast} ${styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}
    >
      <span className={styles.toastIcon}>{icon}</span>
      <span className={styles.toastMessage}>{message}</span>
      <button
        className={styles.toastClose}
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};
