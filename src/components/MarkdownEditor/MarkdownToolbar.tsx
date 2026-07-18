'use client';

import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline, Strikethrough, Link, AlignLeft, AlignCenter,
    AlignRight, Undo2, Redo2, Code, Quote, Minus, Image as ImageIcon,
    Table, List, ListOrdered, CheckSquare, Highlighter
} from 'lucide-react';

interface MarkdownToolbarProps {
    editor: Editor | null;
    onInsertImage: () => void;
}

const HIGHLIGHT_COLORS = [
    { color: '#FFD60A', label: 'Yellow' },
    { color: '#FF9F0A', label: 'Orange' },
    { color: '#FF375F', label: 'Red' },
    { color: '#30D158', label: 'Green' },
    { color: '#64D2FF', label: 'Blue' },
    { color: '#BF5AF2', label: 'Purple' },
    { color: '#FF6961', label: 'Salmon' },
    { color: '#FFCF64', label: 'Peach' },
];

function TablePicker({ onInsert }: { onInsert: (rows: number, cols: number) => void }) {
    const [hover, setHover] = useState({ r: 0, c: 0 });
    const SIZE = 8;
    return (
        <div style={{ padding: 8 }}>
            <div style={{ marginBottom: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {hover.r} × {hover.c}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 20px)`, gap: 2 }}>
                {Array.from({ length: SIZE * SIZE }, (_, idx) => {
                    const r = Math.floor(idx / SIZE) + 1;
                    const c = (idx % SIZE) + 1;
                    return (
                        <div
                            key={idx}
                            onMouseEnter={() => setHover({ r, c })}
                            onClick={() => onInsert(r, c)}
                            style={{
                                width: 20, height: 20,
                                borderRadius: 3,
                                cursor: 'pointer',
                                background: r <= hover.r && c <= hover.c ? 'var(--accent)' : 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                transition: 'background 0.1s',
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ editor, onInsertImage }) => {
    const [showHighlight, setShowHighlight] = useState(false);
    const [showTablePicker, setShowTablePicker] = useState(false);
    const highlightRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLDivElement>(null);

    if (!editor) return null;

    const btn = (
        onClick: () => void,
        icon: React.ReactNode,
        title: string,
        isActive = false,
        extraStyle: React.CSSProperties = {}
    ) => (
        <button
            onClick={onClick}
            title={title}
            className={`md-toolbar-btn ${isActive ? 'active' : ''}`}
            style={extraStyle}
        >
            {icon}
        </button>
    );

    const handleInsertTable = (rows: number, cols: number) => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        setShowTablePicker(false);
    };

    return (
        <div className="md-toolbar">
            {/* Row 1: Block Formatting */}
            <div className="md-toolbar-row">
                {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), <span style={{ fontSize: 11, fontWeight: 800 }}>H1</span>, 'Heading 1', editor.isActive('heading', { level: 1 }))}
                {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), <span style={{ fontSize: 11, fontWeight: 700 }}>H2</span>, 'Heading 2', editor.isActive('heading', { level: 2 }))}
                {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), <span style={{ fontSize: 11, fontWeight: 600 }}>H3</span>, 'Heading 3', editor.isActive('heading', { level: 3 }))}
                {btn(() => editor.chain().focus().setParagraph().run(), <span style={{ fontSize: 11 }}>¶</span>, 'Paragraph', editor.isActive('paragraph'))}

                <div className="md-toolbar-divider" />

                {btn(() => editor.chain().focus().toggleBulletList().run(), <List size={14} />, 'Bullet list', editor.isActive('bulletList'))}
                {btn(() => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={14} />, 'Ordered list', editor.isActive('orderedList'))}
                {btn(() => editor.chain().focus().toggleTaskList().run(), <CheckSquare size={14} />, 'Task list', editor.isActive('taskList'))}

                <div className="md-toolbar-divider" />

                {btn(() => editor.chain().focus().toggleBlockquote().run(), <Quote size={14} />, 'Quote', editor.isActive('blockquote'))}
                {btn(() => editor.chain().focus().toggleCodeBlock().run(), <Code size={14} />, 'Code block (⌘⇧K)', editor.isActive('codeBlock'))}
                {btn(() => editor.chain().focus().setHorizontalRule().run(), <Minus size={14} />, 'Horizontal rule')}

                <div className="md-toolbar-divider" />

                {btn(onInsertImage, <ImageIcon size={14} />, 'Insert image')}

                {/* Table button with picker popover */}
                <div style={{ position: 'relative' }} ref={tableRef}>
                    <button
                        onClick={() => setShowTablePicker(v => !v)}
                        className={'md-toolbar-btn'}
                        title="Insert table"
                    >
                        <Table size={14} />
                    </button>
                    {showTablePicker && (
                        <div
                            className="glass-panel"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                zIndex: 9999,
                                marginTop: 4,
                                boxShadow: 'var(--shadow-lg)',
                                borderRadius: 10,
                                border: '0.5px solid var(--border)',
                            }}
                        >
                            <TablePicker onInsert={handleInsertTable} />
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Inline Formatting */}
            <div className="md-toolbar-row">
                {btn(() => editor.chain().focus().toggleBold().run(), <Bold size={13} />, 'Bold (⌘B)', editor.isActive('bold'))}
                {btn(() => editor.chain().focus().toggleItalic().run(), <Italic size={13} />, 'Italic (⌘I)', editor.isActive('italic'))}
                {btn(() => editor.chain().focus().toggleUnderline().run(), <Underline size={13} />, 'Underline (⌘U)', editor.isActive('underline'))}
                {btn(() => editor.chain().focus().toggleStrike().run(), <Strikethrough size={13} />, 'Strikethrough', editor.isActive('strike'))}

                <div className="md-toolbar-divider" />

                {/* Link */}
                {btn(() => {
                    const url = window.prompt('Enter URL:');
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                }, <Link size={13} />, 'Insert link', editor.isActive('link'))}

                {/* Highlight with color picker */}
                <div style={{ position: 'relative' }} ref={highlightRef}>
                    <button
                        onClick={() => setShowHighlight(v => !v)}
                        className={`md-toolbar-btn ${editor.isActive('highlight') ? 'active' : ''}`}
                        title="Highlight"
                    >
                        <Highlighter size={13} />
                    </button>
                    {showHighlight && (
                        <div
                            className="glass-panel"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                zIndex: 9999,
                                marginTop: 4,
                                padding: '8px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 28px)',
                                gap: 4,
                                boxShadow: 'var(--shadow-lg)',
                                borderRadius: 10,
                                border: '0.5px solid var(--border)',
                            }}
                        >
                            {HIGHLIGHT_COLORS.map(({ color, label }) => (
                                <button
                                    key={color}
                                    title={label}
                                    onClick={() => {
                                        editor.chain().focus().setHighlight({ color }).run();
                                        setShowHighlight(false);
                                    }}
                                    style={{
                                        width: 28, height: 28,
                                        borderRadius: 6,
                                        background: color,
                                        border: '2px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'transform 0.1s',
                                    }}
                                    onMouseEnter={e => { (e.target as HTMLButtonElement).style.transform = 'scale(1.15)'; }}
                                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
                                />
                            ))}
                            <button
                                title="Remove highlight"
                                onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlight(false); }}
                                style={{ width: 28, height: 28, borderRadius: 6, background: 'transparent', border: '2px solid var(--border)', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)' }}
                            >✕</button>
                        </div>
                    )}
                </div>

                <div className="md-toolbar-divider" />

                {btn(() => editor.chain().focus().setTextAlign('left').run(), <AlignLeft size={13} />, 'Align left', editor.isActive({ textAlign: 'left' }))}
                {btn(() => editor.chain().focus().setTextAlign('center').run(), <AlignCenter size={13} />, 'Align center', editor.isActive({ textAlign: 'center' }))}
                {btn(() => editor.chain().focus().setTextAlign('right').run(), <AlignRight size={13} />, 'Align right', editor.isActive({ textAlign: 'right' }))}

                <div className="md-toolbar-divider" />

                {btn(() => editor.chain().focus().undo().run(), <Undo2 size={13} />, 'Undo (⌘Z)')}
                {btn(() => editor.chain().focus().redo().run(), <Redo2 size={13} />, 'Redo (⌘⇧Z)')}
            </div>
        </div>
    );
};
