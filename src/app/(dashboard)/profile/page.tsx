
'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { getProfile, getCompany, UserProfile, Company } from '@/services/profile-service';
import { submitKYC, getTrustBadgeConfig } from '@/services/verification-service';
import { getRiskBadgeConfig } from '@/services/risk-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShieldCheck, User, Building, ExternalLink, Loader2, Upload, 
  CheckCircle2, ShieldAlert, Award, Star, AlertTriangle, 
  Scale, CreditCard, Activity, Zap, TrendingUp 
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAppState } from '../_components/app-state';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingKYC, setSubmittingKYC] = useState(false);
  const { toast } = useToast();
  const { role } = useAppState();

  const fetchData = async () => {
    setLoading(true);
    const p = await getProfile();
    const c = await getCompany(p.companyId);
    setProfile(p);
    setCompany(c);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = () => {
    toast({ title: "Profile Updated", description: "Changes have been securely saved." });
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || !company) return null;

  const trustConfig = getTrustBadgeConfig(company.trustScore || 0);

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 bg-muted/20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Institutional Identity</h2>
          <p className="text-muted-foreground font-medium italic">Manage your corporate node, subscription tier, and ecosystem credentials.</p>
        </div>
        <Button asChild variant="outline" className="font-bold border-2 h-12 shadow-sm">
          <Link href={`/company/${company.id}`}>
            <ExternalLink className="mr-2 h-4 w-4" /> View Public Registry
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN - ACCOUNT PULSE */}
        <div className="space-y-8">
          <Card className="shadow-xl border-2 border-primary/10 overflow-hidden bg-background rounded-2xl">
             <CardContent className="p-0">
                <div className="bg-primary h-24 relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>
                <div className="px-8 pb-6 -mt-12 text-center relative">
                   <div className="mx-auto h-28 w-24 rounded-2xl border-4 border-background bg-card flex items-center justify-center text-3xl font-black text-primary shadow-2xl">
                     {profile.name.charAt(0)}
                   </div>
                   <h3 className="mt-6 text-2xl font-black uppercase tracking-tighter">{profile.name}</h3>
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wide opacity-40 mt-1">{profile.email}</p>
                   <div className="mt-6">
                      <Badge className="bg-primary text-white uppercase text-[10px] font-black px-4 py-1.5 tracking-wide rounded-full shadow-lg">
                        {role}
                      </Badge>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="shadow-xl border-2 border-primary/5 bg-background rounded-2xl">
            <CardHeader className="pb-6 border-b border-muted py-8 px-6">
              <CardTitle className="text-[10px] font-black uppercase tracking-wide text-muted-foreground flex items-center gap-3">
                 <ShieldCheck className="h-5 w-5 text-primary" /> Subscription Tier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6 px-6">
               <div className="p-6 rounded-3xl bg-indigo-50 border-2 border-indigo-100 space-y-6">
                  <div className="flex items-center justify-between">
                     <Badge className="bg-indigo-600 text-white text-[9px] font-black h-6 px-3 uppercase tracking-widest border-none">INSTITUTIONAL PRO</Badge>
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest opacity-60">Tier Expiry</p>
                     <p className="text-sm font-black text-indigo-950 uppercase tracking-tight">Dec 31, 2024</p>
                  </div>
                  <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-[9px]">UPGRADE TIER</Button>
               </div>
               
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                     <span>Active Usage</span>
                     <span>82%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-primary" style={{ width: '82%' }} />
                  </div>
                  <p className="text-[9px] text-center font-bold text-muted-foreground opacity-40 uppercase tracking-widest">Usage-based settlement: Active</p>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - MANAGEMENT */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="corporate" className="space-y-8">
            <TabsList className="bg-background border-2 p-1 gap-1 h-12 rounded-2xl shadow-sm w-fit">
              <TabsTrigger value="corporate" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-8 rounded-xl tracking-widest">Corporate Profile</TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-8 rounded-xl tracking-widest">Billing & Usage</TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase h-full px-8 rounded-xl tracking-widest">API & Keys</TabsTrigger>
            </TabsList>

            <TabsContent value="corporate">
              <Card className="shadow-xl border-2 border-primary/5 rounded-2xl overflow-hidden">
                <CardHeader className="bg-muted/10 border-b py-6 px-6">
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <Building className="h-7 w-7 text-primary" /> Institutional Registry
                  </CardTitle>
                  <CardDescription className="font-medium text-sm italic">Maintain your authoritative corporate node data for the global ledger.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground ml-1">Legal Entity Name</Label>
                      <Input defaultValue={company.name} className="h-14 font-bold border-2 rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground ml-1">Jurisdictional Node</Label>
                      <Input defaultValue={company.country} disabled className="h-14 font-bold border-2 rounded-2xl bg-muted/30 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wide text-muted-foreground ml-1">Institutional Mission Statement</Label>
                    <Textarea defaultValue={company.description} rows={5} className="font-medium border-2 rounded-2xl p-6 leading-relaxed italic" />
                  </div>
                  <Button onClick={handleUpdate} className="h-14 px-6 font-black uppercase tracking-widest text-[11px] shadow-2xl">Authorize Record Update</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
               <Card className="shadow-xl border-2 border-primary/5 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-muted/10 border-b py-6 px-6">
                     <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                        <CreditCard className="h-7 w-7 text-primary" /> Usage Metering
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                     <div className="grid sm:grid-cols-3 gap-8">
                        {[
                          { label: 'RFQs PROCESSED', val: '42', quota: 'Unlimited', icon: Zap },
                          { label: 'SHIPMENTS TRACKED', val: '124', quota: '500 Max', icon: MapPin },
                          { label: 'TRANS. SETTLED', val: '$12.4M', quota: 'TIER 1', icon: TrendingUp }
                        ].map(kpi => (
                           <div key={kpi.label} className="p-6 rounded-2xl border-2 bg-muted/5 space-y-3 hover:border-primary/20 transition-all group">
                              <kpi.icon className="h-5 w-5 text-primary opacity-40 group-hover:scale-110 transition-transform" />
                              <div>
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
                                 <p className="text-2xl font-black tracking-tighter">{kpi.val}</p>
                              </div>
                              <p className="text-[8px] font-black text-muted-foreground/60 uppercase">{kpi.quota}</p>
                           </div>
                        ))}
                     </div>
                     <div className="p-6 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-2xl">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-wide text-white/40">Aggregated Fee Pulse</p>
                           <p className="text-3xl font-black tracking-tighter">$1,452.42</p>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-black h-12 rounded-2xl text-[10px] uppercase px-8">PAY STATEMENT</Button>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="api">
               <Card className="shadow-xl border-2 border-primary/5 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-muted/10 border-b py-6 px-6 flex flex-row items-center justify-between">
                     <div>
                        <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                           <Activity className="h-7 w-7 text-primary" /> Integration Oracle
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Provision developer credentials for the Baalvion API.</CardDescription>
                     </div>
                     <Button className="font-black text-[9px] uppercase tracking-widest h-11 px-6 rounded-2xl shadow-lg">CREATE API KEY</Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                     <div className="space-y-6">
                        <div className="p-6 rounded-3xl border-2 bg-muted/5 flex items-center justify-between group">
                           <div className="space-y-1">
                              <p className="font-black text-sm uppercase tracking-tight">Main Production Key</p>
                              <p className="font-mono text-xs text-muted-foreground">bv_live_88f...A992</p>
                           </div>
                           <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="font-black text-[9px] uppercase opacity-40 group-hover:opacity-100">REVOKE</Button>
                              <Button variant="outline" size="sm" className="font-black text-[9px] uppercase border-2">COPY</Button>
                           </div>
                        </div>
                     </div>
                     <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-100 flex gap-4 text-amber-900">
                        <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
                        <p className="text-xs font-bold leading-relaxed">
                           API keys grant full programmatic access to institutional liquidity and documents. Store these nodes securely and never commit them to public code repositories.
                        </p>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
