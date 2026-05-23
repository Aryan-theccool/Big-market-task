'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBoardsStore } from '../../store/boardsStore';

export default function BoardRedirect() {
  const router = useRouter();

  useEffect(() => {
    useBoardsStore.getState().hydrate();
    const id = useBoardsStore.getState().createBoard();
    router.replace('/board/' + id);
  }, [router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg-canvas)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)' }}>Creating board…</p>
      </div>
    </div>
  );
}
