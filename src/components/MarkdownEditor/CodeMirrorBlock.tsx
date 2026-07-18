'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { useCanvasStore, ParseError, DiagramRegistryEntry } from '../../store/canvasStore';
import { parseDiagramSource } from '../../lib/diagramParser/UniversalParser';
import { computeSourceHash } from '../../lib/diagramParser/ParserUtils';
import { computeDagreLayout } from '../../lib/layoutEngines/DagreLayout';
import { computeElkLayout } from '../../lib/layoutEngines/ElkLayout';
import { computeGridLayout } from '../../lib/layoutEngines/GridLayout';
import { computeRadialLayout } from '../../lib/layoutEngines/RadialLayout';
import { compileDiagramToCanvas } from '../../lib/DiagramCompiler';
import { removeDiagramFromYjs } from '../../lib/DiagramRegistry';
import { animateLayoutMorph, animateEntranceAnimation } from '../../lib/DiagramAnimator';
import { getYRoom } from '../../lib/yjs';
import { emitFocusCanvas, DIAGRAM_FOCUS_EDITOR } from '../../hooks/useDiagramBiLink';

export const CodeMirrorBlock = ({ node, updateAttributes, getPos, editor }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    const store = useCanvasStore();
    const roomId = store.roomId || 'test-room';
    const room = useMemo(() => getYRoom(roomId), [roomId]);

    // Read diagramId or generate one if missing
    const diagramId = node.attrs.diagramId || useMemo(() => `diag_${Math.random().toString(36).slice(2, 9)}`, []);
    useEffect(() => {
        if (!node.attrs.diagramId) {
            updateAttributes({ diagramId });
        }
    }, [diagramId, node.attrs.diagramId, updateAttributes]);

    // Read/Write states
    const [lang, setLang] = useState<'canvex' | 'mermaid' | 'dot'>(node.attrs.language || 'canvex');
    const [syncMode, setSyncMode] = useState<'manual' | 'live'>('manual');

    // Compiler state details
    const registryEntry = store.diagrams[diagramId] as DiagramRegistryEntry | undefined;
    const parseErrors = store.compileErrors[diagramId] || [];

    const sourceCode = node.textContent || '';
    const currentHash = computeSourceHash(sourceCode);

    const isCompiled = !!registryEntry;
    const isOutOfSync = isCompiled && registryEntry?.sourceHash !== currentHash;

    // Sync back to Tiptap node attribute if dropdown changes
    const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value as any;
        setLang(val);
        updateAttributes({ language: val });
    };

    // Compile Handler definition
    const handleCompile = async () => {
        if (!sourceCode.trim()) return;

        store.setCompiling(diagramId);

        // 1. Parsing AST
        const { ast, errors } = parseDiagramSource(sourceCode, lang);
        store.setCompileErrors(diagramId, errors);

        if (errors.length > 0) {
            store.setCompiling(null);
            return;
        }

        try {
            // 2. Select Layout Solver
            const engine = registryEntry?.layoutEngine || ast.meta.layoutEngine || store.defaultLayoutEngine || 'dagre';
            let layoutResult;
            if (engine === 'elk') {
                layoutResult = await computeElkLayout(ast);
            } else if (engine === 'grid') {
                layoutResult = computeGridLayout(ast);
            } else if (engine === 'radial') {
                layoutResult = computeRadialLayout(ast);
            } else {
                layoutResult = computeDagreLayout(ast);
            }

            // Record before coordinates for morph transitions
            const beforeElements: Record<string, any> = {};
            store.elements.forEach((el: any) => {
                beforeElements[el.id] = { ...el };
            });

            // 3. Compile onto Canvas doc
            const pos = store.viewport ? { x: -store.viewport.x + 300, y: -store.viewport.y + 150 } : { x: 100, y: 100 };

            const { elementIds } = compileDiagramToCanvas(room.doc, ast, layoutResult, {
                targetPosition: pos,
                generateGroup: true,
                preserveExisting: false,
                diagramId,
                codeBlockId: node.attrs.diagramId,
                layoutEngine: engine,
                theme: registryEntry?.theme || store.defaultTheme || 'system',
                sourceHash: currentHash,
                syncMode,
            });

            // Register diagram mapping locally as well
            const regObj: DiagramRegistryEntry = {
                diagramId,
                codeBlockId: diagramId,
                canvasElementIds: elementIds,
                frameElementId: `diagram-frame-${diagramId}`,
                layoutEngine: engine,
                theme: registryEntry?.theme || store.defaultTheme || 'system',
                lastCompiledAt: Date.now(),
                sourceHash: currentHash,
                syncMode,
            };

            store.registerDiagram(regObj);

            // Trigger stagger entrance or morph transition depending on update state
            if (isCompiled) {
                // Read updated local copy of elements
                setTimeout(() => {
                    const afterElements: Record<string, any> = {};
                    store.elements.forEach((el: any) => {
                        if (elementIds.includes(el.id)) {
                            afterElements[el.id] = el;
                        }
                    });
                    animateLayoutMorph(store, beforeElements, afterElements);
                }, 50);
            } else {
                setTimeout(() => {
                    animateEntranceAnimation(store, elementIds);
                }, 50);
            }

        } catch (err) {
            console.error('Compilation failed:', err);
        } finally {
            store.setCompiling(null);
        }
    };

    // Remove elements from canvas
    const handleRemove = () => {
        const deletedIds = removeDiagramFromYjs(room.doc, diagramId);
        deletedIds.forEach(id => {
            const yElements = room.doc.getMap<any>('elements');
            yElements.delete(id);
        });
        store.removeDiagram(diagramId);
    };

    // Setup local emitter stubs to trigger compilation from right-click context menu
    useEffect(() => {
        (window as any).__diagramReRenderEmitter = (id: string) => {
            if (id === diagramId) handleCompile();
        };
        return () => {
            if ((window as any).__diagramReRenderEmitter === handleCompile) {
                (window as any).__diagramReRenderEmitter = null;
            }
        };
    }, [diagramId, sourceCode, lang, registryEntry]); // eslint-disable-line react-hooks/exhaustive-deps

    // Editor → Canvas: emit focus-canvas when this block is clicked
    // Canvas → Editor: listen for focus-editor event and scroll + flash
    useEffect(() => {
        const handler = (e: Event) => {
            const { diagramId: targetId } = (e as CustomEvent).detail || {};
            if (targetId !== diagramId) return;
            // Scroll into view
            const el = containerRef.current;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Flash ring
                el.style.outline = '2px solid rgba(99,102,241,0.8)';
                el.style.outlineOffset = '3px';
                el.style.borderRadius = '8px';
                el.style.transition = 'outline 0.2s';
                setTimeout(() => {
                    if (el) {
                        el.style.outline = '';
                        el.style.outlineOffset = '';
                    }
                }, 2000);
            }
        };
        window.addEventListener(DIAGRAM_FOCUS_EDITOR, handler);
        return () => window.removeEventListener(DIAGRAM_FOCUS_EDITOR, handler);
    }, [diagramId]);

    // CodeMirror instance bootstrap
    useEffect(() => {
        if (!editorRef.current) return;

        const startState = EditorState.create({
            doc: node.textContent,
            extensions: [
                oneDark,
                keymap.of(defaultKeymap),
                EditorView.updateListener.of(update => {
                    if (update.docChanged) {
                        const newText = update.state.doc.toString();
                        // Sync text back into Tiptap State
                        const posVal = getPos();
                        if (typeof posVal === 'number' && editor) {
                            const start = posVal + 1;
                            const end = start + node.nodeSize - 2;
                            editor.view.dispatch(
                                editor.view.state.tr.insertText(newText, start, end)
                            );
                        }
                    }
                }),
            ],
        });

        const view = new EditorView({
            state: startState,
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto compile on keystroke if Live Sync is ON
    useEffect(() => {
        if (syncMode === 'live' && sourceCode.trim()) {
            const timer = setTimeout(() => {
                handleCompile();
            }, 800); // 800ms debounce
            return () => clearTimeout(timer);
        }
    }, [sourceCode, syncMode]); // eslint-disable-line react-hooks/exhaustive-deps

    // Determine Render Button Class label
    let renderLabel = '▶ Render Canvas';
    let buttonStyleClass = 'cm-compile-blue';

    if (isCompiled) {
        if (isOutOfSync) {
            renderLabel = '↻ Update Canvas';
            buttonStyleClass = 'cm-compile-orange';
        } else {
            renderLabel = '✓ Rendered';
            buttonStyleClass = 'cm-compile-green';
        }
    }

    return (
        <NodeViewWrapper className="cm-block-wrapper" ref={containerRef} onClick={() => emitFocusCanvas(diagramId)}>
            {/* Header bar controls */}
            <div className="cm-block-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, marginRight: 4 }}>📐</span>
                    <select
                        value={lang}
                        onChange={handleLangChange}
                        style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'var(--bg-secondary)',
                            border: '0.5px solid var(--border)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                            fontFamily: 'var(--font-ui)',
                            outline: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="canvex">CANVEX DSL</option>
                        <option value="mermaid">Mermaid</option>
                        <option value="dot">Graphviz DOT</option>
                    </select>
                </div>

                <div className="cm-block-actions" style={{ gap: 8 }}>
                    {/* Live Sync Toggle */}
                    <button
                        onClick={() => setSyncMode(m => m === 'live' ? 'manual' : 'live')}
                        className={`cm-block-btn`}
                        style={{
                            width: 'auto',
                            padding: '0 8px',
                            fontSize: 11,
                            fontWeight: 600,
                            background: syncMode === 'live' ? 'rgba(76, 217, 100, 0.15)' : 'transparent',
                            color: syncMode === 'live' ? 'var(--green)' : 'var(--text-secondary)',
                            borderColor: syncMode === 'live' ? 'var(--green)' : 'transparent',
                        }}
                    >
                        {syncMode === 'live' ? '🟢 Live' : '🔴 Manual'}
                    </button>

                    {/* Render Action button */}
                    <button
                        onClick={handleCompile}
                        className={`cm-block-btn ${buttonStyleClass}`}
                        style={{
                            width: 'auto',
                            padding: '0 10px',
                            fontWeight: 600,
                            fontSize: 11,
                        }}
                    >
                        {renderLabel}
                    </button>

                    {/* Remove diagram elements from canvas */}
                    {isCompiled && (
                        <button
                            onClick={handleRemove}
                            className="cm-block-btn"
                            title="Remove elements from canvas"
                            style={{ color: 'var(--red)' }}
                        >
                            🗑
                        </button>
                    )}
                </div>
            </div>

            {/* Editor Content Area */}
            <div ref={editorRef} className="cm-editor-container" />

            {/* Collapsible Error Panel */}
            {parseErrors.length > 0 && (
                <div
                    className="cm-output-panel"
                    style={{
                        borderLeft: '3px solid var(--red)',
                        background: 'rgba(255, 59, 48, 0.05)',
                        padding: '10px 14px',
                    }}
                >
                    <div style={{ color: 'var(--red)', fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
                        ⚠️ Parse Errors ({parseErrors.length})
                    </div>
                    {parseErrors.map((err: ParseError, idx: number) => (
                        <div key={idx} style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0' }}>
                            Line {err.line}: {err.message}
                            {err.suggestion && <span style={{ color: 'var(--accent)', marginLeft: 6 }}>Suggestion: {err.suggestion}</span>}
                        </div>
                    ))}
                </div>
            )}
        </NodeViewWrapper>
    );
};
