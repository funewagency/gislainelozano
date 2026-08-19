'use client';

import { useCallback, useRef, useEffect, useState, memo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $generateNodesFromDOM } from '@lexical/html';
import { HeadingNode, $createHeadingNode, $isHeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode, $createListNode, $createListItemNode, $isListNode, $isListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode, $isLinkNode, $createLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $getRoot, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_LOW, $isElementNode,
  $createParagraphNode, $createTextNode, $setSelection,
  UNDO_COMMAND, REDO_COMMAND,
} from 'lexical';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Link2, Undo2, Redo2, X } from 'lucide-react';
import { C } from '@/components/gislaine/constants';

const PLACEHOLDER_TEXT = 'Escreva aqui...';



const theme = {
  ltr: 'text-left',
  rtl: 'text-right',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2 text-lg font-semibold',
    h3: 'editor-heading-h3 text-base font-medium',
  },
  list: {
    ul: 'editor-list-ul list-disc pl-5',
    ol: 'editor-list-ol list-decimal pl-5',
    listitem: 'editor-listitem',
  },
  link: 'editor-link underline cursor-pointer',
  text: {
    bold: 'font-bold',
    italic: 'italic',
  },
};

function onError(error: Error) {
  console.error('[Lexical]', error);
}

function HtmlInitializer({ html, onInitialized }: { html: string; onInitialized?: () => void }) {
  const [editor] = useLexicalComposerContext();
  const lastHtml = useRef(html);

  useEffect(() => {
    if (!html) {
      onInitialized?.();
      return;
    }
    if (lastHtml.current === html) {
      onInitialized?.();
      return;
    }
    lastHtml.current = html;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);

      const root = $getRoot();
      root.clear();

      for (const node of nodes) {
        root.append(node);
      }
    });

    onInitialized?.();
  }, [editor, html, onInitialized]);

  return null;
}

