import React from 'react';

function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

function renderBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '');
}

interface RenderContentProps {
  children?: string;
  content?: string;
  as?: 'span' | 'div' | 'p';
  className?: string;
  style?: React.CSSProperties;
  accentColor?: string;
}

export function RenderContent({ children, content, as: Tag = 'span', className, style, accentColor }: RenderContentProps) {
  const text = content ?? children;
  if (!text) return null;

  if (isHtml(text)) {
    const clean = sanitizeHtml(text);
    return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  return (
    <Tag className={className} style={style}>
      {renderBold(text)}
    </Tag>
  );
}
