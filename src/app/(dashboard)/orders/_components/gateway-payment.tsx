'use client';

/**
 * Consumer gateway checkout for a GTI order — a direct settlement rail (Razorpay / Stripe / PayU /
 * bank) alongside escrow. The shopper picks a gateway; we create a backend payment intent, then hand
 * off to the provider's hosted flow (Razorpay popup / Stripe redirect / PayU form-POST) or show bank
 * wire instructions. Capture is verified SERVER-SIDE — success only shows on a real 'confirmed'.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, Globe, Building2, Loader2, ShieldCheck } from 'lucide-react';
import {
  createPaymentIntent,
  capturePayment,
  type GatewaySlug,
  type Order,
} from '@/services/order-service';

declare global {
  interface Window { Razorpay?: new (opts: unknown) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void } }
}

const GATEWAYS: { id: GatewaySlug; label: string; desc: string; Icon: typeof CreditCard }[] = [
  { id: 'razorpay', label: 'Card · UPI · Netbanking', desc: 'Razorpay', Icon: Smartphone },
  { id: 'stripe', label: 'International Card', desc: 'Stripe', Icon: CreditCard },
  { id: 'payu', label: 'International', desc: 'PayU · cards worldwide', Icon: Globe },
  { id: 'bank', label: 'Bank Transfer', desc: 'Wire · settles in 1–2 days', Icon: Building2 },
];

let razorpayScript: Promise<void> | null = null;
function loadRazorpay(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScript) return razorpayScript;
  razorpayScript = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => { razorpayScript = null; reject(new Error('failed to load Razorpay')); };
    document.body.appendChild(s);
  });
  return razorpayScript;
}

function submitPayuForm(formPost: { action: string; fields: Record<string, string> }) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = formPost.action;
  Object.entries(formPost.fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export function GatewayPayment({ order, onPaid }: { order: Order; onPaid: (o: Order) => void }) {
  const { toast } = useToast();
  const [gateway, setGateway] = useState<GatewaySlug>('razorpay');
  const [busy, setBusy] = useState(false);
  const [instructions, setInstructions] = useState<string | null>(null);

  const fail = (description: string) => {
    setBusy(false);
    toast({ variant: 'destructive', title: 'Payment Failed', description });
  };

  const pay = async () => {
    setBusy(true);
    setInstructions(null);
    try {
      const intent = await createPaymentIntent(order.id, gateway);

      // Stripe → hosted Checkout redirect.
      if (intent.redirectUrl) { window.location.href = intent.redirectUrl; return; }

      // PayU → signed form-POST to the hosted page.
      if (intent.formPost) { submitPayuForm(intent.formPost); return; }

      // Bank transfer → order reserved/unpaid; show the wire instructions.
      if (intent.instructions || gateway === 'bank') {
        setInstructions(intent.instructions || 'Our team will email you the wire details and reference shortly.');
        setBusy(false);
        return;
      }

      // Razorpay → in-page popup; capture only after a server-verified HMAC.
      if (intent.keyId) {
        await loadRazorpay();
        if (!window.Razorpay) { fail('Payment is still loading — please try again.'); return; }
        const rzp = new window.Razorpay({
          key: intent.keyId,
          order_id: intent.intentId,
          amount: intent.amount,
          currency: intent.currency,
          name: 'Baalvion Trade',
          description: `Order ${order.id.slice(0, 8)}`,
          theme: { color: '#0f172a' },
          handler: async (r: unknown) => {
            const resp = r as { razorpay_payment_id?: string; razorpay_order_id?: string; razorpay_signature?: string };
            try {
              const updated = await capturePayment(order.id, intent.intentId, 'razorpay', {
                razorpay_payment_id: resp.razorpay_payment_id || '',
                razorpay_order_id: resp.razorpay_order_id || '',
                razorpay_signature: resp.razorpay_signature || '',
              });
              if (updated.paymentStatus === 'confirmed') {
                toast({ title: 'Payment Confirmed', description: `Order ${order.id.slice(0, 8)} is settled.` });
                onPaid(updated);
              } else {
                fail('Payment could not be verified.');
              }
            } catch (e) {
              fail(e instanceof Error ? e.message : 'Payment confirmation failed.');
            }
          },
          modal: { ondismiss: () => setBusy(false) },
        });
        rzp.open();
        return;
      }

      fail('We could not start your card payment. Please choose another method.');
    } catch (e) {
      fail(e instanceof Error ? e.message : 'Could not start the payment.');
    }
  };

  const amountLabel = `${order.currency} ${Number(order.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <Card className="shadow-none border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> Pay by Gateway
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {instructions ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Bank Transfer Instructions
            </p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{instructions}</p>
            <p className="text-[11px] italic text-muted-foreground">The order stays reserved until we confirm your transfer.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GATEWAYS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGateway(g.id)}
                  aria-pressed={gateway === g.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    gateway === g.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <g.Icon className="h-5 w-5 mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-semibold">{g.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{g.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            <Button onClick={pay} disabled={busy} className="w-full font-bold">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ${amountLabel}`}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Payments are captured server-side; a card is never confirmed without provider verification.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
