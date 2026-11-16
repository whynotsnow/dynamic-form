import React, { createContext, useContext, useLayoutEffect } from 'react';
import { Spin } from 'antd';
import styles from './DemoLoading.module.css';

export interface DemoLoadingContextValue {
  onLoadingChange: (loading: boolean) => void;
}

export const DemoLoadingContext = createContext<DemoLoadingContextValue | null>(null);
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? React.useEffect : useLayoutEffect;

interface DemoLoadingProps {
  message?: string;
}

export const DemoLoadingView: React.FC<DemoLoadingProps> = ({ message = '正在加载 demo…' }) => (
  <div className={styles.loading} role="status" aria-live="polite">
    <Spin />
    <span>{message}</span>
  </div>
);

const DemoLoading: React.FC<DemoLoadingProps> = ({ message }) => {
  const loadingContext = useContext(DemoLoadingContext);

  useIsomorphicLayoutEffect(() => {
    if (!loadingContext) {
      return;
    }

    loadingContext.onLoadingChange(true);
    return () => loadingContext.onLoadingChange(false);
  }, [loadingContext]);

  if (loadingContext) {
    return null;
  }

  return <DemoLoadingView message={message} />;
};

export default DemoLoading;
