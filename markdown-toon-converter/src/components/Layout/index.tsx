import { FC } from "react";
import styles from "./index.module.css";
import HeaderLayout from "@components/HeaderLayout";
import EditorSection from "@components/EditorSection";
import PreviewSection from "@components/PreviewSection";
import { Toast } from "@components/Toast";
import { useToast } from "@hooks/useToast";

const Layout: FC = () => {
  const { toasts, hideToast } = useToast();

  return (
    <div className="app">
      <div className={styles.layoutContainer}>
        <HeaderLayout />
      </div>

      <main className="app-main">
        <EditorSection />

        <PreviewSection />
      </main>

      <footer className="app-footer">
        <p>
          Token-Oriented Object Notation (TOON) - Efficient data format for AI
        </p>
        <span>© Gedar - 2026</span>
      </footer>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Layout;
