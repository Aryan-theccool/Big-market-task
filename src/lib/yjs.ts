import * as Y from 'yjs';

export type AwarenessUser = {
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
};

export interface MarkdownComment {
  id: string;
  from: number;
  to: number;
  text: string;
  author: string;
  authorColor: string;
  createdAt: number;
  resolved: boolean;
  mentions: string[];
}

export interface MarkdownSnapshot {
  id: string;
  content: string;  // Serialized JSON snapshot
  wordCount: number;
  author: string;
  timestamp: number;
  label?: string;   // Named version label
}

// One Y.Doc per room — survive hot-reload
const rooms = new Map<string, {
  doc: Y.Doc;
  yElements: Y.Map<any>;
  yDiagramRegistry: Y.Map<any>;
  // Markdown editor shared types
  markdownContent: Y.XmlFragment;
  markdownMeta: Y.Map<any>;
  codeBlocks: Y.Map<Y.Text>;
  markdownComments: Y.Array<MarkdownComment>;
  markdownSnapshots: Y.Array<MarkdownSnapshot>;
  provider?: any;
}>();

export function getYRoom(roomId: string) {
  if (rooms.has(roomId)) return rooms.get(roomId)!;
  const doc = new Y.Doc();

  // Canvas elements map
  const yElements = doc.getMap<any>('elements');
  const yDiagramRegistry = doc.getMap<any>('diagramRegistry');

  // Markdown collaborative types
  const markdownContent = doc.getXmlFragment('markdownContent');
  const markdownMeta = doc.getMap<any>('markdownMeta');
  const codeBlocks = doc.getMap<Y.Text>('codeBlocks');
  const markdownComments = doc.getArray<MarkdownComment>('markdownComments');
  const markdownSnapshots = doc.getArray<MarkdownSnapshot>('markdownSnapshots');

  const entry = {
    doc,
    yElements,
    yDiagramRegistry,
    markdownContent,
    markdownMeta,
    codeBlocks,
    markdownComments,
    markdownSnapshots,
    provider: null,
  };
  rooms.set(roomId, entry);
  return entry;
}

export async function initWebRTC(roomId: string, doc: Y.Doc) {
  const room = rooms.get(roomId);
  if (room && room.provider) {
    return room.provider;
  }
  const { WebrtcProvider } = await import('y-webrtc');
  if (room && room.provider) {
    return room.provider;
  }
  const provider = new WebrtcProvider(roomId, doc, {
    signaling: [
      'ws://localhost:4444',
      'wss://signaling.yjs.dev',
    ],
  });
  if (room) {
    room.provider = provider;
  }
  return provider;
}

export function destroyWebRTC(roomId: string) {
  const room = rooms.get(roomId);
  if (room && room.provider) {
    try {
      room.provider.destroy();
    } catch (e) {
      console.warn('Error destroying WebrtcProvider:', e);
    }
    room.provider = null;
  }
}

/** Helper to get or create a Y.Text for a specific code block */
export function getYCodeBlock(roomId: string, blockId: string): Y.Text {
  const room = getYRoom(roomId);
  if (!room.codeBlocks.has(blockId)) {
    room.doc.transact(() => {
      room.codeBlocks.set(blockId, new Y.Text());
    });
  }
  return room.codeBlocks.get(blockId)!;
}
