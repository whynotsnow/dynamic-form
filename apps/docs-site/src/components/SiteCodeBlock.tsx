import React, { useMemo, useState } from 'react';
import { translate } from '@docusaurus/Translate';
import clsx from 'clsx';
import styles from './SiteCodeBlock.module.css';

const COLLAPSED_CODE_LINE_LIMIT = 12;
const COLLAPSED_CODE_LENGTH_LIMIT = 900;
const MAX_CODE_LINE_LENGTH = 100;

export interface SiteCodeBlockProps {
  code: string;
  language?: 'tsx' | 'ts' | 'json' | 'bash' | 'text';
  title?: React.ReactNode;
  copyCode?: string;
  showCopy?: boolean;
  defaultExpanded?: boolean;
  collapsedLineLimit?: number;
  collapsedLengthLimit?: number;
  className?: string;
  preClassName?: string;
}

function splitCodeByComma(source: string): string[] {
  const parts: string[] = [];
  let current = '';
  let quote: '"' | "'" | '`' | undefined;
  let escaped = false;

  for (const char of source) {
    if (quote) {
      current += char;

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      current += char;
      continue;
    }

    if (char === ',') {
      parts.push(`${current.trimEnd()},`);
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    parts.push(current.trimEnd());
  }

  return parts;
}

function formatInlineCode(source: string): string {
  const lines: string[] = [];
  let current = '';
  let indentLevel = 0;
  let quote: '"' | "'" | '`' | undefined;
  let escaped = false;

  const pushCurrent = () => {
    const value = current.trim();

    if (value) {
      lines.push(`${'  '.repeat(Math.max(indentLevel, 0))}${value}`);
    }

    current = '';
  };

  for (const char of source.trim()) {
    if (quote) {
      current += char;

      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      current += char;
      continue;
    }

    if (char === '{' || char === '[') {
      current += char;
      pushCurrent();
      indentLevel += 1;
      continue;
    }

    if (char === '}' || char === ']') {
      pushCurrent();
      indentLevel -= 1;
      current = char;
      continue;
    }

    if (char === ',') {
      current += char;
      pushCurrent();
      continue;
    }

    current += char;
  }

  pushCurrent();

  return lines.join('\n');
}

function wrapLongCodeLine(line: string): string {
  if (line.length <= MAX_CODE_LINE_LENGTH || !line.includes(',')) {
    return line;
  }

  const indentation = line.match(/^\s*/)?.[0] ?? '';
  const wrappedParts = splitCodeByComma(line.trim());

  if (wrappedParts.length <= 1) {
    return line;
  }

  return wrappedParts
    .map((part, index) => `${index === 0 ? indentation : `${indentation}  `}${part}`)
    .join('\n');
}

function formatCode(code: string, language: SiteCodeBlockProps['language']): string {
  const trimmedCode = code.trim();

  if (language === 'json') {
    try {
      return JSON.stringify(JSON.parse(trimmedCode), null, 2);
    } catch {
      return trimmedCode;
    }
  }

  const normalizedCode = trimmedCode.replace(/\n{3,}/g, '\n\n');
  const lines = normalizedCode.split('\n');

  if (lines.length === 1 && language !== 'bash' && language !== 'text') {
    return formatInlineCode(normalizedCode);
  }

  return lines.map(wrapLongCodeLine).join('\n');
}

export default function SiteCodeBlock({
  code,
  language = 'text',
  title,
  copyCode,
  showCopy = true,
  defaultExpanded = false,
  collapsedLineLimit = COLLAPSED_CODE_LINE_LIMIT,
  collapsedLengthLimit = COLLAPSED_CODE_LENGTH_LIMIT,
  className,
  preClassName
}: SiteCodeBlockProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const formattedCode = useMemo(() => formatCode(code, language), [code, language]);
  const shouldCollapse =
    formattedCode.split('\n').length > collapsedLineLimit ||
    formattedCode.length > collapsedLengthLimit;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyCode ?? code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={clsx(styles.codeBlock, className)}>
      {title || showCopy ? (
        <div className={styles.codeHeader}>
          {title ? <span>{title}</span> : <span>{language}</span>}
          {showCopy ? (
            <button onClick={handleCopy} type="button">
              {copied
                ? translate({ id: 'siteCodeBlock.copied', message: '已复制' })
                : translate({ id: 'siteCodeBlock.copy', message: '复制' })}
            </button>
          ) : null}
        </div>
      ) : null}
      <pre
        className={clsx(
          preClassName,
          shouldCollapse && !expanded ? styles.codeCollapsed : undefined
        )}
      >
        <code>{formattedCode}</code>
      </pre>
      {shouldCollapse ? (
        <button
          className={styles.codeFoldButton}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded
            ? translate({ id: 'siteCodeBlock.collapse', message: '收起代码' })
            : translate({ id: 'siteCodeBlock.expand', message: '展开代码' })}
        </button>
      ) : null}
    </div>
  );
}
