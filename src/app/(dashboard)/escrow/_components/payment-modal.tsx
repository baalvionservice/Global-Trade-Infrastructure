'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Wallet as WalletIcon, Landmark, CreditCard, Loader2, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { getWallets, Wallet, fundEscrow, markEscrowAsFunded } from '@/services/payment-service';
import { getFXRate } from '@/services/fx-service';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: any) => Promise<void>; // Overridden locally
  amount: number;
  currency: string;
  escrowId: string;
  orderId: string;
}

export function PaymentModal({ isOpen, onClose, amount, currency, escrowId, orderId }: PaymentModalProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [conversionRate, setConversionRate] = useState<number>(1);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setLoadingWallets(true);
      getWallets().then(data => {
        setWallets(data);
        if (data.length > 0) setSelectedWalletId(data[0].id);
      }).finally(() => setLoadingWallets(false));
    }
  }, [isOpen]);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  useEffect(() => {
    if (selectedWallet && currency) {
      getFXRate(currency, selectedWallet.currency)
        .then(setConversionRate)
        .catch(() => setConversionRate(1));
    }
  }, [selectedWallet, currency]);

  const convertedAmount = amount * conversionRate;

  const handlePayment = async () => {
    if (!selectedWallet) return;
    setIsProcessing(true);
    try {
      // Step 1: Execute Global Payment Orchestration
      const result = await fundEscrow({
        escrowId,
        orderId,
        amount,
        orderCurrency: currency,
        paymentCurrency: selectedWallet.currency,
        method: 'wallet'
      });

      // Step 2: Finalize local state
      setIsSuccess(true);
      toast({ title: "Funds Secured", description: "Ledger updated across all jurisdictional corridors." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Settlement Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
    if (isSuccess) window.location.reload();
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="h-14 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold">Settlement Confirmed</h3>
            <p className="text-muted-foreground max-w-xs text-sm">
              The amount of {currency} {amount.toLocaleString()} has been securely moved to platform escrow.
            </p>
            <Button className="w-full mt-6" onClick={handleClose}>Return to Escrow</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Institutional Settlement</DialogTitle>
          <DialogDescription>Select your funding wallet. Conversion rates are locked for 60 seconds.</DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed flex flex-col items-center gap-1">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Total Trade Value</p>
            <p className="text-2xl font-black text-primary">{currency} {amount.toLocaleString()}</p>
            {selectedWallet && selectedWallet.currency !== currency && (
               <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-background rounded-full border text-[10px] font-bold text-muted-foreground animate-in fade-in zoom-in duration-300">
                  <RefreshCw className="h-3 w-3" />
                  Est. Settlement: {selectedWallet.currency} {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
               </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase text-muted-foreground px-1">Source Wallet</Label>
            {loadingWallets ? (
               <div className="flex h-14 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <RadioGroup value={selectedWalletId} onValueChange={setSelectedWalletId} className="gap-3">
                {wallets.map((w) => (
                  <div key={w.id} className={cn(
                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                    selectedWalletId === w.id ? "border-primary bg-primary/5" : "border-muted"
                  )} onClick={() => setSelectedWalletId(w.id)}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <WalletIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{w.currency} Account</p>
                        <p className="text-[10px] text-muted-foreground">Available: {w.balance.toLocaleString()}</p>
                      </div>
                    </div>
                    <RadioGroupItem value={w.id} id={w.id} className="sr-only" />
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-green-50 p-2 rounded border border-green-100 italic">
             <ShieldCheck className="h-3 w-3 text-green-600 shrink-0" />
             This transaction will be recorded on the Baalvion Ledger with immutable FX proof.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button className="flex-1 font-black" onClick={handlePayment} disabled={isProcessing || !selectedWallet}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authorize Settlement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
