/**
 * @file realtime.ts
 * @description Browser WebSocket client for the Baalvion realtime layer.
 * Authenticated (JWT), auto-reconnect with exponential backoff, per-room
 * missed-event replay (tracks last event timestamp), heartbeat ping.
 */
'use client';

import { getAccessToken } from './api-client';

export type RealtimeStatus = 'connecting' | 'open' | 'closed';
export interface RealtimeEvent { event: string; data: any; ts: number; id: number; replayed?: boolean }
type EventHandler = (evt: RealtimeEvent) => void;
type StatusHandler = (status: RealtimeStatus) => void;

function wsUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const token = getAccessToken(); // in-memory access token (P0: never localStorage)
  if (!token) return null;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3025';
  const origin = base.replace(/^http/, 'ws').replace(/\/v1\/?$/, '');
  return `${origin}/ws?token=${encodeURIComponent(token)}`;
}

class RealtimeClient {
  private ws: WebSocket | null = null;
  private status: RealtimeStatus = 'closed';
  private subs = new Map<string, Set<EventHandler>>();
  private lastTs = new Map<string, number>();
  private statusListeners = new Set<StatusHandler>();
  private reconnectAttempts = 0;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private intentional = false;

  connect(): void {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.status === 'open' || this.status === 'connecting')) return;
    const url = wsUrl();
    if (!url) return;
    this.intentional = false;
    this.setStatus('connecting');
    try {
      const ws = new WebSocket(url);
      this.ws = ws;
      ws.onopen = () => {
        this.setStatus('open');
        this.reconnectAttempts = 0;
        // Re-subscribe every room, requesting replay since the last seen event.
        for (const room of this.subs.keys()) this.sendSubscribe(room);
        this.startHeartbeat();
        // Auto-subscribe the caller's org notification channel.
        const org = this.orgCode();
        if (org) this.subscribe(`org:${org}`, () => {}); // handlers attach elsewhere
      };
      ws.onmessage = (e) => this.onMessage(e);
      ws.onclose = () => { this.setStatus('closed'); this.stopHeartbeat(); if (!this.intentional) this.scheduleReconnect(); };
      ws.onerror = () => { try { ws.close(); } catch { /* */ } };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.intentional = true;
    this.stopHeartbeat();
    try { this.ws?.close(); } catch { /* */ }
    this.ws = null;
    this.setStatus('closed');
  }

  subscribe(room: string, handler: EventHandler): () => void {
    if (!this.subs.has(room)) this.subs.set(room, new Set());
    this.subs.get(room)!.add(handler);
    if (this.status === 'open') this.sendSubscribe(room);
    else this.connect();
    return () => {
      const set = this.subs.get(room);
      if (set) { set.delete(handler); if (!set.size) { this.subs.delete(room); this.send({ type: 'unsubscribe', room }); } }
    };
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusListeners.add(handler);
    handler(this.status);
    return () => this.statusListeners.delete(handler);
  }

  getStatus(): RealtimeStatus { return this.status; }

  // --- internals ---
  private orgCode(): string | null {
    try {
      // In-memory access token only (P0: never localStorage). Decode the JWT
      // payload to read the org code claim.
      const t = getAccessToken();
      if (!t) return null;
      return JSON.parse(atob(t.split('.')[1])).orgCode || null;
    } catch { return null; }
  }

  private sendSubscribe(room: string) {
    this.send({ type: 'subscribe', room, since: this.lastTs.get(room) || 0 });
  }

  private send(obj: unknown) {
    if (this.ws && this.status === 'open') { try { this.ws.send(JSON.stringify(obj)); } catch { /* */ } }
  }

  private onMessage(e: MessageEvent) {
    let m: any;
    try { m = JSON.parse(e.data); } catch { return; }
    if (m.type === 'event') {
      this.lastTs.set(m.room, Math.max(this.lastTs.get(m.room) || 0, m.ts || 0));
      const set = this.subs.get(m.room);
      if (set) set.forEach((h) => { try { h({ event: m.event, data: m.data, ts: m.ts, id: m.id, replayed: m.replayed }); } catch { /* */ } });
    }
  }

  private setStatus(s: RealtimeStatus) {
    this.status = s;
    this.statusListeners.forEach((h) => { try { h(s); } catch { /* */ } });
  }

  private scheduleReconnect() {
    if (this.intentional) return;
    const delay = Math.min(30000, 1000 * 2 ** this.reconnectAttempts);
    this.reconnectAttempts += 1;
    setTimeout(() => this.connect(), delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeat = setInterval(() => this.send({ type: 'ping' }), 25000);
  }
  private stopHeartbeat() { if (this.heartbeat) { clearInterval(this.heartbeat); this.heartbeat = null; } }
}

export const realtime = new RealtimeClient();
