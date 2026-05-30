
'use client';

/**
 * @file carriers/[id]/page.tsx
 * @description High-fidelity detail view for Institutional Carrier Profiles.
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCarrierById, Carrier } from '@/services/carrier-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2, Star, Globe, ShieldCheck, Award, CheckCircle2, Building2, MapPin } from 'lucide-react';
import { PATHS } from '@/lib/paths';

export default function CarrierDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;
    getCarrierById(id)
      .then(setCarrier)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!carrier) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold">Provider Not Found</h2>
        <Button onClick={() => router.push(PATHS.LOGISTICS_MARKETPLACE)} className="mt-4">Back to Marketplace</Button>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Marketplace
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="h-14 w-20 rounded-2xl bg-background border-2 border-primary/10 flex items-center justify-center text-3xl font-black text-primary shadow-sm">
                 {carrier.logo}
              </div>
              <div>
                 <h1 className="text-3xl font-bold tracking-tight">{carrier.name}</h1>
                 <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center text-yellow-500">
                       <Star className="h-4 w-4 fill-current" />
                       <span className="text-sm font-bold ml-1">{carrier.rating} / 5.0</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Global Carrier ID: {carrier.id}</span>
                 </div>
              </div>
           </div>
           <div className="flex gap-2">
              <Button variant="outline" className="font-bold">Request Capabilities Document</Button>
              <Button className="font-bold">Contact Representative</Button>
           </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <Card className="shadow-none border">
              <CardHeader>
                 <CardTitle className="text-lg">Institutional Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <p className="text-muted-foreground leading-relaxed">{carrier.description}</p>
                 <div className="grid sm:grid-cols-2 gap-8 pt-4 border-t">
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <Globe className="h-3 w-3 text-primary" /> Core Regions
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {carrier.regions.map(r => (
                            <Badge key={r} variant="outline" className="bg-muted/50">{r}</Badge>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <Building2 className="h-3 w-3 text-primary" /> HQ Location
                       </div>
                       <p className="font-semibold text-sm">Copenhagen, Denmark</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border">
              <CardHeader>
                 <CardTitle className="text-lg">Service Specializations</CardTitle>
                 <CardDescription>Verified logistics capabilities for institutional trade.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="grid sm:grid-cols-3 gap-4">
                    {carrier.specializations.map(spec => (
                      <div key={spec} className="p-4 rounded-xl border bg-muted/20 flex flex-col items-center text-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                         </div>
                         <span className="text-sm font-bold">{spec}</span>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="shadow-none border bg-primary text-primary-foreground border-none shadow-lg">
              <CardHeader>
                 <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Security & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-start gap-4">
                    <ShieldCheck className="h-10 w-10 opacity-50 shrink-0" />
                    <p className="text-xs leading-relaxed opacity-90">
                       Carrier is a Tier-1 platform partner with fully integrated API monitoring and immutable milestone reporting.
                    </p>
                 </div>
                 <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs bg-white/10 p-2 rounded">
                       <span className="opacity-70">AEO Certified</span>
                       <Award className="h-3 w-3" />
                    </div>
                    <div className="flex items-center justify-between text-xs bg-white/10 p-2 rounded">
                       <span className="opacity-70">ISO 28000 Security</span>
                       <Award className="h-3 w-3" />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="shadow-none border border-dashed p-6 text-center">
              <CardContent className="p-0 space-y-4">
                 <MapPin className="h-8 w-8 mx-auto text-muted-foreground opacity-30" />
                 <p className="text-xs text-muted-foreground">
                    Need a custom freight solution for large-scale energy infrastructure?
                 </p>
                 <Button variant="outline" className="w-full text-xs h-8">Request Enterprise Quote</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </main>
  );
}
