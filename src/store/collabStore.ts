import { create } from 'zustand';

export interface RemoteUser {
  clientId: number;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
}

interface CollabState {
  remoteUsers: RemoteUser[];
  setRemoteUsers: (users: RemoteUser[]) => void;
}

export const useCollabStore = create<CollabState>((set) => ({
  remoteUsers: [],
  setRemoteUsers: (remoteUsers) => set({ remoteUsers }),
}));
