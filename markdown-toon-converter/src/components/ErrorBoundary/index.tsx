import { Component, ReactNode } from 'react';
import styles from './index.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo: errorInfo.componentStack || null,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    globalThis.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorBoundaryContent}>
            <div className={styles.errorBoundaryIcon}>⚠️</div>
            <h1>Oops! Something went wrong</h1>
            <p className={styles.errorBoundaryMessage}>
              The application encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            {this.state.error && (
              <details className={styles.errorBoundaryDetails}>
                <summary>Error Details</summary>
                <div className={styles.errorBoundaryStack}>
                  <strong>Error:</strong> {this.state.error.message}
                  {this.state.errorInfo && (
                    <>
                      <br />
                      <strong>Component Stack:</strong>
                      <pre>{this.state.errorInfo}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className={styles.errorBoundaryActions}>
              <button onClick={this.handleReset} className={`${styles.errorBoundaryButton} ${styles.errorBoundaryButtonPrimary}`}>
                Try Again
              </button>
              <button onClick={this.handleReload} className={`${styles.errorBoundaryButton} ${styles.errorBoundaryButtonSecondary}`}>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
