'use client';

/**
 * @file trade-ops/_components/new-shipment-dialog.tsx
 * @description Create a new shipment through the live trade-service. Gated to roles that may edit
 * operational records (the API remains the authoritative gate).
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCreateShipment, errorMessage } from '@/api';

type Props = { onCreated: (id: number) => void };

export function NewShipmentDialog({ onCreated }: Props) {
  const { toast } = useToast();
  const create = useCreateShipment();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    carrier_name: '',
    vessel_name: '',
    container_id: '',
    tracking_number: '',
    origin: '',
    destination: '',
    value: '',
    currency: 'USD',
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit() {
    try {
      const shipment = await create.mutateAsync({
        carrier_name: form.carrier_name || undefined,
        vessel_name: form.vessel_name || undefined,
        container_id: form.container_id || undefined,
        tracking_number: form.tracking_number || undefined,
        origin: form.origin || undefined,
        destination: form.destination || undefined,
        value: form.value ? Number(form.value) : undefined,
        currency: form.currency.toUpperCase() || undefined,
      });
      toast({ title: 'Shipment created', description: `Shipment #${shipment.id} is now ${shipment.status}.` });
      setOpen(false);
      onCreated(shipment.id);
    } catch (err) {
      toast({ title: 'Could not create shipment', description: errorMessage(err), variant: 'destructive' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> New Shipment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Shipment</DialogTitle>
          <DialogDescription>Opens a tenant-scoped shipment in the TradeOps Cloud and begins its lifecycle.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <Field label="Carrier"><Input value={form.carrier_name} onChange={set('carrier_name')} placeholder="Maersk" /></Field>
          <Field label="Vessel"><Input value={form.vessel_name} onChange={set('vessel_name')} placeholder="MV Trade Wind" /></Field>
          <Field label="Origin"><Input value={form.origin} onChange={set('origin')} placeholder="Singapore Port" /></Field>
          <Field label="Destination"><Input value={form.destination} onChange={set('destination')} placeholder="Jebel Ali, UAE" /></Field>
          <Field label="Container"><Input value={form.container_id} onChange={set('container_id')} placeholder="MRKU-7781234" /></Field>
          <Field label="Tracking No"><Input value={form.tracking_number} onChange={set('tracking_number')} placeholder="TRK-..." /></Field>
          <Field label="Value"><Input type="number" value={form.value} onChange={set('value')} placeholder="50000" /></Field>
          <Field label="Currency"><Input value={form.currency} onChange={set('currency')} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={create.isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={create.isPending}>
            {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create
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
