import React from 'react';
import Translate from '@docusaurus/Translate';
import styles from './SiteContentErrorBoundary.module.css';

interface SiteContentErrorBoundaryProps {
  children: React.ReactNode;
  context: string;
}

interface SiteContentErrorBoundaryState {
  attempt: number;
  error: Error | null;
}

export default class SiteContentErrorBoundary extends React.Component<
  SiteContentErrorBoundaryProps,
  SiteContentErrorBoundaryState
> {
  state: SiteContentErrorBoundaryState = { attempt: 0, error: null };

  static getDerivedStateFromError(error: Error): Pick<SiteContentErrorBoundaryState, 'error'> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[SiteContentErrorBoundary:${this.props.context}] render failed`,
      error,
      errorInfo
    );
  }

  private handleRetry = () => {
    this.setState((state) => ({ attempt: state.attempt + 1, error: null }));
  };

  render() {
    if (this.state.error) {
      return (
        <section className={styles.fallback} role="alert">
          <h3>
            <Translate id="site.errorBoundary.title">此内容暂时无法显示</Translate>
          </h3>
          <p>
            <Translate id="site.errorBoundary.description">
              此区域遇到渲染错误，页面中的其他内容仍可继续使用。
            </Translate>
          </p>
          <button
            className="button button--secondary button--sm"
            onClick={this.handleRetry}
            type="button"
          >
            <Translate id="site.errorBoundary.retry">重试</Translate>
          </button>
        </section>
      );
    }

    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}
