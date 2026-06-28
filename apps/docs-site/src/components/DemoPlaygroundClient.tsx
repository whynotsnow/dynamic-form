import React, { useEffect, useMemo, useState } from 'react';
import 'antd/dist/reset.css';
import Heading from '@theme/Heading';
import { DEMO_COMPONENTS, type DemoType } from '../../../../demos/demoRegistry';
import styles from './DemoPlaygroundClient.module.css';

const DEFAULT_DEMO: DemoType = 'storeBoundary';

const isDemoType = (value: string | null): value is DemoType => {
  return value != null && Object.prototype.hasOwnProperty.call(DEMO_COMPONENTS, value);
};

const readDemoFromUrl = (): DemoType => {
  if (typeof window === 'undefined') {
    return DEFAULT_DEMO;
  }

  const url = new URL(window.location.href);
  const requestedDemo = url.searchParams.get('demo');

  if (isDemoType(requestedDemo)) {
    return requestedDemo;
  }

  if (requestedDemo != null) {
    url.searchParams.set('demo', DEFAULT_DEMO);
    window.history.replaceState(null, '', url);
  }

  return DEFAULT_DEMO;
};

const writeDemoToUrl = (demoKey: DemoType) => {
  const url = new URL(window.location.href);
  url.searchParams.set('demo', demoKey);
  window.history.pushState(null, '', url);
};

export default function DemoPlaygroundClient(): JSX.Element {
  const [currentDemo, setCurrentDemo] = useState<DemoType>(() => readDemoFromUrl());
  const demoEntries = useMemo(() => Object.entries(DEMO_COMPONENTS) as Array<[DemoType, (typeof DEMO_COMPONENTS)[DemoType]]>, []);
  const currentDemoInfo = DEMO_COMPONENTS[currentDemo];
  const CurrentDemo = currentDemoInfo.component;

  useEffect(() => {
    const handlePopState = () => {
      setCurrentDemo(readDemoFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleDemoChange = (demoKey: DemoType) => {
    if (demoKey === currentDemo) {
      return;
    }

    setCurrentDemo(demoKey);
    writeDemoToUrl(demoKey);
  };

  return (
    <div className="container">
      <div className={styles.shell}>
        <aside className={styles.sidebar} aria-label="DynamicForm demos">
          <div className={styles.sidebarHeader}>
            <Heading as="h1">Playground</Heading>
            <p>
              选择一个 demo 查看交互效果。 / Select a demo to inspect the interactive behavior.
            </p>
          </div>

          {demoEntries.map(([demoKey, demo]) => (
            <button
              aria-current={demoKey === currentDemo ? 'page' : undefined}
              className={`${styles.demoButton} ${
                demoKey === currentDemo ? styles.demoButtonActive : ''
              }`}
              key={demoKey}
              onClick={() => handleDemoChange(demoKey)}
              type="button"
            >
              {demo.title}
            </button>
          ))}
        </aside>

        <section className={styles.content}>
          <header className={styles.intro}>
            <Heading as="h2">{currentDemoInfo.title}</Heading>
            <p>{currentDemoInfo.description}</p>
          </header>

          <div className={styles.demoFrame}>
            <CurrentDemo />
          </div>
        </section>
      </div>
    </div>
  );
}
