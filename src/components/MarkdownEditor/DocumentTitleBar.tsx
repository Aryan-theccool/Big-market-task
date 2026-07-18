'use client';

import React, { useState, useRef } from 'react';
import { MoreHorizontal, Clock, Download, Upload, Copy, Link, Trash2, FileText } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

interface DocumentTitleBarProps {
    title: string;
    onTitleChange: (title: string) => void;
    onImport: (file: File) => void;
    onExportMarkdown: () => void;
    onExportPdf: () => void;
    onCopyMarkdown: () => void;
    onClearDocument: () => void;
    isDirty: boolean;
    lastSavedAt: number | null;
    wordCount: number;
    children?: React.ReactNode; // Mode toggle pills
}

function formatRelative(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

export const DocumentTitleBar: React.FC<DocumentTitleBarProps> = ({
    title, onTitleChange, onImport, onExportMarkdown, onExportPdf,
    onCopyMarkdown, onClearDocument, isDirty, lastSavedAt, children,
}) => {
    const store = useCanvasStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { onImport(file); e.target.value = ''; }
    };

    const handleClearWithConfirm = () => {
        if (window.confirm('Clear the entire document? This cannot be undone.')) {
            onClearDocument();
        }
        setMenuOpen(false);
    };

    const menuItems = [
        { icon: <Upload size={13} />, label: 'Import Markdown', action: () => { fileRef.current?.click(); setMenuOpen(false); } },
        { icon: <Download size={13} />, label: 'Export as Markdown', action: () => { onExportMarkdown(); setMenuOpen(false); } },
        { icon: <FileText size={13} />, label: 'Export as PDF', action: () => { onExportPdf(); setMenuOpen(false); } },
        { icon: <Copy size={13} />, label: 'Copy Raw Markdown', action: () => { onCopyMarkdown(); setMenuOpen(false); } },
        {
            icon: <Link size={13} />, label: 'Copy Share Link', action: () => {
                const url = typeof window !== 'undefined' ? window.location.href + '?note=open' : '';
                navigator.clipboard.writeText(url).catch(() => { });
                setMenuOpen(false);
            }
        },
        null, // divider
        { icon: <Trash2 size={13} />, label: 'Clear Document', action: handleClearWithConfirm, danger: true },
    ];

    return (
        <div className="md-title-bar">
            <input
                value={title}
                onChange={e => onTitleChange(e.target.value)}
                placeholder="Untitled Document"
                className="md-title-input"
            />

            {children}

            {/* History icon */}
            <button
                onClick={store.openHistory}
                className="icon-button"
                title="Document history (⌘⇧H)"
                style={{ color: 'var(--text-secondary)', padding: 5 }}
            >
                <Clock size={15} />
            </button>

            {/* Save indicator */}
            {isDirty && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    Unsaved
                </span>
            )}
            {!isDirty && lastSavedAt && (
                <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    ● Saved {formatRelative(lastSavedAt)}
                </span>
            )}

            {/* ··· action menu */}
            <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                    onClick={() => setMenuOpen(v => !v)}
                    className="icon-button"
                    title="Document actions"
                    style={{ color: 'var(--text-secondary)', padding: 5 }}
                >
                    <MoreHorizontal size={15} />
                </button>

                {menuOpen && (
                    <>
                        <div
                            className="fixed inset-0"
                            style={{ zIndex: 9990 }}
                            onClick={() => setMenuOpen(false)}
                        />
                        <div
                            className="glass-panel"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: 6,
                                zIndex: 9991,
                                minWidth: 210,
                                borderRadius: 12,
                                boxShadow: 'var(--shadow-lg)',
                                border: '0.5px solid var(--border)',
                                overflow: 'hidden',
                                padding: '4px 0',
                            }}
                        >
                            {menuItems.map((item, i) =>
                                item === null ? (
                                    <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                                ) : (
                                    <button
                                        key={i}
                                        onClick={item.action}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '8px 14px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontFamily: 'var(--font-ui)',
                                            fontSize: 13,
                                            color: (item as any).danger ? '#FF3B30' : 'var(--text-primary)',
                                            textAlign: 'left',
                                            transition: 'background 0.1s',
                                        }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                )
                            )}
                        </div>
                    </>
                )}
            </div>

            <input ref={fileRef} type="file" accept=".md,.txt" onChange={handleFileChange} className="hidden" />
        </div>
    );
};
