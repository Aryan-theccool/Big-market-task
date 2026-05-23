'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function roomId() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

export default function BoardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/board/' + roomId());
  }, [router]);

  return null;
}
