'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, FilePlus2, DollarSign, Package } from 'lucide-react';

interface NegotiationBarProps {
  onSendMessage: (content: string) => void;
  onSendOffer: (price: number, quantity: number, terms: string) => void;
  disabled: boolean;
}

export function NegotiationBar({ onSendMessage, onSendOffer, disabled }: NegotiationBarProps) {
  const [content, setContent] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState('');
  const [offerTerms, setOfferTerms] = useState('');
  const [offerOpen, setOfferOpen] = useState(false);

  const handleSend = () => {
    if (!content.trim() || disabled) return;
    onSendMessage(content);
    setContent('');
  };

  const handleOfferSubmit = () => {
    const price = parseFloat(offerPrice);
    const qty = parseInt(offerQty);
    if (isNaN(price) || isNaN(qty) || disabled) return;
    
    onSendOffer(price, qty, offerTerms);
    setOfferOpen(false);
    setOfferPrice('');
    setOfferQty('');
    setOfferTerms('');
  };

  return (
    <div className="p-4 bg-background border-t shrink-0">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 border-primary/20 text-primary" disabled={disabled}>
              <FilePlus2 className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                 <DollarSign className="h-5 w-5 text-primary" /> Create Formal Offer
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price / Unit (USD)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    value={offerPrice}
                    onChange={e => setOfferPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity</Label>
                  <Input 
                    id="qty" 
                    type="number" 
                    placeholder="Units" 
                    value={offerQty}
                    onChange={e => setOfferQty(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Commercial Terms (Incoterms, Delivery, etc.)</Label>
                <Textarea 
                  id="terms" 
                  placeholder="e.g. FOB Shanghai, 30 days lead time" 
                  value={offerTerms}
                  onChange={e => setOfferTerms(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleOfferSubmit} className="w-full">Submit Structured Offer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex-1 relative">
          <Input 
            placeholder={disabled ? "Deal finalized. Chat disabled." : "Type a message..."} 
            className="pr-12 h-10 bg-muted/10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={disabled}
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary"
            onClick={handleSend}
            disabled={disabled || !content.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
