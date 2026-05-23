import * as Y from 'yjs';

export type AwarenessUser = {
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
};

// Singleton Y.Doc per room — survives hot-reload and StrictMode double-mount
const rooms = new Map<string, { doc: Y.Doc; yElements: Y.Map<any> }>();

// Cache the Promise itself so concurrent calls never create two providers
// for the same room — this is what prevents the "already exists" error
const providerPromises = new Map<string, Promise<any>>();

export function getYRoom(roomId: string) {
  if (rooms.has(roomId)) return rooms.get(roomId)!;
  const doc = new Y.Doc();
  const yElements = doc.getMap<any>('elements');
  rooms.set(roomId, { doc, yElements });
  return rooms.get(roomId)!;
}

export function getOrInitProvider(roomId: string, doc: Y.Doc): Promise<any> {
  if (providerPromises.has(roomId)) return providerPromises.get(roomId)!;
  // Empty signaling array = BroadcastChannel only (same browser, no external WS)
  // Avoids unreliable public signaling servers that spam console errors
  const p = import('y-webrtc').then(({ WebrtcProvider }) =>
    new WebrtcProvider(roomId, doc, { signaling: [] })
  );
  providerPromises.set(roomId, p);
  return p;
}
