'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useAppState } from '@/app/(dashboard)/_components/app-state';
import { useToast } from '@/hooks/use-toast';
import { tradeCommandService } from '@/services/trade-command-service';

type Props = { onCreated: (id: string) => void };

export function NewTradeDialog({ onCreated }: Props) {
  const { userId, role, tenantId } = useAppState();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    commodity: 'Arabica Coffee',
    quantity: '100',
    unitPrice: '12.5',
    currency: 'USD',
    buyerName: 'Acme Importers',
    supplierName: 'Fazenda Verde',
    originCountry: 'BR',
    destinationCountry: 'US',
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const trade = await tradeCommandService.create(
        {
          organizationName: `Tenant ${tenantId}`,
          organizationSlug: `tenant-${tenantId}`,
          terms: {
            buyerId: form.buyerName,
            sellerId: form.supplierName,
            commodity: form.commodity,
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice),
            currency: form.currency.toUpperCase(),
            originCountry: form.originCountry.toUpperCase(),
            destinationCountry: form.destinationCountry.toUpperCase(),
          },
          buyer: { name: form.buyerName },
          supplier: { name: form.supplierName },
        },
        { userId, role, orgId: tenantId },
      );
      toast({ title: 'Trade created', description: `${trade.reference} is now at ${trade.currentState.replace(/_/g, ' ')}.` });
      setOpen(false);
      onCreated(trade.id);
    } catch (err) {
      toast({ title: 'Could not create trade', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Initiate Trade Transaction</DialogTitle>
          <DialogDescription>Opens a TradeTransaction and drives it to RFQ submission through the orchestration kernel.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <Field label="Commodity"><Input value={form.commodity} onChange={set('commodity')} /></Field>
          <Field label="Currency"><Input value={form.currency} onChange={set('currency')} /></Field>
          <Field label="Quantity"><Input type="number" value={form.quantity} onChange={set('quantity')} /></Field>
          <Field label="Unit Price"><Input type="number" value={form.unitPrice} onChange={set('unitPrice')} /></Field>
          <Field label="Buyer"><Input value={form.buyerName} onChange={set('buyerName')} /></Field>
          <Field label="Supplier"><Input value={form.supplierName} onChange={set('supplierName')} /></Field>
          <Field label="Origin (ISO2)"><Input value={form.originCountry} onChange={set('originCountry')} /></Field>
          <Field label="Destination (ISO2)"><Input value={form.destinationCountry} onChange={set('destinationCountry')} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
