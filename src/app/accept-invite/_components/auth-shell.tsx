'use client';

/**
 * @file auth-shell.tsx
 * @description Shared split-branded chrome for the public auth surface (accept-invite,
 * forgot-password, reset-password). Mirrors the login page's exact visual language so the
 * sibling pages read as one coherent institutional gateway. Standalone — imports no
 * dashboard-only providers.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BaalvionLogo } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { PATHS } from '@/lib/paths';

interface AuthShellProps {
  /** Right-rail card content (header + form + footer). */
  children: ReactNode;
  /** Brand-side headline override (defaults to the login headline). */
  brandHeadline?: ReactNode;
  /** Brand-side supporting copy override. */
  brandSubcopy?: ReactNode;
}

export function AuthShell({ children, brandHeadline, brandSubcopy }: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-primary selection:text-white">
      {/* Brand Side */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-primary text-primary-foreground relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent"
        />

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10"
        >
          <Link href={PATHS.HOME} className="flex items-center gap-4 group">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 group-hover:scale-105 transition-transform">
              <BaalvionLogo className="h-10 w-10 brightness-0 invert" />
            </div>
            <span className="text-3xl font-black uppercase tracking-tighter">Baalvion</span>
          </Link>
        </motion.div>

        <div className="relative z-10 space-y-8 max-w-xl">
          <motion.h1
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-black leading-[0.9] tracking-tighter uppercase"
          >
            {brandHeadline ?? (
              <>
                The Operating <br />System for <br />Global Trade.
              </>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-medium leading-relaxed italic"
          >
            {brandSubcopy ??
              'Connect trade execution, finance, compliance, and logistics within a single governed infrastructure.'}
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">
          <span className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400" /> Baalvion Sentinel Active
          </span>
          <span>v4.2.0-stable</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-muted/20 relative">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[460px] relative z-10"
        >
          <Card className="shadow-2xl border-2 ring-1 ring-black/5 overflow-hidden">{children}</Card>
        </motion.div>
      </div>
    </div>
  );
}
