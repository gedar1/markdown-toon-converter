import { FC, ReactNode } from "react";
import styles from "./index.module.css";
import { TokenMetrics } from "../TokenMetrics";
import { useTheme } from "@hooks/useTheme";
import luna from "@assets/icons/luna.png"
import sol from "@assets/icons/sol.png"

interface HeaderLayoutProps {
  children?: ReactNode;
}

export const HeaderLayout: FC<HeaderLayoutProps> = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.headerLayoutContainer}>
      <header className={styles.appHeader}>
        <div className={styles.headerTop}>
          <div className={styles.headerContent}>
            <h1>Markdown → TOON Converter</h1>
            <p>
              Convert Markdown documentation to TOON format for efficient AI
              context
            </p>
          </div>
        </div>
      </header>
      <div className="metrics-container">
        <TokenMetrics />
      </div>
      <div>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <img src={ theme === "light" ? luna : sol } alt="Export" className={styles.buttonIcon} />
          {/* {theme === "light" ? "🌙" : "☀️"} */}
        </button>
      </div>
    </div>
  );
};

export default HeaderLayout;
