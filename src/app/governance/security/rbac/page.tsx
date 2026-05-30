/**
 * @file page.tsx
 * @description THE AUTHORITY MATRIX.
 * High-authority workbench for managing institutional roles and granular permission scopes.
 */
'use client';

import { useEffect, useState } from 'react';
import { rbacService } from '@/modules/security/services/rbac.service';
import { SecurityRole } from '@/modules/security/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Zap, 
  Activity, 
  Users, 
  ChevronRight,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Loader2,
  ChevronLeft,
  Settings2,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/lib/paths';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthorityMatrixPage() {
  const [roles, setRoles] = useState<SecurityRole[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    rbacService.getRoles().then(setRoles).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[11px] font-black uppercase tracking-widest text-primary animate-pulse">Syncing Authority Matrix...</p>
      </div>
    );
  }

  return (
    <main className="space-y-8 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(PATHS.SECURITY_COMMAND)} className="-ml-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back to command
          </Button>
          <div className="space-y-1">
             <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">Authority Matrix</h2>
             <p className="text-muted-foreground font-medium italic max-w-2xl">High-authority management of institutional roles, functional permissions, and identity trust requirements.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-14 px-8 border-2 font-black uppercase text-[10px] tracking-widest bg-background shadow-md">
              <Database className="mr-2 h-4 w-4" /> Export Matrix
           </Button>
           <Button className="font-black shadow-2xl h-14 px-6 text-[10px] uppercase tracking-widest bg-primary">
              <Plus className="mr-2 h-4 w-4" /> Define Sovereign Role
           </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-5 space-y-6">
           <Card className="shadow-2xl border-2 bg-background rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-xl font-black uppercase tracking-wide">Institutional Role Registry</CardTitle>
                    <CardDescription className="text-xs font-medium mt-2">Canonical record of operational authority nodes and their functional scopes.</CardDescription>
                 </div>
                 <Badge variant="outline" className="text-[10px] font-black border-2 h-6 uppercase px-4 rounded-full bg-background shadow-sm">
                    {roles.length} ROLES CONFIGURED
                 </Badge>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-muted/40">
                       <TableRow className="border-b-2">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest pl-12 py-6">Authority Profile</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Scope / Category</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Permission Depth</TableHead>
                          <TableHead className="text-[10px] font-black uppercase tracking-widest">Trust Req.</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase tracking-widest pr-12">Management</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       <AnimatePresence>
                          {roles.map((role, i) => (
                             <motion.tr 
                               key={role.id} 
                               initial={{ opacity: 0 }} 
                               animate={{ opacity: 1 }} 
                               transition={{ delay: i * 0.05 }}
                               className="group hover:bg-primary/[0.01] transition-colors border-b last:border-0 cursor-pointer"
                             >
                                <TableCell className="pl-12 py-8">
                                   <div className="flex items-center gap-6">
                                      <div className="h-12 w-12 rounded-xl bg-muted border-2 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                         <ShieldCheck className="h-6 w-6 text-primary opacity-60" />
                                      </div>
                                      <div className="space-y-1">
                                         <p className="font-black text-lg uppercase tracking-tighter text-foreground">{role.name}</p>
                                         <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40 tracking-widest">Assigned: {role.assignedUsers} nodes</p>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <Badge variant="secondary" className="bg-slate-900 text-white text-[8px] font-black uppercase border-none h-5 px-2">{role.category}</Badge>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-2">
                                      <span className="text-sm font-black tabular-nums">{role.permissionCount}</span>
                                      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                         <div className="h-full bg-primary" style={{ width: `${(role.permissionCount/20)*100}%` }} />
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <Badge variant="outline" className={cn(
                                      "text-[9px] font-black uppercase px-2.5 h-6 border-2 rounded-full shadow-sm",
                                      role.trustRequirement >= 90 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-green-50 text-green-700 border-green-200'
                                   )}>LEVEL {role.trustRequirement >= 90 ? 4 : 3}</Badge>
                                </TableCell>
                                <TableCell className="text-right pr-12">
                                   <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl border-2 opacity-20 group-hover:opacity-100 transition-all">
                                      <Settings2 className="h-5 w-5" />
                                   </Button>
                                </TableCell>
                             </motion.tr>
                          ))}
                       </AnimatePresence>
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <Card className="shadow-none border-2 bg-background p-6 space-y-6 rounded-2xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ecosystem Pulse</h4>
              <div className="space-y-6">
                 {[
                   { label: 'Role Coherence', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500' },
                   { label: 'Admin Finality', val: '450ms', icon: Zap, color: 'text-blue-500' },
                   { label: 'Identity Drift', val: 'Minimal', icon: Activity, color: 'text-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-6">
                         <div className="p-4 rounded-3xl bg-muted border-2 shadow-inner group-hover:bg-primary/5 transition-colors">
                            <stat.icon className={cn("h-6 w-6", stat.color)} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black tracking-tighter text-foreground">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="shadow-none border-2 bg-background p-6 text-center space-y-6 rounded-2xl border-dashed group hover:border-primary/20 transition-all duration-700">
              <Lock className="h-14 w-14 mx-auto text-muted-foreground opacity-20 group-hover:text-primary group-hover:opacity-40 transition-all duration-700" />
              <div className="space-y-2">
                 <p className="text-sm font-black uppercase tracking-tighter text-foreground">Zero-Point Gating</p>
                 <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed px-4">
                    "Every functional transition is cryptographically gated by the Authority Matrix. Non-conforming attempts trigger immediate node isolation."
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </main>
  );
}
