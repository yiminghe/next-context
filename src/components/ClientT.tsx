'use client';
import { useRouter } from 'next/navigation';
import { SharedT } from './SharedT';

export function ClientT() {
  const router = useRouter();
  return (
    <>
      <div>
        <a onClick={() => router.refresh()}>reload</a>
      </div>
      <h2>ClientT</h2>
      <SharedT />
    </>
  );
}
