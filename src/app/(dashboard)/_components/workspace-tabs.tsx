/**
 * @file workspace-tabs.tsx
 * @description Operational session tab manager. Provides rapid switching between active trade mandates.
 */
'use client';

import React from 'react';
import { useWorkspaceStore, WorkspaceTab } from '@/modules/workspace/store/workspace-store';
import { X, Layout, Maximize2, Columns, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';

export function WorkspaceTabs() {
  const { tabs, activeTabId, removeTab, setActiveTab } = useWorkspaceStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleTabClick = (tab: WorkspaceTab) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center gap-1 h-12 bg-muted/30 border-b px-4 overflow-hidden overflow-x-auto no-scrollbar scroll-smooth shrink-0">
      <AnimatePresence initial={false}>
        {tabs.map((tab) => {
          const isActive = tab.path === pathname;
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className={cn(
                "group relative flex items-center h-9 min-w-[140px] max-w-[200px] px-4 rounded-t-xl border-x border-t transition-all cursor-pointer select-none",
                isActive 
                  ? "bg-background border-primary/20 shadow-sm z-10" 
                  : "bg-transparent border-transparent hover:bg-white/40 text-muted-foreground"
              )}
              onClick={() => handleTabClick(tab)}
            >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tight truncate flex-1",
                isActive ? "text-primary" : ""
              )}>
                {tab.title}
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-5 w-5 rounded-md p-0 opacity-0 group-hover:opacity-100 transition-opacity ml-2",
                  isActive ? "text-primary/40 hover:text-red-500 hover:bg-red-50" : "text-muted-foreground/40 hover:bg-black/5"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>

              {isActive && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
