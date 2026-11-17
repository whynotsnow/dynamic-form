import React, { createContext, useCallback, useContext } from 'react';
import demoI18nCatalog from './demoI18n.catalog.json';

export type DemoLocale = 'zh-CN' | 'en';
export type DemoTranslator = (zh: string, en: string) => string;

const defaultTranslator: DemoTranslator = (zh) => zh;
const demoI18nContextKey = Symbol.for('dynamic-form.docs-demo-i18n-context');
const sharedContexts = globalThis as unknown as Record<symbol, React.Context<DemoTranslator>>;
const DemoI18nContext =
  sharedContexts[demoI18nContextKey] ??
  (sharedContexts[demoI18nContextKey] = createContext<DemoTranslator>(defaultTranslator));

export const DemoI18nProvider: React.FC<{
  locale: DemoLocale;
  children: React.ReactNode;
}> = ({ locale, children }) => {
  const translate = useCallback<DemoTranslator>((zh, en) => (locale === 'en' ? en : zh), [locale]);
  return <DemoI18nContext.Provider value={translate}>{children}</DemoI18nContext.Provider>;
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
const sharedMessages = demoI18nCatalog.sharedMessages as Record<string, string>;

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
        return [key, sharedMessages[entry] ? translate(entry, sharedMessages[entry]) : entry];
      }
      return [key, translateDemoConfig(entry, translate)];
    })
  ) as T;
  const translations = existingTranslations ?? new WeakMap<DemoTranslator, unknown>();
  translations.set(translate, translated);
  if (!existingTranslations) translatedConfigCache.set(value, translations);
  return translated;
};
