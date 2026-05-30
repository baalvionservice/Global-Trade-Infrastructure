'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCompany, getTrustMetrics, Company, TrustMetrics } from '@/services/profile-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Globe, Award, MapPin, Building2, Calendar, ShieldCheck, Activity, BarChart3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PublicCompanyPage() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [trust, setTrust] = useState<TrustMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;
    Promise.all([getCompany(id), getTrustMetrics(id)])
      .then(([c, t]) => {
        setCompany(c);
        setTrust(t);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company || !trust) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-muted-foreground">
        Institution record not found.
      </div>
    );
  }

  const badgeColors = {
    basic: "bg-gray-100 text-gray-600 border-gray-200",
    verified: "bg-blue-100 text-blue-700 border-blue-200",
    premium: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <main className="flex-1 bg-muted/20 min-h-screen">
      {/* Hero Header */}
      <div className="bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-8 md:px-8">
           <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border-2 border-primary/5">
                 <Building2 className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                 <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">{company.name}</h1>
                    <Badge className={cn("px-2 py-1 uppercase text-[10px] font-bold", badgeColors[company.badge])}>
                      {company.badge} Institution
                    </Badge>
                 </div>
                 <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {company.country}</div>
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <div className="flex items-center gap-1.5"><Activity className="h-4 w-4" /> {company.industry}</div>
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Established {company.foundedYear}</div>
                 </div>
                 <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs bg-background">Institutional Member</Badge>
                    <Badge variant="outline" className="text-xs bg-background">Verified Counterparty</Badge>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:px-8 grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="shadow-none border">
              <CardHeader>
                <CardTitle className="text-lg">About Institution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <p className="text-muted-foreground leading-relaxed">
                   {company.description}
                 </p>
                 <div className="pt-4 border-t grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Industry Focus</h4>
                       <p className="font-medium">{company.industry}</p>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Primary Jurisdiction</h4>
                       <p className="font-medium">{company.country}</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border">
              <CardHeader>
                 <CardTitle className="text-lg">Compliance & Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {company.certifications.map((cert) => (
                      <div key={cert} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                         <Award className="h-5 w-5 text-primary shrink-0" />
                         <span className="text-sm font-semibold">{cert}</span>
                      </div>
                    ))}
                 </div>
                 <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-700">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-medium">All certifications have been independently verified by Baalvion Compliance Services.</span>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Trust & Reputation Sidebar */}
        <div className="space-y-6">
           <Card className="shadow-none border bg-primary text-primary-foreground border-none">
              <CardHeader className="pb-2">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Trade Trust Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-end justify-between">
                    <span className="text-4xl font-black">{trust.score}</span>
                    <span className="text-xs opacity-70">Top 5% of Global Sellers</span>
                 </div>
                 <Progress value={(trust.score / 1000) * 100} className="h-2 bg-white/20" />
                 <p className="text-[10px] opacity-70 italic leading-relaxed">
                   Calculated based on settlement history, compliance consistency, and counterparty feedback.
                 </p>
              </CardContent>
           </Card>

           <Card className="shadow-none border">
              <CardHeader className="pb-2">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Institutional Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                       <BarChart3 className="h-4 w-4 text-primary" />
                       <span>Completed Orders</span>
                    </div>
                    <span className="font-bold">{trust.completedOrders}</span>
                 </div>
                 <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2 text-sm">
                       <Activity className="h-4 w-4 text-primary" />
                       <span>Response Rate</span>
                    </div>
                    <span className="font-bold">{trust.responseRate}%</span>
                 </div>
                 <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2 text-sm">
                       <Calendar className="h-4 w-4 text-primary" />
                       <span>Avg Response Time</span>
                    </div>
                    <span className="font-bold">{trust.avgResponseTime}</span>
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border border-dashed text-center p-6">
              <CardContent className="p-0 space-y-4">
                 <Globe className="h-8 w-8 text-muted-foreground mx-auto opacity-30" />
                 <p className="text-xs text-muted-foreground">
                   Need more detailed operational history?
                 </p>
                 <Button variant="outline" className="w-full text-xs h-8">Request Audit Log</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
