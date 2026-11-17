import { useInitHandlers } from '@/exports';
import type { InitConfig } from '@/consumer/effects';

const defaultDemoInitConfig: InitConfig = {
  enabled: true,
  handlers: [],
  options: { override: false },
  debug: true
};

export const useDemoInitHandlers = (config: Partial<InitConfig> = {}) => {
  return useInitHandlers({
    ...defaultDemoInitConfig,
    ...config,
    options: {
      ...defaultDemoInitConfig.options,
      ...config.options
    }
  });
};
