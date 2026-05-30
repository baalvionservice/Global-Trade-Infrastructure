'use client';

import { RegulatoryRule } from "@/services/customs-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, AlertOctagon, FileCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RegulatoryRulesPanel({ origin, destination }: { origin: RegulatoryRule | null, destination: RegulatoryRule | null }) {
  return (
    <Card className="shadow-none border">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
           <Globe className="h-4 w-4" />
           International Regulatory Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="destination" className="w-full">
           <TabsList className="w-full justify-start h-12 bg-muted/30 rounded-none border-b px-6 gap-6">
              <TabsTrigger value="origin" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-xs uppercase tracking-tight">
                 Export: {origin?.country || 'Origin'}
              </TabsTrigger>
              <TabsTrigger value="destination" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-xs uppercase tracking-tight">
                 Import: {destination?.country || 'Destination'}
              </TabsTrigger>
           </TabsList>
           
           <TabsContent value="origin" className="p-6 focus-visible:outline-none">
              <RulesContent rule={origin} />
           </TabsContent>
           
           <TabsContent value="destination" className="p-6 focus-visible:outline-none">
              <RulesContent rule={destination} />
           </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function RulesContent({ rule }: { rule: RegulatoryRule | null }) {
  if (!rule) return <div className="py-6 text-center text-muted-foreground text-xs italic">Intelligence data unavailable for this region.</div>;

  return (
    <div className="grid md:grid-cols-2 gap-8">
       <div className="space-y-6">
          <div className="space-y-3">
             <h4 className="text-[10px] font-black uppercase text-red-600 flex items-center gap-1.5">
                <AlertOctagon className="h-3 w-3" /> Restricted Commodities
             </h4>
             <div className="flex flex-wrap gap-2">
                {rule.restrictedItems.map((item: any) => (
                   <Badge key={item} variant="secondary" className="bg-red-50 text-red-700 border-red-100 text-[10px] font-bold">{item}</Badge>
                ))}
             </div>
          </div>
          <div className="space-y-3">
             <h4 className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1.5">
                <FileCheck className="h-3 w-3" /> Mandatory Certifications
             </h4>
             <ul className="space-y-2">
                {rule.requiredCerts.map((cert: any) => (
                   <li key={cert} className="text-xs font-medium flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-blue-400" />
                      {cert}
                   </li>
                ))}
             </ul>
          </div>
       </div>

       <div className="p-4 bg-muted/20 rounded-xl border space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
             <Info className="h-3 w-3" /> Operational Notes
          </h4>
          <p className="text-xs leading-relaxed text-muted-foreground italic">
             "{rule.notes}"
          </p>
       </div>
    </div>
  );
}
