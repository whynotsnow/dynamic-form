import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { demoMessages, demoSampleValues } from './demoI18n/index';

export type DemoLocale = 'zh-CN' | 'en';
export type DemoTranslator = ((zh: string, en: string) => string) & {
  translateDemoConfig: <T>(value: T) => T;
  translateDemoValues: <T>(value: T) => T;
};

const defaultTranslator: DemoTranslator = Object.assign((zh: string) => zh, {
  translateDemoConfig: <T,>(value: T) => value,
  translateDemoValues: <T,>(value: T) => value
});
const demoI18nContextKey = Symbol.for('dynamic-form.docs-demo-i18n-context');
const sharedContexts = globalThis as unknown as Record<symbol, React.Context<DemoTranslator>>;
const DemoI18nContext =
  sharedContexts[demoI18nContextKey] ??
  (sharedContexts[demoI18nContextKey] = createContext<DemoTranslator>(defaultTranslator));

export const DemoI18nProvider: React.FC<{
  locale: DemoLocale;
  children: React.ReactNode;
}> = ({ locale, children }) => {
  const translate = useCallback((zh: string, en: string) => (locale === 'en' ? en : zh), [locale]);
  const localizedTranslator = useMemo<DemoTranslator>(() => {
    const translator = Object.assign(translate, {
      translateDemoConfig: <T,>(value: T) => value,
      translateDemoValues: <T,>(value: T) => value
    });
    translator.translateDemoConfig = <T,>(value: T) => translateDemoConfig(value, translator);
    translator.translateDemoValues = <T,>(value: T) => translateDemoValues(value, translator);
    return translator;
  }, [translate]);
  return (
    <DemoI18nContext.Provider value={localizedTranslator}>{children}</DemoI18nContext.Provider>
  );
};

export const useDemoT = (): DemoTranslator => useContext(DemoI18nContext);

const displayPropertyNames = new Set([
  'description',
  'extra',
  'initialValue',
  'label',
  'message',
  'placeholder',
  'title',
  'unit'
]);
const translatedConfigCache = new WeakMap<object, WeakMap<DemoTranslator, unknown>>();
const translatedValuesCache = new WeakMap<object, WeakMap<DemoTranslator, unknown>>();
const translateDisplayString = (value: string, translate: DemoTranslator): string => {
  const english = demoMessages[value] ?? demoSampleValues[value];
  return english ? translate(value, english) : value;
};

export const translateDemoValues = <T,>(value: T, translate: DemoTranslator): T => {
  if (typeof value === 'string') return translateDisplayString(value, translate) as T;
  if (Array.isArray(value)) return value.map((item) => translateDemoValues(item, translate)) as T;
  if (!value || typeof value !== 'object') return value;

  const existingTranslations = translatedValuesCache.get(value);
  if (existingTranslations?.has(translate)) {
    return existingTranslations.get(translate) as T;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return value;

  const translated = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, translateDemoValues(entry, translate)])
  ) as T;
  const translations = existingTranslations ?? new WeakMap<DemoTranslator, unknown>();
  translations.set(translate, translated);
  if (!existingTranslations) translatedValuesCache.set(value, translations);
  return translated;
};

export const translateDemoConfig = <T,>(value: T, translate: DemoTranslator): T => {
  if (!value || typeof value !== 'object') return value;

  const existingTranslations = translatedConfigCache.get(value);
  if (existingTranslations?.has(translate)) {
    return existingTranslations.get(translate) as T;
  }

  if (Array.isArray(value)) {
    const translated = value.map((item) => translateDemoConfig(item, translate)) as T;
    const translations = existingTranslations ?? new WeakMap<DemoTranslator, unknown>();
    translations.set(translate, translated);
    if (!existingTranslations) translatedConfigCache.set(value, translations);
    return translated;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return value;

  const translated = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (displayPropertyNames.has(key) && typeof entry === 'string') {
        return [key, translateDisplayString(entry, translate)];
      }
      if (key === 'value' && typeof entry === 'string' && demoSampleValues[entry]) {
        return [key, translate(entry, demoSampleValues[entry])];
      }
      if (key === 'initialValue' && typeof entry === 'function') {
        return [key, (...args: unknown[]) => translateDemoValues(entry(...args), translate)];
      }
      if (key === 'effect' && typeof entry === 'function') {
        return [key, (...args: unknown[]) => translateDemoConfig(entry(...args), translate)];
      }
      return [key, translateDemoConfig(entry, translate)];
    })
  ) as T;
  const translations = existingTranslations ?? new WeakMap<DemoTranslator, unknown>();
  translations.set(translate, translated);
  if (!existingTranslations) translatedConfigCache.set(value, translations);
  return translated;
};
