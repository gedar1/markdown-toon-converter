/**
 * Main App component for Markdown → TOON Converter.
 *
 * This component provides the main application structure with:
 * - Editor for Markdown content
 * - Preview panel with TOON/HTML/JSON modes
 * - Controls for import/export and templates
 * - Token metrics display
 *
 * Validates: Requirements 15.1, 15.2, 15.5
 */

import { useEffect } from "react";
import "./App.css";
import { useToast } from "@hooks/useToast";
import Layout from "@components/Layout";
import { AppProvider } from "@context/AppContext";

const AppContent = () => {
  const { showInfo } = useToast();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        showInfo("Keyboard shortcuts: Ctrl+K (this help)");
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [showInfo]);

  return <Layout />;
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
