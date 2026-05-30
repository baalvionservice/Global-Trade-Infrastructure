'use client';

import { useEffect, useRef, useState } from 'react';
import { realtime, RealtimeStatus, RealtimeEvent } from '@/lib/realtime';

/** Live connection status (connecting/open/closed). */
export function useRealtimeStatus(): RealtimeStatus {
  const [status, setStatus] = useState<RealtimeStatus>(realtime.getStatus());
  useEffect(() => realtime.onStatus(setStatus), []);
  return status;
}

/**
 * Subscribe to a realtime room for the component's lifetime. The handler is
 * held in a ref so it can change between renders without churning the
 * subscription; resubscription only happens when `room` changes.
 */
export function useRoom(room: string | null | undefined, handler: (evt: RealtimeEvent) => void): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!room) return undefined;
    const unsub = realtime.subscribe(room, (evt) => ref.current(evt));
    return unsub;
  }, [room]);
}
