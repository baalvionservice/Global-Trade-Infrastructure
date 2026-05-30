'use client';

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { submitQuote } from "@/services/rfq-service";
import { useState } from "react";
import { Loader2, DollarSign, Clock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { PATHS } from "@/lib/paths";

interface QuoteFormProps {
  rfqId: string;
}

export function QuoteForm({ rfqId }: QuoteFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      price: 0,
      deliveryTime: "",
      message: "",
    },
  });

  async function onSubmit(values: any) {
    setIsSubmitting(true);
    try {
      await submitQuote({
        rfqId,
        sellerName: "Global Power Systems", 
        ...values
      });
      toast({
        title: "Quote Submitted",
        description: "Your quotation has been sent to the buyer for review.",
      });
      router.push(PATHS.SELLER_RESPONSES);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not submit your quote. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-none border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Submit Quotation
            </CardTitle>
            <CardDescription>Provide your competitive bid.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="price"
              rules={{ required: "Price is required", min: 0.01 }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offered Unit Price (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryTime"
              rules={{ required: "Lead time is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Delivery Lead Time
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 30 days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Message to Buyer
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Include technical specs or warranties." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Quotation
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
