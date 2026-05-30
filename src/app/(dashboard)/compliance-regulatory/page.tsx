/**
 * @file src/app/(dashboard)/compliance-regulatory/page.tsx
 * @description The updated Compliance Hub with links to rule management and classification tools.
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, AlertTriangle, ArrowRight, Plus, Gavel, Loader2, Globe, BookOpen, Settings2 } from "lucide-react";
import Link from 'next/link';
import { PATHS } from '@/lib/paths';
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';

export default function ComplianceRegulatoryPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    cleared: 0,
    issues: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await apiClient.get<any[]>('/shipments');
      const docs = toList<any>(res);
      if (res.success) {
        setStats({
          total: docs.length,
          pending: docs.filter(d => d.compliance_status === 'pending').length,
          cleared: docs.filter(d => d.compliance_status === 'cleared' || d.status === 'delivered').length,
          issues: docs.filter(d => d.compliance_status === 'flagged' || d.compliance_status === 'rejected').length
        });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    { title: "Active Audits", value: stats.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Compliance Pass", value: `${((stats.cleared / stats.total) * 100 || 0).toFixed(1)}%`, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
    { title: "Regulatory Flags", value: stats.issues, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Policy Sync", value: "Active", icon: Settings2, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <main className="flex-1 p-4 md:p-8 bg-muted/20 min-h-screen space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Compliance & Regulatory Hub</h2>
          <p className="text-muted-foreground">National oversight of trade rules, classifications, and audit trails.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="font-bold">
            <Link href={PATHS.HS_CODES}>
              <BookOpen className="mr-2 h-4 w-4" /> HS Code Library
            </Link>
          </Button>
          <Button asChild className="font-bold">
            <Link href={PATHS.COMPLIANCE_RULES}>
              <Settings2 className="mr-2 h-4 w-4" /> Manage Rules
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="shadow-none border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-none border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Audit Performance</CardTitle>
            <CardDescription>Real-time visibility into cross-border regulatory alignment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="p-8 bg-muted/30 rounded-xl border border-dashed text-center space-y-4">
                <Globe className="h-10 w-10 text-muted-foreground mx-auto opacity-30" />
                <p className="text-sm text-muted-foreground max-w-md mx-auto">The platform's compliance engine is currently validating shipments across 14 global corridors. Ensure your jurisdictional rules are up to date.</p>
                <div className="flex justify-center gap-4">
                    <Button asChild variant="outline" className="font-bold">
                        <Link href={PATHS.CUSTOMS_DECLARATIONS}>Declarations Ledger</Link>
                    </Button>
                    <Button asChild className="font-bold">
                        <Link href={PATHS.COMPLIANCE_RULES}>Update Global Rules</Link>
                    </Button>
                </div>
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="shadow-none border bg-primary text-primary-foreground border-none">
              <CardHeader>
                 <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Classification Sync
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-xs leading-relaxed opacity-90">
                    Your platform is currently synchronized with the WCO 2024 HS Nomenclature updates.
                 </p>
                 <div className="p-3 rounded bg-white/10 space-y-1">
                    <p className="text-[10px] font-bold uppercase opacity-70">Restricted HS Codes</p>
                    <p className="text-xl font-black">24 Active</p>
                 </div>
                 <Button variant="secondary" className="w-full text-[10px] font-black py-6" asChild>
                    <Link href={PATHS.HS_CODES}>BROWSE HS CATALOG</Link>
                 </Button>
              </CardContent>
           </Card>

           <Card className="shadow-none border border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-2">
                 <CardTitle className="text-[10px] font-black uppercase text-orange-700 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" />
                    Rule Violations
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-[10px] text-orange-800 leading-relaxed italic">
                    "Audit detected 4 shipments without mandatory Certificate of Origin in the India corridor."
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
