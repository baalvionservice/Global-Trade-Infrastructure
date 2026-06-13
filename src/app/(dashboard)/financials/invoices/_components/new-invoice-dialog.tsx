'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { createInvoice, type CreateInvoiceInput, type InvoiceDirection, type InvoiceLineItem } from '@/services/invoice-service';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SGD', 'INR', 'CNY', 'JPY', 'AED'];

interface Props { onCreated: () => void }

const emptyLine = (): InvoiceLineItem => ({ description: '', quantity: 1, unitPrice: 0 });

export function NewInvoiceDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<InvoiceDirection>('RECEIVABLE');
  const [counterpartyName, setCounterparty] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [dueDate, setDueDate] = useState('');
  const [taxAmount, setTax] = useState('0');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<InvoiceLineItem[]>([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const total = subtotal + (Number(taxAmount) || 0);

  const setLine = (i: number, patch: Partial<InvoiceLineItem>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const reset = () => {
    setDirection('RECEIVABLE'); setCounterparty(''); setCurrency('USD'); setDueDate('');
    setTax('0'); setNotes(''); setLines([emptyLine()]); setError(null);
  };

  const canSubmit =
    counterpartyName.trim().length > 0 &&
    lines.length > 0 &&
    lines.every((l) => l.description.trim() && Number(l.quantity) > 0 && Number(l.unitPrice) >= 0);

  const submit = async () => {
    setSubmitting(true); setError(null);
    try {
      const input: CreateInvoiceInput = {
        direction,
        counterpartyName: counterpartyName.trim(),
        currency,
        taxAmount: Number(taxAmount) || 0,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
        lineItems: lines.map((l) => ({
          description: l.description.trim(),
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      };
      const created = await createInvoice(input);
      if (!created) throw new Error('Invoice creation failed');
      setOpen(false); reset(); onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> New Invoice</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Direction</Label>
            <Select value={direction} onValueChange={(v) => setDirection(v as InvoiceDirection)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEIVABLE">Receivable (customer owes us)</SelectItem>
                <SelectItem value="PAYABLE">Payable (we owe vendor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>{direction === 'RECEIVABLE' ? 'Customer' : 'Vendor'} name</Label>
            <Input value={counterpartyName} onChange={(e) => setCounterparty(e.target.value)} placeholder="Counterparty legal name" />
          </div>
          <div className="space-y-1.5">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tax amount</Label>
            <Input type="number" min="0" step="0.01" value={taxAmount} onChange={(e) => setTax(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <Label>Line items</Label>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setLines((p) => [...p, emptyLine()])}>
              <Plus className="h-3 w-3" /> Add line
            </Button>
          </div>
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <Input className="col-span-6" placeholder="Description" value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} />
              <Input className="col-span-2" type="number" min="0" step="any" placeholder="Qty" value={l.quantity} onChange={(e) => setLine(i, { quantity: Number(e.target.value) })} />
              <Input className="col-span-3" type="number" min="0" step="0.01" placeholder="Unit price" value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: Number(e.target.value) })} />
              <Button type="button" variant="ghost" size="icon" className="col-span-1" disabled={lines.length === 1} onClick={() => setLines((p) => p.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-6 text-sm mt-2 border-t pt-3">
          <span className="text-muted-foreground">Subtotal <span className="font-semibold text-foreground tabular-nums">{subtotal.toLocaleString(undefined, { style: 'currency', currency })}</span></span>
          <span className="text-muted-foreground">Total <span className="font-semibold text-foreground tabular-nums">{total.toLocaleString(undefined, { style: 'currency', currency })}</span></span>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={submit} disabled={!canSubmit || submitting}>{submitting ? 'Creating…' : 'Create draft'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
