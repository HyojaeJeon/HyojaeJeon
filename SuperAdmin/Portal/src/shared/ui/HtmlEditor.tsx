'use client';

import { useState, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CharacterCount from '@tiptap/extension-character-count';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Typography from '@tiptap/extension-typography';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  ListChecks,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Table as TableIcon,
  Code,
  Quote,
  Minus,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Palette,
  Type,
  RemoveFormatting,
  Pilcrow,
  TableCellsMerge,
  TableCellsSplit,
  Trash2,
  RowsIcon,
  ColumnsIcon,
} from 'lucide-react';

/* ─────────────────────── Types ─────────────────────── */

interface HtmlEditorProps {
  value: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: number;
  maxLength?: number;
}

/* ─────────────────────── Font Size Custom Extension ─────────────────────── */

const FONT_SIZES = ['10', '11', '12', '13', '14', '16', '18', '20', '24', '28', '32', '36', '42', '48', '56', '72'];

const FONT_FAMILIES = [
  { value: '', label: 'Default' },
  { value: 'Pretendard', label: 'Pretendard' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
];

const COLOR_PRESETS = [
  '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
  '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
  '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC',
  '#DD7E6B', '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#A4C2F4', '#9FC5E8', '#B4A7D6', '#D5A6BD',
  '#CC4125', '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6D9EEB', '#6FA8DC', '#8E7CC3', '#C27BA0',
  '#A61C00', '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3C78D8', '#3D85C6', '#674EA7', '#A64D79',
  '#85200C', '#990000', '#B45F06', '#BF9000', '#38761D', '#134F5C', '#1155CC', '#0B5394', '#351C75', '#741B47',
  '#5B0F00', '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#1C4587', '#073763', '#20124D', '#4C1130',
];

/* ─────────────────────── Shared UI Pieces ─────────────────────── */

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
        active ? 'bg-primary/15 text-primary' : 'text-fg-muted hover:bg-surface-3 hover:text-fg'
      } ${disabled ? 'pointer-events-none opacity-30' : ''}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />;
}

/* ─────────────────────── Color Picker Dropdown ─────────────────────── */

function ColorPickerDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('#000000');
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative">
      <ToolbarButton onClick={() => setOpen(!open)} title="Text color">
        <Palette size={14} />
      </ToolbarButton>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 rounded-md border bg-surface-1 p-2 shadow-lg"
          style={{ borderColor: 'var(--border)', width: 224 }}
        >
          <div className="grid grid-cols-10 gap-0.5">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                className="h-5 w-5 rounded-sm border border-transparent hover:border-fg-muted"
                style={{ backgroundColor: c }}
                title={c}
                onClick={() => {
                  editor.chain().focus().setColor(c).run();
                  setOpen(false);
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
            <input
              type="color"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="h-6 w-6 cursor-pointer rounded border-0 p-0"
            />
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="h-6 flex-1 rounded border bg-surface-2 px-1.5 font-mono text-[10px] text-fg"
              style={{ borderColor: 'var(--border)' }}
            />
            <button
              type="button"
              className="h-6 rounded bg-primary px-2 text-[10px] text-primary-fg"
              onClick={() => {
                editor.chain().focus().setColor(custom).run();
                setOpen(false);
              }}
            >
              OK
            </button>
          </div>
          <button
            type="button"
            className="mt-1 w-full text-center text-[10px] text-fg-muted hover:text-fg"
            onClick={() => {
              editor.chain().focus().unsetColor().run();
              setOpen(false);
            }}
          >
            Reset color
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Font Size Dropdown ─────────────────────── */

function FontSizeDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);

  const current = editor.getAttributes('textStyle').fontSize as string | undefined;
  const displaySize = current ? current.replace('px', '') : '14';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Font size"
        className="flex h-7 items-center gap-0.5 rounded px-1.5 text-[11px] text-fg-muted hover:bg-surface-3 hover:text-fg"
      >
        <Type size={12} />
        <span className="min-w-[18px] text-center font-mono">{displaySize}</span>
        <span className="text-[8px]">▼</span>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-surface-1 py-1 shadow-lg"
          style={{ borderColor: 'var(--border)', minWidth: 60 }}
        >
          {FONT_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={`w-full px-3 py-1 text-left text-[12px] hover:bg-surface-3 ${displaySize === s ? 'bg-primary/10 font-semibold text-primary' : 'text-fg'}`}
              onClick={() => {
                editor.chain().focus().setMark('textStyle', { fontSize: `${s}px` }).run();
                setOpen(false);
              }}
            >
              {s}px
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Font Family Dropdown ─────────────────────── */

function FontFamilyDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);

  const current = editor.getAttributes('textStyle').fontFamily as string | undefined;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title="Font family"
        className="flex h-7 items-center gap-1 rounded px-1.5 text-[11px] text-fg-muted hover:bg-surface-3 hover:text-fg"
      >
        <span className="max-w-[80px] truncate">{current || 'Default'}</span>
        <span className="text-[8px]">▼</span>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-surface-1 py-1 shadow-lg"
          style={{ borderColor: 'var(--border)', minWidth: 140 }}
        >
          {FONT_FAMILIES.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`w-full px-3 py-1 text-left text-[12px] hover:bg-surface-3 ${current === f.value ? 'bg-primary/10 font-semibold text-primary' : 'text-fg'}`}
              style={{ fontFamily: f.value || undefined }}
              onClick={() => {
                if (f.value) editor.chain().focus().setFontFamily(f.value).run();
                else editor.chain().focus().unsetFontFamily().run();
                setOpen(false);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Table Controls Dropdown ─────────────────────── */

function TableDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const isInTable = editor.isActive('table');

  return (
    <div className="relative">
      <ToolbarButton onClick={() => setOpen(!open)} active={isInTable} title="Table">
        <TableIcon size={14} />
      </ToolbarButton>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 rounded-md border bg-surface-1 p-1 shadow-lg"
          style={{ borderColor: 'var(--border)', minWidth: 180 }}
        >
          {!isInTable ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[12px] text-fg hover:bg-surface-3"
              onClick={() => {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                setOpen(false);
              }}
            >
              <TableIcon size={13} /> Insert 3×3 table
            </button>
          ) : (
            <>
              <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[12px] text-fg hover:bg-surface-3" onClick={() => { editor.chain().focus().addRowAfter().run(); setOpen(false); }}>
                <RowsIcon size={13} /> Add row below
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[12px] text-fg hover:bg-surface-3" onClick={() => { editor.chain().focus().addColumnAfter().run(); setOpen(false); }}>
                <ColumnsIcon size={13} /> Add column right
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[12px] text-fg hover:bg-surface-3" onClick={() => { editor.chain().focus().deleteRow().run(); setOpen(false); }}>
                <RowsIcon size={13} /> Delete row
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[12px] text-fg hover:bg-surface-3" onClick={() => { editor.chain().focus().deleteColumn().run(); setOpen(false); }}>
                <ColumnsIcon size={13} /> Delete column
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[12px] text-fg hover:bg-surface-3" onClick={() => { editor.chain().focus().mergeCells().run(); setOpen(false); }}>
                <TableCellsMerge size={13} /> Merge cells
              </button>
              <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[12px] text-fg hover:bg-surface-3" onClick={() => { editor.chain().focus().splitCell().run(); setOpen(false); }}>
                <TableCellsSplit size={13} /> Split cell
              </button>
              <div className="my-0.5 h-px bg-border" />
              <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[12px] text-danger hover:bg-danger-soft" onClick={() => { editor.chain().focus().deleteTable().run(); setOpen(false); }}>
                <Trash2 size={13} /> Delete table
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Link Popover ─────────────────────── */

function LinkPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    setUrl('');
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleApply = () => {
    if (url.trim()) {
      const href = url.match(/^https?:\/\//) ? url.trim() : `https://${url.trim()}`;
      editor.chain().focus().setLink({ href, target: '_blank' }).run();
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <ToolbarButton onClick={handleOpen} active={editor.isActive('link')} title={editor.isActive('link') ? 'Remove link' : 'Insert link'}>
        {editor.isActive('link') ? <Unlink size={14} /> : <LinkIcon size={14} />}
      </ToolbarButton>
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 flex items-center gap-1.5 rounded-md border bg-surface-1 p-2 shadow-lg"
          style={{ borderColor: 'var(--border)', minWidth: 300 }}
        >
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleApply(); }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder="https://example.com"
            className="h-7 flex-1 rounded border bg-surface-2 px-2 text-[12px] text-fg outline-none focus:ring-1 focus:ring-primary"
            style={{ borderColor: 'var(--border)' }}
          />
          <button
            type="button"
            className="h-7 rounded bg-primary px-3 text-[11px] font-medium text-primary-fg"
            onClick={handleApply}
          >
            Apply
          </button>
          <button
            type="button"
            className="h-7 rounded px-2 text-[11px] text-fg-muted hover:text-fg"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Toolbar ─────────────────────── */

function Toolbar({ editor }: { editor: Editor }) {

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Row 1: Undo/Redo + Heading + Font */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph') && !editor.isActive('heading')} title="Paragraph">
        <Pilcrow size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
        <Heading1 size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
        <Heading3 size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="Heading 4">
        <Heading4 size={14} />
      </ToolbarButton>

      <Divider />

      <FontFamilyDropdown editor={editor} />
      <FontSizeDropdown editor={editor} />

      <Divider />

      {/* Text formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
        <UnderlineIcon size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <Strikethrough size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
        <Code size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
        <Highlighter size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
        <SubscriptIcon size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
        <SuperscriptIcon size={14} />
      </ToolbarButton>

      <ColorPickerDropdown editor={editor} />

      <Divider />

      {/* Alignment */}
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
        <AlignLeft size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
        <AlignCenter size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
        <AlignRight size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
        <AlignJustify size={14} />
      </ToolbarButton>

      <Divider />

      {/* Lists & blocks */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Task list">
        <ListChecks size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
        <Quote size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
        <Minus size={14} />
      </ToolbarButton>

      <Divider />

      {/* Link */}
      <LinkPopover editor={editor} />

      {/* Table */}
      <TableDropdown editor={editor} />

      <Divider />

      {/* Clear formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
        <RemoveFormatting size={14} />
      </ToolbarButton>
    </div>
  );
}

/* ─────────────────────── Editor Styles ─────────────────────── */

const EDITOR_STYLES = `
  .html-editor .ProseMirror { outline: none; }
  .html-editor .ProseMirror h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; }
  .html-editor .ProseMirror h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0; }
  .html-editor .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin: 0.83em 0; }
  .html-editor .ProseMirror h4 { font-size: 1.1em; font-weight: 600; margin: 0.83em 0; }
  .html-editor .ProseMirror p { margin: 0.5em 0; }
  .html-editor .ProseMirror ul { list-style: disc; padding-left: 1.5em; }
  .html-editor .ProseMirror ol { list-style: decimal; padding-left: 1.5em; }
  .html-editor .ProseMirror li { margin: 0.25em 0; }
  .html-editor .ProseMirror blockquote { border-left: 3px solid var(--border); padding-left: 1em; margin: 0.5em 0; color: var(--fg-muted); }
  .html-editor .ProseMirror code { background: var(--surface-2); padding: 0.15em 0.3em; border-radius: 4px; font-size: 0.9em; }
  .html-editor .ProseMirror pre { background: var(--surface-2); padding: 0.75em 1em; border-radius: 6px; overflow-x: auto; }
  .html-editor .ProseMirror pre code { background: none; padding: 0; }
  .html-editor .ProseMirror a { color: var(--primary); text-decoration: underline; cursor: pointer; }
  .html-editor .ProseMirror hr { border: none; border-top: 1px solid var(--border); margin: 1em 0; }
  .html-editor .ProseMirror mark { background: #fef08a; padding: 0.1em 0; }
  .html-editor .ProseMirror sub { font-size: 0.75em; }
  .html-editor .ProseMirror sup { font-size: 0.75em; }
  .html-editor .ProseMirror img { max-width: 100%; height: auto; border-radius: 4px; }
  .html-editor .ProseMirror table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
  .html-editor .ProseMirror th, .html-editor .ProseMirror td { border: 1px solid var(--border); padding: 0.4em 0.6em; min-width: 80px; vertical-align: top; }
  .html-editor .ProseMirror th { background: var(--surface-2); font-weight: 600; }
  .html-editor .ProseMirror .tableWrapper { overflow-x: auto; }
  .html-editor .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0; }
  .html-editor .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5em; }
  .html-editor .ProseMirror ul[data-type="taskList"] li label { margin-top: 0.2em; }
  .html-editor .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: var(--fg-subtle); pointer-events: none; height: 0; }
`;

/* ─────────────────────── Main Component ─────────────────────── */

export function HtmlEditor({ value, onChange, placeholder, readOnly, minHeight = 300, maxLength }: HtmlEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        // Disable extensions we add separately to avoid duplicates
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Underline,
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      FontFamily.configure({ types: ['textStyle'] }),
      TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Highlight.configure({ multicolor: false }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount.configure({ limit: maxLength }),
      Typography,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML(), e.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: `min-height: ${minHeight}px; padding: 16px;`,
      },
    },
  });

  if (!editor) return null;

  const charCount = editor.storage.characterCount;

  return (
    <div className="html-editor overflow-hidden rounded-md border bg-surface-1" style={{ borderColor: 'var(--border)' }}>
      <style>{EDITOR_STYLES}</style>
      {!readOnly && <Toolbar editor={editor} />}
      <div style={{ maxHeight: 600, overflowY: 'auto' }}>
        <EditorContent editor={editor} />
      </div>
      {/* Footer: character count */}
      {!readOnly && (
        <div className="flex items-center justify-end border-t px-3 py-1" style={{ borderColor: 'var(--border)' }}>
          <span className="text-[11px] text-fg-subtle">
            {charCount?.characters?.() ?? 0} chars
            {maxLength ? ` / ${maxLength}` : ''}
            {' · '}
            {charCount?.words?.() ?? 0} words
          </span>
        </div>
      )}
    </div>
  );
}
