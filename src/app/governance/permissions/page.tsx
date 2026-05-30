
/**
 * @file permissions/page.tsx
 * @description RBAC Authority Matrix. Standardized management of institutional permissions.
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { USER_ROLES, PERMISSION_MATRIX, UserRole } from '@/core/roles';
import { 
  Lock, 
  ShieldCheck, 
  Users, 
  Activity, 
  History, 
  Zap, 
  ArrowRight,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function PermissionsMatrixPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.BUYER);
  const { toast } = useToast();

  const resources: any[] = ['sourcing', 'negotiation', 'settlement', 'logistics', 'compliance', 'governance', 'infrastructure'];
  const actions: any[] = ['read', 'create', 'update', 'delete', 'approve', 'audit', 'settle', 'override'];

  const handleToggle = () => {
    toast({ title: "Authority Update Staged", description: "This change requires Two-Key authorization to persist." });
  };

  return (
    <main className="space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Access Management</p>
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Authority Matrix</h2>
          <p className="text-muted-foreground font-medium italic">Define role-based access control (RBAC) and contextual permissions for institutional nodes.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm bg-background text-indigo-700 border-indigo-200 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Policy State: ENFORCING
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* ROLE SELECTOR */}
        <div className="lg:col-span-1 space-y-6">
           <h3 className="text-[11px] font-black uppercase tracking-wide text-muted-foreground ml-1">Institutional Roles</h3>
           <div className="space-y-2">
              {Object.values(USER_ROLES).map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left group",
                    selectedRole === r ? "bg-primary text-white border-primary shadow-xl scale-[1.02]" : "bg-background border-primary/5 hover:border-primary/40"
                  )}
                >
                   <span className="text-xs font-black uppercase tracking-tighter">{r}</span>
                   <ArrowRight className={cn("h-4 w-4 transition-all", selectedRole === r ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                </button>
              ))}
           </div>
        </div>

        {/* PERMISSION TABLE */}
        <div className="lg:col-span-3">
           <Card className="shadow-2xl border-2 bg-background rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b p-6">
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <CardTitle className="text-2xl font-black uppercase tracking-tighter">Permissions for {selectedRole}</CardTitle>
                       <CardDescription className="font-medium italic">Configure granular action rights for the {selectedRole} node.</CardDescription>
                    </div>
                    <Button onClick={() => toast({ title: 'Draft Saved' })} variant="outline" className="h-11 px-8 font-black uppercase text-[10px] tracking-widest border-2">SAVE DRAFT</Button>
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-muted/30 border-b">
                          <tr>
                             <th className="p-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground w-48">Domain Resource</th>
                             {actions.map(a => (
                               <th key={a} className="p-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">{a}</th>
                             ))}
                          </tr>
                       </thead>
                       <tbody className="divide-y-2">
                          {resources.map(res => (
                             <tr key={res} className="group hover:bg-primary/[0.01] transition-colors">
                                <td className="p-8 font-black text-xs uppercase tracking-tight border-r">{res}</td>
                                {actions.map(act => {
                                   const isAllowed = (PERMISSION_MATRIX as any)[selectedRole]?.[res]?.includes(act);
                                   return (
                                     <td key={act} className="p-8 text-center">
                                        <div className="flex justify-center">
                                           <Checkbox 
                                             checked={isAllowed} 
                                             onCheckedChange={handleToggle}
                                             className="h-6 w-6 rounded-lg border-2"
                                           />
                                        </div>
                                     </td>
                                   )
                                })}
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
           </Card>

           <div className="mt-10 p-6 rounded-2xl bg-primary text-primary-foreground relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 scale-125">
                 <Lock className="h-56 w-56 brightness-0 invert" />
              </div>
              <div className="relative z-10 space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Security Standard v4.2</h4>
                 <h3 className="text-3xl font-black uppercase tracking-tighter leading-[0.9]">Zero-Trust Authorization.</h3>
                 <p className="text-base font-medium leading-relaxed italic opacity-80 max-w-2xl">
                    "Baalvion uses a strictly enforced ABAC (Attribute Based Access Control) model. Permissions are context-aware and verified by the Singularity Kernel before any state mutation occurs."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
