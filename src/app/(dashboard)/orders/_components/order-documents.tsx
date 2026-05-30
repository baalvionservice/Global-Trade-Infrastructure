'use client';

import { OrderDocument } from "@/services/order-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye } from "lucide-react";
import { format } from "date-fns";

export function OrderDocuments({ documents }: { documents: OrderDocument[] }) {
  return (
    <Card className="shadow-none border">
      <CardHeader>
        <CardTitle className="text-lg">Execution Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-background rounded border">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase">
                  {doc.type} • {format(new Date(doc.uploadedAt ?? Date.now()), "MMM d")}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
               <Button variant="ghost" size="icon" className="h-8 w-8">
                 <Eye className="h-4 w-4" />
               </Button>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                 <Download className="h-4 w-4" />
               </Button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No documents available.</p>
        )}
      </CardContent>
    </Card>
  );
}
