import { useMemo } from "react";
import { useServices } from "@context/ServicesContext";
import { useAppContext } from "@context/AppContext";
import chartIcon from "@assets/icons/corazon-pulso-50.png";
import styles from "./index.module.css";

export const TokenMetrics = () => {
  const { content } = useAppContext();
  const { tokenMetricsService, converter } = useServices();

  const metrics = useMemo(() => {
    if (!content.trim()) {
      return null;
    }

    try {
      const markdownContent = content;
      // Convert to TOON
      const toonContent = converter.markdownToToon(content);

      return tokenMetricsService.calculate(toonContent, markdownContent);
    } catch (error) {
      return null;
    }
  }, [content, tokenMetricsService, converter]);

  if (!metrics) {
    return (
      <div className={styles.tokenMetrics}>
        <img src={chartIcon} alt="Import" className={styles.buttonIcon} />{" "}
        <p className={styles.metricsEmpty}>
          Enter content to see token savings
        </p>
      </div>
    );
  }

  const savingsColor = metrics.savingsPercent > 0 ? "#10b981" : "#ef4444";

  return (
    <div className={styles.tokenMetrics}>
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>TOON Tokens</div>
          <div className={styles.metricValue}>
            {metrics.toonTokens.toLocaleString()}
          </div>
          {/* <div className={styles.metricSublabel}>{metrics.toonBytes} bytes</div> */}
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Markdown Tokens</div>
          <div className={styles.metricValue}>
            {metrics.markdownTokens.toLocaleString()}
          </div>
          {/* <div className={styles.metricSublabel}>
            {metrics.markdownBytes} bytes
          </div> */}
        </div>

        <div className={`${styles.metricCard} ${styles.metricCardHighlight}`}>
          <div className={styles.metricLabel}>Savings</div>
          <div className={styles.metricValue} style={{ color: savingsColor }}>
            {metrics.savingsPercent > 0 ? "+" : ""}
            {metrics.savingsPercent}%
          </div>
          <div className={styles.metricSublabel}>
            {metrics.savingsPercent > 0
              ? `${metrics.markdownTokens - metrics.toonTokens} tokens saved`
              : "Markdown is more efficient"}
          </div>
        </div>
      </div>
    </div>
  );
};
