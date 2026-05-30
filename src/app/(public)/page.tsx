'use client';

/**
 * @file src/app/(public)/page.tsx
 * @description The authoritative Home Page for the Baalvion OS.
 * Restored as the single source of truth for the root entry point.
 */

import { HomeClient } from './_components/home-client';
import { Metadata } from 'next';

export default function RootHomePage() {
  return <HomeClient />;
}