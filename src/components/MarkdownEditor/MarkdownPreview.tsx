'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { marked, MarkedOptions } from 'marked';
import { useCanvasStore } from '../../store/canvasStore';

interface TocEntry { level: number; text: string; id: string; }

interface MarkdownPreviewProps {
    markdown: string;
    className?: string;
}

function slugify(text: string) {
    return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
}

function buildToc(markdown: string): TocEntry[] {
    const toc: TocEntry[] = [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(markdown)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        toc.push({ level, text, id: slugify(text) });
    }
    return toc;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdown, className }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const toc = useMemo(() => buildToc(markdown), [markdown]);

    // Configure marked with custom heading IDs
    const renderer = new marked.Renderer();
    renderer.heading = function ({ text, depth }: { text: string; depth: number }) {
        const id = slugify(text);
        return `<h${depth} id="${id}">${text}</h${depth}>`;
    };

    const html = useMemo(() => {
        try {
            return marked(markdown, { renderer, gfm: true, breaks: true } as MarkedOptions);
        } catch {
            return '<p>Error rendering markdown</p>';
        }
    }, [markdown]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle mermaid rendering
    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const codeEls = el.querySelectorAll('code.language-mermaid');
        if (codeEls.length === 0) return;
        import('mermaid').then(({ default: mermaid }) => {
            mermaid.initialize({ startOnLoad: false, theme: 'default' });
            codeEls.forEach(async (code, i) => {
                const pre = code.parentElement;
                if (!pre) return;
                const graphDef = code.textContent || '';
                const id = `mermaid-${i}`;
                try {
                    const { svg } = await mermaid.render(id, graphDef);
                    const div = document.createElement('div');
                    div.innerHTML = svg;
                    div.className = 'mermaid-diagram';
                    div.style.cssText = 'padding: 16px; background: var(--bg-surface); border-radius: 10px; margin: 12px 0;';
                    pre.replaceWith(div);
                } catch (e) {
                    console.warn('Mermaid render error', e);
                }
            });
        }).catch(() => { });
    }, [html]);

    // Handle KaTeX math rendering
    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        const codeEls = el.querySelectorAll('code.language-math');
        if (codeEls.length === 0) return;
        import('katex').then(({ default: katex }) => {
            codeEls.forEach((code) => {
                const pre = code.parentElement;
                if (!pre) return;
                try {
                    const html = katex.renderToString(code.textContent || '', { throwOnError: false, displayMode: true });
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    div.style.cssText = 'padding: 12px 0; text-align: center;';
                    pre.replaceWith(div);
                } catch { }
            });
        }).catch(() => { });
    }, [html]);

    const scrollToHeading = (id: string) => {
        const el = contentRef.current?.querySelector(`#${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className={`md-preview-root ${className || ''}`}>
            <div
                ref={contentRef}
                className="md-preview-content"
                dangerouslySetInnerHTML={{ __html: html as string }}
            />
            {toc.length > 0 && (
                <nav className="md-toc">
                    <div className="md-toc-title">Contents</div>
                    {toc.map((item, i) => (
                        <button
                            key={i}
                            className={`md-toc-item h${item.level}`}
                            onClick={() => scrollToHeading(item.id)}
                            title={item.text}
                        >
                            {item.text}
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
};
