'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, RotateCcw, Tag } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { getYRoom, MarkdownSnapshot } from '../../lib/yjs';

interface HistoryPanelProps {
    roomId: string;
    onRestore: (snapshot: MarkdownSnapshot) => void;
}

function formatTime(ts: number) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return new Date(ts).toLocaleDateString();
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ roomId, onRestore }) => {
    const store = useCanvasStore();
    const [snapshots, setSnapshots] = useState<MarkdownSnapshot[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [namingId, setNamingId] = useState<string | null>(null);
    const [nameInput, setNameInput] = useState('');

    useEffect(() => {
        const room = getYRoom(roomId);
        const load = () => {
            const snaps = room.markdownSnapshots.toArray().slice().reverse();
            setSnapshots(snaps);
        };
        load();
        room.markdownSnapshots.observe(load);
        return () => { room.markdownSnapshots.unobserve(load); };
    }, [roomId]);

    const handleNameVersion = (snap: MarkdownSnapshot) => {
        setNamingId(snap.id);
        setNameInput(snap.label || '');
    };

    const saveLabel = (snap: MarkdownSnapshot) => {
        const room = getYRoom(roomId);
        const idx = room.markdownSnapshots.toArray().findIndex(s => s.id === snap.id);
        if (idx !== -1) {
            room.doc.transact(() => {
                const updated = { ...snap, label: nameInput };
                room.markdownSnapshots.delete(idx, 1);
                room.markdownSnapshots.insert(idx, [updated]);
            });
        }
        setNamingId(null);
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: 280,
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-panel)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '0.5px solid var(--border)',
                boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid var(--border)' }}>
                <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-ui)', color: 'var(--text-primary)' }}>
                    Document History
                </span>
                <button onClick={store.closeHistory} className="icon-button" style={{ padding: 4 }}>
                    <X size={14} />
                </button>
            </div>

            {/* Snapshot list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {snapshots.length === 0 && (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-ui)' }}>
                        No snapshots yet.<br />Edits are auto-saved every 50 changes.
                    </div>
                )}
                {snapshots.map((snap) => (
                    <div
                        key={snap.id}
                        onClick={() => setSelectedId(snap.id === selectedId ? null : snap.id)}
                        style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            borderBottom: '0.5px solid var(--border)',
                            background: selectedId === snap.id ? 'var(--accent-glow)' : 'transparent',
                            transition: 'background 0.1s',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                {snap.label && (
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 2, fontFamily: 'var(--font-ui)' }}>
                                        📌 {snap.label}
                                    </div>
                                )}
                                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontWeight: 500 }}>
                                    {snap.author}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    🕐 {formatTime(snap.timestamp)} · {snap.wordCount} words
                                </div>
                            </div>
                        </div>

                        {/* Expanded actions */}
                        {selectedId === snap.id && (
                            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {namingId === snap.id ? (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <input
                                            value={nameInput}
                                            onChange={e => setNameInput(e.target.value)}
                                            placeholder="Version name..."
                                            autoFocus
                                            onKeyDown={e => { if (e.key === 'Enter') saveLabel(snap); if (e.key === 'Escape') setNamingId(null); }}
                                            style={{ flex: 1, fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--accent)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', outline: 'none' }}
                                        />
                                        <button onClick={() => saveLabel(snap)} style={{ padding: '4px 8px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Save</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNameVersion(snap); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--bg-hover)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}
                                    >
                                        <Tag size={12} /> Name this version
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRestore(snap); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--accent)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'white', fontFamily: 'var(--font-ui)' }}
                                >
                                    <RotateCcw size={12} /> Restore this version
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
