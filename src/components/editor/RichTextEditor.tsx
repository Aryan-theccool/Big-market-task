'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useCanvasStore } from '../../store/canvasStore';
import { getYRoom } from '../../lib/yjs';
import {
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Underline as UnderlineIcon,
    Strikethrough as StrikeIcon,
    Heading1 as H1Icon,
    Heading2 as H2Icon,
    Heading3 as H3Icon,
    List as BulletIcon,
    ListOrdered as NumberedIcon,
    CheckSquare as TaskIcon,
    Quote as QuoteIcon,
    Code as CodeIcon,
    Minus as DividerIcon
} from 'lucide-react';

interface RichTextEditorProps {
    className?: string;
    style?: React.CSSProperties;
    roomId: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ className, style, roomId }) => {
    const store = useCanvasStore();
    const titleInputRef = useRef<HTMLInputElement>(null);

    const [collabReady, setCollabReady] = useState(false);
    const [localUserObj, setLocalUserObj] = useState<any>(null);

    // States for suggestion popups
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [showMentionMenu, setShowMentionMenu] = useState(false);
    const [slashQuery, setSlashQuery] = useState('');
    const [mentionQuery, setMentionQuery] = useState('');
    const [menuCoords, setMenuCoords] = useState({ x: 0, y: 0 });
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Keep references updated for handleKeyDown
    const stateRef = useRef({
        showSlashMenu,
        showMentionMenu,
        selectedIndex,
        filteredCount: 0,
        onSelect: () => { }
    });

    // Watch for YJS WebRTC provider load status
    useEffect(() => {
        const checkInterval = setInterval(() => {
            const room = getYRoom(roomId);
            if (room && room.provider) {
                setCollabReady(true);
                setLocalUserObj(room.provider.awareness.getLocalStateField('user'));
                clearInterval(checkInterval);
            }
        }, 100);
        return () => clearInterval(checkInterval);
    }, [roomId]);

    const room = useMemo(() => getYRoom(roomId), [roomId]);

    // Slash commands data
    const slashCommands = useMemo(() => [
        { id: 'heading1', label: 'Heading 1', icon: 'H1', action: () => editor?.chain().focus().setHeading({ level: 1 }).run() },
        { id: 'heading2', label: 'Heading 2', icon: 'H2', action: () => editor?.chain().focus().setHeading({ level: 2 }).run() },
        { id: 'heading3', label: 'Heading 3', icon: 'H3', action: () => editor?.chain().focus().setHeading({ level: 3 }).run() },
        { id: 'bulletlist', label: 'Bullet list', icon: '•', action: () => editor?.chain().focus().toggleBulletList().run() },
        { id: 'numberedlist', label: 'Numbered list', icon: '1.', action: () => editor?.chain().focus().toggleOrderedList().run() },
        { id: 'tasklist', label: 'Task list', icon: '☑', action: () => editor?.chain().focus().toggleTaskList().run() },
        { id: 'quote', label: 'Quote block', icon: '"', action: () => editor?.chain().focus().toggleBlockquote().run() },
        { id: 'codeblock', label: 'Code Block', icon: '</>', action: () => editor?.chain().focus().toggleCodeBlock().run() },
        { id: 'divider', label: 'Divider line', icon: '—', action: () => editor?.chain().focus().setHorizontalRule().run() },
        {
            id: 'canvas-link', label: 'Canvas link', icon: '🔗', action: () => {
                // Trigger mentions popup directly
                setShowMentionMenu(true);
                setShowSlashMenu(false);
            }
        }
    ], []); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredSlash = useMemo(() => {
        return slashCommands.filter(c => c.label.toLowerCase().includes(slashQuery.toLowerCase()));
    }, [slashQuery, slashCommands]);

    // Mentionable current canvas elements
    const linkableElements = useMemo(() => {
        return store.elements.map(el => {
            let name = `${el.type.toUpperCase()} #${el.id.slice(-4)}`;
            if (el.text) name = `Text: "${el.text.slice(0, 15)}..."`;
            return { id: el.id, name, type: el.type };
        });
    }, [store.elements]);

    const filteredMentions = useMemo(() => {
        return linkableElements.filter(e => e.name.toLowerCase().includes(mentionQuery.toLowerCase()));
    }, [mentionQuery, linkableElements]);

    // Combine lists for keystroke callbacks
    const itemsCount = showSlashMenu ? filteredSlash.length : filteredMentions.length;

    // Editor instance setup
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false, // Collaborative YJS handles history snapshots
            } as any),
            Underline,
            TaskList,
            TaskItem.configure({
                HTMLAttributes: {
                    class: 'flex items-start my-1 gap-2',
                },
            }),
            Placeholder.configure({
                placeholder: 'Start writing your notes, ideas, or meeting minutes…',
            }),
            Collaboration.configure({
                document: room.doc,
                field: 'document-content',
            }),
            CollaborationCursor.configure({
                provider: room.provider,
                user: {
                    name: localUserObj?.name || 'Local User',
                    color: localUserObj?.color || '#007AFF',
                },
            }),
        ],
        editorProps: {
            attributes: {
                class: 'outline-none ProseMirror bg-transparent max-w-full text-[15px] leading-[1.7]',
                style: 'font-family: var(--font-ui), Inter, sans-serif; color: var(--text-primary);'
            },
            handleKeyDown(view, event) {
                const { showSlashMenu: sm, showMentionMenu: mm, selectedIndex: idx, filteredCount: count } = stateRef.current;
                if (sm || mm) {
                    if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setSelectedIndex((idx + 1) % count);
                        return true;
                    }
                    if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setSelectedIndex((idx - 1 + count) % count);
                        return true;
                    }
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        stateRef.current.onSelect();
                        return true;
                    }
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        setShowSlashMenu(false);
                        setShowMentionMenu(false);
                        return true;
                    }
                }
                return false;
            }
        },
        onSelectionUpdate({ editor: ed }) {
            const { state } = ed;
            const { selection } = state;
            const $from = selection.$from;
            const textBefore = $from.parent.textBetween(
                Math.max(0, $from.parentOffset - 25),
                $from.parentOffset,
                null,
                '\n'
            );

            const slashMatch = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);
            const mentionMatch = textBefore.match(/(?:^|\s)@([a-zA-Z0-9_-]*)$/);

            if (slashMatch) {
                setShowSlashMenu(true);
                setShowMentionMenu(false);
                setSlashQuery(slashMatch[1]);
                try {
                    const coords = ed.view.coordsAtPos(selection.from);
                    // Offset relative to scroll boundaries or view offset
                    setMenuCoords({ x: coords.left, y: coords.bottom });
                } catch { }
            } else if (mentionMatch) {
                setShowMentionMenu(true);
                setShowSlashMenu(false);
                setMentionQuery(mentionMatch[1]);
                try {
                    const coords = ed.view.coordsAtPos(selection.from);
                    setMenuCoords({ x: coords.left, y: coords.bottom });
                } catch { }
            } else {
                setShowSlashMenu(false);
                setShowMentionMenu(false);
            }
        }
    }, [collabReady, localUserObj]);

    // Execute selection from popups
    const handleSelectSlashCommand = (item: any) => {
        if (!editor) return;
        const { state } = editor;
        const { selection } = state;
        const $from = selection.$from;
        const textBefore = $from.parent.textBetween(0, $from.parentOffset, null, '\n');
        const lastSlashIdx = textBefore.lastIndexOf('/');
        if (lastSlashIdx !== -1) {
            const fromPos = selection.from - (textBefore.length - lastSlashIdx);
            editor.chain().focus().deleteRange({ from: fromPos, to: selection.to }).run();
        }
        item.action();
        setShowSlashMenu(false);
    };

    const handleSelectMention = (element: any) => {
        if (!editor) return;
        const { state } = editor;
        const { selection } = state;
        const $from = selection.$from;
        const textBefore = $from.parent.textBetween(0, $from.parentOffset, null, '\n');
        const lastAtIdx = textBefore.lastIndexOf('@');
        if (lastAtIdx !== -1) {
            const fromPos = selection.from - (textBefore.length - lastAtIdx);
            editor.chain().focus().deleteRange({ from: fromPos, to: selection.to }).run();
        }

        // Insert inline tag with special styling
        const chipHtml = `<span class="inline-chip select-none pointer-events-auto" data-element-id="${element.id}" style="display: inline-flex; align-items: center; background: var(--accent-glow); color: var(--accent); font-weight: 600; padding: 2px 6px; border-radius: 6px; font-size: 13px; cursor: pointer; margin: 0 4px; border: 0.5px solid var(--accent); font-family: var(--font-ui), sans-serif;">🔗 ${element.name}</span>&nbsp;`;
        editor.commands.insertContent(chipHtml);
        setShowMentionMenu(false);
    };

    // Sync ref details back to helper key handler
    useEffect(() => {
        stateRef.current = {
            showSlashMenu,
            showMentionMenu,
            selectedIndex,
            filteredCount: itemsCount,
            onSelect: () => {
                if (showSlashMenu) {
                    if (filteredSlash[selectedIndex]) handleSelectSlashCommand(filteredSlash[selectedIndex]);
                } else if (showMentionMenu) {
                    if (filteredMentions[selectedIndex]) handleSelectMention(filteredMentions[selectedIndex]);
                }
            }
        };
    }, [showSlashMenu, showMentionMenu, selectedIndex, itemsCount, filteredSlash, filteredMentions]); // eslint-disable-line react-hooks/exhaustive-deps

    // Align index range
    useEffect(() => {
        setSelectedIndex(0);
    }, [showSlashMenu, showMentionMenu, slashQuery, mentionQuery]);

    // Click handler to center and focus related whiteboard objects
    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const chip = target.closest('.inline-chip');
        if (chip) {
            const elementId = chip.getAttribute('data-element-id');
            if (elementId) {
                store.setSelected([elementId]);
                const matched = store.elements.find(el => el.id === elementId);
                if (matched) {
                    // Pivot coordinates
                    const totalWidth = window.innerWidth;
                    const leftPaneWidth = store.viewMode === 'notes-only' ? totalWidth : (totalWidth * (store.splitRatio / 100));
                    const canvasWidth = totalWidth - leftPaneWidth;
                    const canvasHeight = window.innerHeight - 52;

                    store.setViewport({
                        x: canvasWidth / 2 - matched.x * store.viewport.zoom + leftPaneWidth,
                        y: canvasHeight / 2 - matched.y * store.viewport.zoom + 52,
                    });
                }
            }
        }
    };

    // Word statistics count
    const stats = useMemo(() => {
        if (!editor) return { words: 0, chars: 0 };
        const text = editor.getText();
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        return { words, chars };
    }, [editor?.getText()]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!collabReady) {
        return (
            <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p className="text-sm font-semibold select-none animate-pulse" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                    Establishing collaboration synchronization…
                </p>
            </div>
        );
    }

    return (
        <div className={className} style={{ ...style, background: 'var(--bg-canvas)' }} onClick={handleEditorClick}>
            <style>{`
        .ProseMirror {
          min-height: 250px;
          height: 100%;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-muted);
          pointer-events: none;
          height: 0;
        }
        .collaboration-cursor__caret {
          border-left: 2px solid;
          border-right: 2px solid;
          border-color: currentColor;
          position: relative;
          word-break: normal;
          pointer-events: none;
        }
        .collaboration-cursor__label {
          position: absolute;
          top: -1.3em;
          left: -2px;
          font-size: 10px;
          font-weight: 700;
          line-height: normal;
          color: #fff;
          padding: 1px 4px;
          border-radius: 4px;
          white-space: nowrap;
          user-select: none;
          pointer-events: none;
          z-index: 50;
        }
        .ProseMirror ::selection {
          background: rgba(0, 122, 255, 0.2) !important;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 20px;
          margin-bottom: 8px;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 20px;
          margin-bottom: 8px;
        }
        .ProseMirror code {
          background: var(--bg-hover);
          padding: 2px 4px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 14px;
        }
        .ProseMirror pre {
          background: var(--bg-secondary);
          border: 0.5px solid var(--border);
          padding: 12px;
          border-radius: 8px;
          font-family: var(--font-mono);
          font-size: 13px;
          margin-bottom: 12px;
          overflow-x: auto;
          color: var(--text-primary);
        }
        .ProseMirror blockquote {
          border-left: 3px solid var(--accent);
          padding-left: 12px;
          color: var(--text-secondary);
          font-style: italic;
          margin-bottom: 12px;
        }
      `}</style>

            {/* Editor top section edit Notes Title */}
            <div className="flex flex-col px-7 pt-6 gap-3 select-text" style={{ borderBottom: '0.5px solid var(--border)' }}>
                <input
                    ref={titleInputRef}
                    value={store.noteTitle}
                    onChange={(e) => store.setNoteTitle(e.target.value)}
                    placeholder="Note title"
                    className="text-2xl font-bold bg-transparent outline-none border-none py-1 w-full"
                    style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}
                />

                {/* Apple style glass floating formatting tools */}
                <div className="flex items-center gap-1.5 py-2 overflow-x-auto select-none" style={{ scrollbarWidth: 'none' }}>
                    <button
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer`}
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('bold') ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('bold') ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Bold (⌘B)"
                    >
                        <BoldIcon size={14} />
                    </button>

                    <button
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('italic') ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('italic') ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Italic (⌘I)"
                    >
                        <ItalicIcon size={14} />
                    </button>

                    <button
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('underline') ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('underline') ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Underline (⌘U)"
                    >
                        <UnderlineIcon size={14} />
                    </button>

                    <button
                        onClick={() => editor?.chain().focus().toggleStrike().run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('strike') ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('strike') ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Strikethrough"
                    >
                        <StrikeIcon size={14} />
                    </button>

                    <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }} />

                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('heading', { level: 1 }) ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('heading', { level: 1 }) ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Heading 1"
                    >
                        <H1Icon size={14} />
                    </button>

                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('heading', { level: 2 }) ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('heading', { level: 2 }) ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Heading 2"
                    >
                        <H2Icon size={14} />
                    </button>

                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('heading', { level: 3 }) ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('heading', { level: 3 }) ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Heading 3"
                    >
                        <H3Icon size={14} />
                    </button>

                    <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }} />

                    <button
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('bulletList') ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('bulletList') ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Bullet list"
                    >
                        <BulletIcon size={14} />
                    </button>

                    <button
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('orderedList') ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('orderedList') ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Numbered list"
                    >
                        <NumberedIcon size={14} />
                    </button>

                    <button
                        onClick={() => editor?.chain().focus().toggleTaskList().run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('taskList') ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('taskList') ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Task list"
                    >
                        <TaskIcon size={14} />
                    </button>

                    <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }} />

                    <button
                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('blockquote') ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('blockquote') ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Quote block"
                    >
                        <QuoteIcon size={14} />
                    </button>

                    <button
                        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{
                            width: 28, height: 28,
                            background: editor?.isActive('codeBlock') ? 'var(--accent-glow)' : 'transparent',
                            color: editor?.isActive('codeBlock') ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                        title="Code block"
                    >
                        <CodeIcon size={14} />
                    </button>

                    <button
                        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                        className="glass-panel p-1.5 flex items-center justify-center rounded-[6px] shrink-0 border-none cursor-pointer"
                        style={{ width: 28, height: 28, background: 'transparent', color: 'var(--text-secondary)' }}
                        title="Horizontal Line"
                    >
                        <DividerIcon size={14} />
                    </button>
                </div>
            </div>

            {/* Editor Text Container */}
            <div className="flex-1 overflow-y-auto px-7 py-6 select-text" style={{ maxHeight: 'calc(100% - 150px)' }}>
                <EditorContent editor={editor} className="h-full pr-1" />
            </div>

            {/* Word statistics footer */}
            <div className="flex items-center justify-between px-7 py-2 select-none border-t border-[var(--border)] bg-[var(--bg-canvas)]"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', height: 32 }}
            >
                <span>Words: {stats.words} ({stats.chars} characters)</span>
                <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
                    Cloud Saved & Synced
                </span>
            </div>

            {/* Popovers suggestions container (relative to absolute screen space) */}
            {showSlashMenu && filteredSlash.length > 0 && (
                <div
                    className="fixed glass-panel rounded-[12px] py-1.5 min-w-[200px] overflow-hidden"
                    style={{
                        left: Math.min(menuCoords.x, window.innerWidth - 220),
                        top: Math.min(menuCoords.y + 12, window.innerHeight - 200),
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 99999,
                        border: '0.5px solid var(--border)',
                        background: 'var(--bg-panel)',
                        backdropFilter: 'var(--blur-panel)',
                        WebkitBackdropFilter: 'var(--blur-panel)'
                    }}
                >
                    {filteredSlash.map((item, idx) => (
                        <button
                            key={item.id}
                            onClick={() => handleSelectSlashCommand(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left border-none cursor-pointer transition-colors"
                            style={{
                                background: selectedIndex === idx ? 'var(--accent-glow)' : 'transparent',
                                color: selectedIndex === idx ? 'var(--accent)' : 'var(--text-primary)',
                                fontFamily: 'var(--font-ui)',
                                fontSize: 13
                            }}
                        >
                            <span className="flex items-center justify-center rounded-[4px] font-bold text-center text-xs shrink-0 select-none"
                                style={{ width: 22, height: 20, background: selectedIndex === idx ? 'var(--accent)' : 'var(--bg-hover)', color: selectedIndex === idx ? 'white' : 'var(--text-secondary)' }}
                            >
                                {item.icon}
                            </span>
                            <span style={{ fontWeight: selectedIndex === idx ? 600 : 400 }}>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {showMentionMenu && filteredMentions.length > 0 && (
                <div
                    className="fixed glass-panel rounded-[12px] py-1.5 min-w-[220px] overflow-hidden"
                    style={{
                        left: Math.min(menuCoords.x, window.innerWidth - 240),
                        top: Math.min(menuCoords.y + 12, window.innerHeight - 200),
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 99999,
                        border: '0.5px solid var(--border)',
                        background: 'var(--bg-panel)',
                        backdropFilter: 'var(--blur-panel)',
                        WebkitBackdropFilter: 'var(--blur-panel)'
                    }}
                >
                    <div className="px-3 py-1 font-semibold border-b border-[var(--border)] select-none mb-1 text-[11px]"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}
                    >
                        Insert Link to Element
                    </div>
                    {filteredMentions.map((element, idx) => (
                        <button
                            key={element.id}
                            onClick={() => handleSelectMention(element)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left border-none cursor-pointer transition-colors"
                            style={{
                                background: selectedIndex === idx ? 'var(--accent-glow)' : 'transparent',
                                color: selectedIndex === idx ? 'var(--accent)' : 'var(--text-primary)',
                                fontFamily: 'var(--font-ui)',
                                fontSize: 13
                            }}
                        >
                            <span className="text-xs">🔗</span>
                            <span style={{ fontWeight: selectedIndex === idx ? 600 : 400 }} className="truncate flex-1">{element.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
