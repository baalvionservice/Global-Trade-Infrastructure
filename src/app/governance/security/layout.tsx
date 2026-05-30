/**
 * @file governance/security/layout.tsx
 * @description Standard layout for the Security Governance module.
 */
import { ReactNode } from 'react';

export default function SecurityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      {children}
    </div>
  );
}
