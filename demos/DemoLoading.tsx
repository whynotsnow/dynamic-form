import React from 'react';
import { Spin } from 'antd';
import styles from './DemoLoading.module.css';

interface DemoLoadingProps {
  message?: string;
}

const DemoLoading: React.FC<DemoLoadingProps> = ({ message = '正在加载 demo…' }) => (
  <div className={styles.loading} role="status" aria-live="polite">
    <Spin />
    <span>{message}</span>
  </div>
);

export default DemoLoading;
