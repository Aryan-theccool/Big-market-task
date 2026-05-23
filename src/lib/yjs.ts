import * as Y from 'yjs';

export type AwarenessUser = {
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
};

// One Y.Doc per room — survive hot-reload
const rooms = new Map<string, { doc: Y.Doc; yElements: Y.Map<any> }>();

export function getYRoom(roomId: string) {
  if (rooms.has(roomId)) return rooms.get(roomId)!;
  const doc = new Y.Doc();
  const yElements = doc.getMap<any>('elements');
  const entry = { doc, yElements };
  rooms.set(roomId, entry);
  return entry;
}

export async function initWebRTC(roomId: string, doc: Y.Doc) {
  const { WebrtcProvider } = await import('y-webrtc');
  return new WebrtcProvider(roomId, doc, {
    signaling: ['wss://signaling.yjs.dev'],
  });
}
