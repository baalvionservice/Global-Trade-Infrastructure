'use client';

/**
 * @file trade-ops/_components/hs-panel.tsx
 * @description HS classification tab — AI product→HS-code suggestion with confidence, controls
 * flags, and duty estimation for the destination market.
 */
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHsSuggest, errorMessage, type Shipment, type HsSuggestionReport } from '@/api';

export function HsPanel({ shipment }: { shipment: Shipment | undefined }) {
  const { toast } = useToast();
  const suggest = useHsSuggest();
  const [product, setProduct] = useState('');
  const [report, setReport] = useState<HsSuggestionReport | null>(null);

  async function run() {
    if (product.trim().length < 3) return;
    try {
      const res = await suggest.mutateAsync({
        product_description: product.trim(),
        destination_country: shipment?.destination ?? undefined,
        origin_country: shipment?.origin ?? undefined,
      });
      setReport(res.suggestion_report);
    } catch (err) {
      toast({ title: 'Suggestion failed', description: errorMessage(err), variant: 'destructive' });
    }
  }

  const candidates = report?.candidates ?? [];
  const recommended = report?.recommended ?? null;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">HS Code Classification</CardTitle>
          <CardDescription>Describe the goods to get ranked HS-code candidates and an estimated duty for the destination.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Product description</Label>
            <div className="flex gap-2">
              <Input
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. roasted arabica coffee beans, not decaffeinated"
                onKeyDown={(e) => { if (e.key === 'Enter') void run(); }}
              />
              <Button onClick={run} disabled={suggest.isPending || product.trim().length < 3}>
                {suggest.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Suggest
              </Button>
            </div>
          </div>
          {recommended && (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Recommended</p>
              <p className="font-mono text-lg font-bold">{recommended.hs_code}</p>
              <p className="text-sm">{recommended.description}</p>
              {report?.duty && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Est. duty {report.duty.effective_rate ?? report.duty.base_rate ?? '—'}%
                  {report.duty.calculated_duty != null ? ` · ${report.duty.calculated_duty} ${report.duty.currency ?? ''}` : ''}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {candidates.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Candidates</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>HS Code</TableHead><TableHead>Description</TableHead><TableHead>Method</TableHead><TableHead>Confidence</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c, i) => (
                  <TableRow key={`${c.hs_code}-${i}`}>
                    <TableCell className="font-mono text-xs font-medium">{c.hs_code}</TableCell>
                    <TableCell className="text-xs">{c.description}</TableCell>
                    <TableCell className="text-xs">{c.method ?? '—'}</TableCell>
                    <TableCell>{c.confidence != null ? <Badge variant="outline">{c.confidence}%</Badge> : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
