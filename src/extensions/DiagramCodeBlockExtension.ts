import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CodeMirrorBlock } from '../components/MarkdownEditor/CodeMirrorBlock';

export const DiagramCodeBlockExtension = Node.create({
    name: 'codeBlock',

    addOptions() {
        return {
            languageClassPrefix: 'language-',
            HTMLAttributes: {},
        };
    },

    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,

    addAttributes() {
        return {
            language: {
                default: 'canvex',
                parseHTML: element => {
                    const classAttr = element.firstElementChild?.getAttribute('class') || '';
                    const match = classAttr.match(/^language-(.*)$/);
                    return match ? match[1] : 'canvex';
                },
            },
            diagramId: {
                default: null,
                parseHTML: () => `diag_${Math.random().toString(36).slice(2, 9)}`,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'pre',
                preserveWhitespace: 'full',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'pre',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            [
                'code',
                {
                    class: node.attrs.language
                        ? `${this.options.languageClassPrefix}${node.attrs.language}`
                        : null,
                },
                0,
            ],
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CodeMirrorBlock);
    },
});
