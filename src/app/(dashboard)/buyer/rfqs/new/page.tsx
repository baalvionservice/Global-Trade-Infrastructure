'use client';

import { RFQForm } from "../_components/rfq-form";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NewRFQPage() {
  const router = useRouter();

  return (
    <main className="flex-1 space-y-8 p-4 md:p-8 bg-muted/20 min-h-screen">
      <div className="space-y-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="-ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to RFQs
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Create Request for Quotation</h2>
        <p className="text-muted-foreground">Broadcast your sourcing requirements to verified global suppliers.</p>
      </div>

      <div className="pb-20">
        <RFQForm />
      </div>
    </main>
  );
}
