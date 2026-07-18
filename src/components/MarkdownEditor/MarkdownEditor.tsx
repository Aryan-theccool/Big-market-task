'use client';

import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Typography from '@tiptap/extension-typography';
import { TextAlign } from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Markdown } from '@tiptap/markdown';

import { useCanvasStore } from '../../store/canvasStore';
import { getYRoom, MarkdownSnapshot } from '../../lib/yjs';
import { DiagramCodeBlockExtension } from '../../extensions/DiagramCodeBlockExtension';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import { DocumentTitleBar } from './DocumentTitleBar';
import { HistoryPanel } from './HistoryPanel';
import '../../styles/markdownEditor.css';

type EditorMode = 'edit' | 'preview' | 'split';

interface MarkdownEditorProps {
    roomId: string;
    className?: string;
}

const SNAPSHOT_INTERVAL_EDITS = 50;
let editCount = 0;

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ roomId, className }) => {
    const store = useCanvasStore();
    const room = useMemo(() => getYRoom(roomId), [roomId]);

    const [collabReady, setCollabReady] = useState(false);
    const [localUser, setLocalUser] = useState<any>(null);
    const [mode, setMode] = useState<EditorMode>('edit');
    const [markdownStr, setMarkdownStr] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    // Wait for WebRTC to set up awareness before building editor
    useEffect(() => {
        const checkInterval = setInterval(() => {
            if (room.provider) {
                setCollabReady(true);
                setLocalUser(room.provider.awareness.getLocalStateField('user'));
                clearInterval(checkInterval);
            }
        }, 100);
        return () => clearInterval(checkInterval);
    }, [room]);

    if (!collabReady) {
        return (
            <div className={`markdown-editor layout-edit ${className || ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Connecting to collaboration server...</p>
            </div>
        );
    }

    return <MarkdownEditorInner room={room} localUser={localUser} className={className} roomId={roomId} />;
};

interface InnerProps {
    room: any;
    localUser: any;
    className?: string;
    roomId: string;
}

const MarkdownEditorInner: React.FC<InnerProps> = ({ room, localUser, className, roomId }) => {
    const store = useCanvasStore();
    const [mode, setMode] = useState<EditorMode>('edit');
    const [markdownStr, setMarkdownStr] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');


    // Update markdownViewMode in store when local mode changes
    useEffect(() => {
        store.setMarkdownViewMode(mode);
    }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

    const pushSnapshot = useCallback((editor: Editor) => {
        const markdown = (editor.storage as any).markdown?.getMarkdown?.() ?? editor.getText();
        const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
        const snapshot: MarkdownSnapshot = {
            id: `snap_${Date.now()}`,
            content: JSON.stringify(editor.getJSON()),
            wordCount: words,
            author: localUser?.name || 'You',
            timestamp: Date.now(),
        };
        room.doc.transact(() => {
            room.markdownSnapshots.push([snapshot]);
            // Keep only last 100 snapshots
            if (room.markdownSnapshots.length > 100) {
                room.markdownSnapshots.delete(0, room.markdownSnapshots.length - 100);
            }
        });
        store.markSaved();
    }, [room, localUser, store]);

    const [editor, setEditor] = useState<Editor | null>(null);

    useEffect(() => {
        const ed = new Editor({
            extensions: [
                StarterKit.configure({ history: false, codeBlock: false } as any),
                DiagramCodeBlockExtension,
                Underline,
                Highlight.configure({ multicolor: true }),
                Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
                Image.configure({ allowBase64: true }),
                Table.configure({ resizable: true }),
                TableRow,
                TableHeader,
                TableCell,
                Typography,
                TextAlign.configure({ types: ['heading', 'paragraph'] }),
                Placeholder.configure({
                    placeholder: ({ node }) => {
                        if (node.type.name === 'heading') return 'Heading…';
                        return 'Write in markdown, collaborate in real-time…';
                    },
                    showOnlyCurrent: false,
                }),
                TaskList,
                TaskItem.configure({ nested: true }),
                Markdown,
                Collaboration.configure({ document: room.doc, field: 'markdownContent' }),
                CollaborationCursor.configure({
                    provider: room.provider,
                    user: { name: localUser?.name || 'Local User', color: localUser?.color || '#007AFF' },
                }),
            ],
            editorProps: {
                attributes: { class: 'ProseMirror', style: '' },
            },
            onUpdate({ editor: instance }) {
                store.markDirty();
                editCount++;

                // Update word/char counts
                const text = instance.getText();
                const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                store.setWordCount(words, text.length);

                // Update live markdown string for preview
                const mdStr = (instance.storage as any).markdown?.getMarkdown?.() ?? '';
                setMarkdownStr(mdStr);

                // Auto-snapshot every N edits
                if (editCount >= SNAPSHOT_INTERVAL_EDITS) {
                    editCount = 0;
                    pushSnapshot(instance);
                }

                // Sync title from Y.js meta
                room.markdownMeta.set('lastEditedAt', Date.now());
                room.markdownMeta.set('wordCount', words);
            },
        });

        setEditor(ed);

        return () => {
            ed.destroy();
        };
    }, []);

    // Import markdown file
    const handleImport = useCallback(async (file: File) => {
        const text = await file.text();
        if (editor) {
            editor.commands.setContent(text);
            store.markDirty();
        }
    }, [editor, store]);

    // Export as markdown
    const handleExportMarkdown = useCallback(() => {
        if (!editor) return;
        const md = (editor.storage as any).markdown?.getMarkdown?.() ?? editor.getText();
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${store.noteTitle.replace(/\s+/g, '-')}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }, [editor, store.noteTitle]);

    // Export as PDF
    const handleExportPdf = useCallback(() => {
        window.print();
    }, []);

    // Copy raw markdown
    const handleCopyMarkdown = useCallback(() => {
        if (!editor) return;
        const md = (editor.storage as any).markdown?.getMarkdown?.() ?? editor.getText();
        navigator.clipboard.writeText(md).catch(() => { });
    }, [editor]);

    // Clear document
    const handleClearDocument = useCallback(() => {
        if (editor) {
            editor.commands.clearContent(true);
            store.markDirty();
        }
    }, [editor, store]);

    // Restore snapshot
    const handleRestore = useCallback((snapshot: MarkdownSnapshot) => {
        if (!editor) return;
        try {
            const json = JSON.parse(snapshot.content);
            editor.commands.setContent(json);
            store.closeHistory();
        } catch {
            console.warn('Failed to restore snapshot');
        }
    }, [editor, store]);

    // Insert image from URL
    const handleInsertImage = useCallback(() => {
        if (imageUrl && editor) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setShowImageModal(false);
            setImageUrl('');
        }
    }, [imageUrl, editor]);

    // Insert canvas snapshot as image
    const handleInsertCanvasSnapshot = useCallback(async () => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        if (!canvas || !editor) return;
        const dataUrl = canvas.toDataURL('image/png');
        editor.chain().focus().setImage({ src: dataUrl, alt: 'Canvas snapshot' }).run();
        setShowImageModal(false);
    }, [editor]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const meta = e.metaKey || e.ctrlKey;
            if (meta && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                setMode(m => m === 'edit' ? 'preview' : m === 'preview' ? 'split' : 'edit');
            }
            if (meta && e.shiftKey && e.key === 'K') {
                e.preventDefault();
                editor?.chain().focus().toggleCodeBlock().run();
            }
            if (meta && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                store.isHistoryOpen ? store.closeHistory() : store.openHistory();
            }
            if (meta && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                handleExportMarkdown();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [editor, store, handleExportMarkdown]);



    const ModePills = (
        <div className="md-mode-toggle">
            {(['edit', 'preview', 'split'] as EditorMode[]).map(m => (
                <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`md-mode-pill ${mode === m ? 'active' : ''}`}
                >
                    {m === 'edit' ? '✏️' : m === 'preview' ? '👁' : '⬛'}&nbsp;
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
            ))}
        </div>
    );

    return (
        <div className={`markdown-editor-root ${className || ''}`} style={{ position: 'relative' }}>
            {/* History drawer */}
            {store.isHistoryOpen && (
                <HistoryPanel roomId={roomId} onRestore={handleRestore} />
            )}

            {/* Document title bar */}
            <DocumentTitleBar
                title={store.noteTitle}
                onTitleChange={store.setNoteTitle}
                onImport={handleImport}
                onExportMarkdown={handleExportMarkdown}
                onExportPdf={handleExportPdf}
                onCopyMarkdown={handleCopyMarkdown}
                onClearDocument={handleClearDocument}
                isDirty={store.isDirty}
                lastSavedAt={store.lastSavedAt}
                wordCount={store.wordCount}
            >
                {ModePills}
            </DocumentTitleBar>

            {/* Toolbar: only shown in edit mode */}
            {(mode === 'edit' || mode === 'split') && (
                <MarkdownToolbar editor={editor} onInsertImage={() => setShowImageModal(true)} />
            )}

            {/* Content area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                {/* Edit pane */}
                {(mode === 'edit' || mode === 'split') && (
                    <div
                        className="md-editor-scroll"
                        style={{
                            flex: 1,
                            borderRight: mode === 'split' ? '0.5px solid var(--border)' : 'none',
                        }}
                    >
                        <EditorContent editor={editor} />
                    </div>
                )}

                {/* Preview pane */}
                {(mode === 'preview' || mode === 'split') && (
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <MarkdownPreview markdown={markdownStr} />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="md-footer">
                <span>{store.wordCount} words · {store.charCount} characters</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                    Real-time sync active
                </span>
            </div>

            {/* Image insert modal */}
            {showImageModal && (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
                    onClick={() => setShowImageModal(false)}
                >
                    <div
                        className="glass-panel rounded-2xl overflow-hidden"
                        style={{ width: 440, boxShadow: 'var(--shadow-lg)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ padding: '18px 20px', borderBottom: '0.5px solid var(--border)', fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>
                            Insert Image
                        </div>
                        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input
                                autoFocus
                                value={imageUrl}
                                onChange={e => setImageUrl(e.target.value)}
                                placeholder="https://..."
                                onKeyDown={e => { if (e.key === 'Enter') handleInsertImage(); }}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'var(--font-ui)', outline: 'none', boxSizing: 'border-box' }}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={handleInsertImage} className="primary-button" style={{ flex: 1, justifyContent: 'center' }}>
                                    Insert from URL
                                </button>
                                <button onClick={handleInsertCanvasSnapshot} className="ghost-button" style={{ flex: 1, justifyContent: 'center' }}>
                                    📷 Canvas Snapshot
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
