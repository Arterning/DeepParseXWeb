'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Link } from '@tiptap/extension-link';
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Link2,
  Unlink2,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Code,
  Highlighter,
  Quote,
  Minus,
  Palette,
  Check,
  Loader2,
} from 'lucide-react';
import { querySysDocDetail } from '@/lib/api/doc';
import { updateDocMeta } from '@/lib/api/doc_dir';

// FortuneSheet must not be SSR'd (it uses browser APIs on import)
const SheetEditor = dynamic(() => import('./sheet-editor'), { ssr: false });

// ── Types ────────────────────────────────────────────────────────────────────
type SaveStatus = 'saved' | 'saving' | 'unsaved';

// ── Toolbar button helper ─────────────────────────────────────────────────────
function ToolBtn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor losing focus
        onClick();
      }}
      className={[
        'flex items-center justify-center w-7 h-7 rounded text-sm transition-colors',
        active
          ? 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
        disabled ? 'opacity-30 pointer-events-none' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

function ToolSep() {
  return <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />;
}

// ── Word editor (TipTap) ──────────────────────────────────────────────────────
function WordEditor({
  initialContent,
  onUpdate,
}: {
  initialContent: string | null | undefined;
  onUpdate: (html: string) => void;
}) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: '开始输入内容...' }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-500 underline' } }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onUpdate(editor.getHTML());
      }, 2000);
    },
  });

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleAddLink = () => {
    const url = window.prompt('输入链接地址：');
    if (url) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const handleInsertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-4 py-1.5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        {/* History */}
        <ToolBtn title="撤销 (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="重做 (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolSep />

        {/* Headings */}
        <ToolBtn
          title="标题1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="标题2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolSep />

        {/* Text formatting */}
        <ToolBtn title="加粗 (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="斜体 (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="下划线 (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="删除线" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="行内代码" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolSep />

        {/* Color */}
        <div className="relative">
          <ToolBtn title="文字颜色" onClick={() => colorInputRef.current?.click()}>
            <Palette className="w-3.5 h-3.5" />
          </ToolBtn>
          <input
            ref={colorInputRef}
            type="color"
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </div>
        <ToolBtn
          title="高亮"
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
        >
          <Highlighter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolSep />

        {/* Alignment */}
        <ToolBtn title="左对齐" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="居中" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="右对齐" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="两端对齐" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <AlignJustify className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolSep />

        {/* Lists */}
        <ToolBtn title="无序列表" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="有序列表" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolSep />

        {/* Block elements */}
        <ToolBtn title="引用" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="分割线" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="插入表格" onClick={handleInsertTable}>
          <TableIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolSep />

        {/* Link */}
        <ToolBtn title="插入链接" active={editor.isActive('link')} onClick={handleAddLink}>
          <Link2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="移除链接" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink2 className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* Document canvas (Google Docs-style: gray bg, white page) */}
      <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-800 py-8 px-4">
        <div className="mx-auto bg-white dark:bg-slate-950 shadow-md rounded min-h-[1122px] max-w-[816px] px-[96px] py-[96px]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

// ── Main editor page ─────────────────────────────────────────────────────────
export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const docId = Number(params.id);

  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [docTitle, setDocTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const titleSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load document
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }

    querySysDocDetail(docId)
      .then((result) => {
        setDoc(result);
        setDocTitle(result.title || result.name || '未命名文档');
      })
      .catch(() => router.push('/dashboard/dirs'))
      .finally(() => setIsLoading(false));
  }, [docId, router]);

  // Auto-save content
  const handleContentUpdate = useCallback(
    (content: string) => {
      setSaveStatus('unsaved');
      if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
      contentSaveTimer.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          await updateDocMeta(docId, { content });
          setSaveStatus('saved');
        } catch {
          setSaveStatus('unsaved');
        }
      }, 2000);
    },
    [docId],
  );

  // Auto-save title
  const handleTitleChange = (value: string) => {
    setDocTitle(value);
    setSaveStatus('unsaved');
    if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
    titleSaveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updateDocMeta(docId, { title: value, name: value });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('unsaved');
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
      if (contentSaveTimer.current) clearTimeout(contentSaveTimer.current);
    };
  }, []);

  // ── Loading screen ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isSheet = doc?.type === 'excel';

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          title="返回"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Doc icon */}
        <div
          className={`w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold shrink-0 ${
            isSheet ? 'bg-green-500' : 'bg-blue-500'
          }`}
        >
          {isSheet ? '表' : 'W'}
        </div>

        {/* Editable title */}
        {isEditingTitle ? (
          <input
            autoFocus
            className="flex-1 min-w-0 text-base font-medium bg-transparent border-b-2 border-blue-500 outline-none px-1"
            value={docTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
          />
        ) : (
          <button
            className="flex-1 min-w-0 text-left text-base font-medium truncate hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-0.5 rounded transition-colors"
            onClick={() => setIsEditingTitle(true)}
            title="点击编辑标题"
          >
            {docTitle}
          </button>
        )}

        {/* Save status */}
        <div className="shrink-0 flex items-center gap-1.5 text-sm">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
              <span className="text-slate-400">保存中...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-slate-400">已保存</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <span className="text-amber-500">未保存</span>
          )}
        </div>
      </header>

      {/* ── Editor area ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {isSheet ? (
          <SheetEditor
            initialContent={doc?.content}
            onUpdate={handleContentUpdate}
          />
        ) : (
          <WordEditor
            initialContent={doc?.content}
            onUpdate={handleContentUpdate}
          />
        )}
      </div>
    </div>
  );
}