function Toolbar({ htmlRef }: { htmlRef: React.MutableRefObject<string> }) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [blockType, setBlockType] = useState<'paragraph' | 'h2' | 'h3' | 'bullet' | 'number'>('paragraph');

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setIsBold(false);
          setIsItalic(false);
          setIsLink(false);
          return false;
        }

        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));

        const node = selection.getNodes()[0];
        if (node) {
          const parent = node.getParentOrThrow();
          if ($isListNode(parent)) {
            setBlockType(parent.getListType() === 'bullet' ? 'bullet' : 'number');
          } else if ($isHeadingNode(parent)) {
            setBlockType(parent.getTag() === 'h2' ? 'h2' : 'h3');
          } else {
            setBlockType('paragraph');
          }

          const linkParent = node.getParent();
          setIsLink(linkParent !== null && $isLinkNode(linkParent));
        }

        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  const formatText = useCallback((type: 'bold' | 'italic') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  }, [editor]);

  const toggleHeading = useCallback((tag: 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const nodes = selection.getNodes();
      const target = nodes[0];
      if (!target) return;

      const parent = target.getParentOrThrow();

      if ($isHeadingNode(parent) && parent.getTag() === tag) {
        const p = $createParagraphNode();
        p.append(...parent.getChildren());
        parent.replace(p);
      } else if ($isHeadingNode(parent)) {
        parent.setTag(tag);
      } else {
        const heading = $createHeadingNode(tag);
        const text = $createTextNode(target.getTextContent());
        heading.append(text);
        parent.replace(heading, true);
      }
    });
  }, [editor]);

  const toggleList = useCallback((type: 'bullet' | 'number') => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const nodes = selection.getNodes();
      const target = nodes[0];
      if (!target) return;

      const parent = target.getParentOrThrow();

      if ($isListNode(parent)) {
        const p = $createParagraphNode();
        p.append(...parent.getChildren());
        parent.replace(p);
      } else {
        const list = $createListNode(type === 'bullet' ? 'bullet' : 'number');
        const item = $createListItemNode();
        item.append($createTextNode(target.getTextContent()));
        list.append(item);
        target.getParentOrThrow().replace(list, true);
      }
    });
  }, [editor]);

  const toggleLink = useCallback(() => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      setIsLink(false);
      setShowLinkInput(false);
    } else {
      setShowLinkInput(true);
    }
  }, [editor, isLink]);

  const applyLink = useCallback(() => {
    if (linkUrl) {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      <ToolbarButton
        active={isBold}
        onClick={() => formatText('bold')}
        label="Negrito"
        icon={<Bold size={14} />}
      />
      <ToolbarButton
        active={isItalic}
        onClick={() => formatText('italic')}
        label="Itálico"
        icon={<Italic size={14} />}
      />
      <div className="w-px h-5 mx-1" style={{ backgroundColor: C.border }} />
      <ToolbarButton
        active={blockType === 'h2'}
        onClick={() => toggleHeading('h2')}
        label="Título 2"
        icon={<Heading2 size={14} />}
      />
      <ToolbarButton
        active={blockType === 'h3'}
        onClick={() => toggleHeading('h3')}
        label="Título 3"
        icon={<Heading3 size={14} />}
      />
      <div className="w-px h-5 mx-1" style={{ backgroundColor: C.border }} />
      <ToolbarButton
        active={blockType === 'bullet'}
        onClick={() => toggleList('bullet')}
        label="Lista"
        icon={<List size={14} />}
      />
      <ToolbarButton
        active={blockType === 'number'}
        onClick={() => toggleList('number')}
        label="Lista Numerada"
        icon={<ListOrdered size={14} />}
      />
      <div className="w-px h-5 mx-1" style={{ backgroundColor: C.border }} />
      {showLinkInput ? (
        <div className="flex items-center gap-1 px-1">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="URL..."
            className="w-32 px-2 py-1.5 text-xs outline-none"
            style={{ border: `1px solid ${C.border}`, color: C.text, backgroundColor: C.white, borderRadius: 0 }}
            onKeyDown={(e) => { if (e.key === 'Enter') applyLink(); }}
            autoFocus
          />
          <button
            onClick={applyLink}
            className="px-1.5 py-1 text-xs font-medium"
            style={{ color: C.white, backgroundColor: C.accent, borderRadius: 0 }}
          >
            OK
          </button>
          <button
            onClick={() => setShowLinkInput(false)}
            className="p-1"
            style={{ color: C.muted }}
            aria-label="Fechar"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <ToolbarButton
          active={isLink}
          onClick={toggleLink}
          label="Link"
          icon={<Link2 size={14} />}
        />
      )}
      <div className="flex-1" />
      <ToolbarButton
        active={false}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        label="Desfazer"
        icon={<Undo2 size={14} />}
      />
      <ToolbarButton
        active={false}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        label="Refazer"
        icon={<Redo2 size={14} />}
      />
    </div>
  );
}

const ToolbarButton = memo(function ToolbarButton(raw: {
  active?: boolean;
  onClick?: () => void;
  label?: string;
  icon: React.ReactNode;
}) {
  const { active = false, onClick = () => {}, label = '', icon } = raw ?? {};
  return (
    <button
      onClick={onClick}
      className="p-2 transition-colors"
      style={{
        color: active ? C.accent : C.muted,
        backgroundColor: active ? `${C.accent}10` : 'transparent',
        borderRadius: 0,
      }}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
});

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LexicalRichTextField(raw: Props) {
  const { label = '', value = '', onChange = () => {}, placeholder } = raw ?? {};
  const htmlRef = useRef(value);
  const initialized = useRef(false);

  const initialConfig = {
    namespace: 'cms-editor',
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider" style={{ color: C.muted }}>
        {label}
      </label>
      <div className="border" style={{ borderColor: C.border, backgroundColor: C.white }}>
        <LexicalComposer initialConfig={initialConfig}>
          <Toolbar htmlRef={htmlRef} />
          <HistoryPlugin />
          <HtmlInitializer html={value} onInitialized={() => { initialized.current = true; }} />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              if (!initialized.current) return;
              editorState.read(() => {
                htmlRef.current = $generateHtmlFromNodes(editor, null);
              });
              onChange(htmlRef.current);
            }}
          />
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="min-h-[120px] px-3 py-2 text-sm outline-none"
                  style={{ color: C.text }}
                  aria-placeholder={placeholder ?? PLACEHOLDER_TEXT}
                  placeholder={
                    <div className="absolute top-2 left-3 text-sm pointer-events-none select-none" style={{ color: C.placeholder }}>
                      {placeholder ?? PLACEHOLDER_TEXT}
                    </div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
}
