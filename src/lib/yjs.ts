import * as Y from 'yjs';

export type AwarenessUser = {
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
};

// One Y.Doc per room — survive hot-reload
const rooms = new Map<string, { doc: Y.Doc; yElements: Y.Map<any>; provider?: any }>();

export function getYRoom(roomId: string) {
  if (rooms.has(roomId)) return rooms.get(roomId)!;
  const doc = new Y.Doc();
  const yElements = doc.getMap<any>('elements');
  const entry = { doc, yElements, provider: null };
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
