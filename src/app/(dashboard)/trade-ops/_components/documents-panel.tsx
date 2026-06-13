'use client';

/**
 * @file trade-ops/_components/documents-panel.tsx
 * @description Documents tab — lists the shipment's trade documents (versioned, scanned), with
 * create, AI validation, and chain-of-custody verify/reject. Document state feeds the readiness
 * score, so mutations here invalidate readiness.
 */
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilePlus2, Loader2, ShieldCheck, Ban, ScanSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useDocuments, useCreateDocument, useVerifyDocument, useRejectDocument, useValidateDocument,
  errorMessage, type DocType,
} from '@/api';
import { AsyncGate, when, humanize } from './ui-states';
import { DocStatusBadge, ScanBadge } from './badges';

const DOC_TYPES: DocType[] = ['commercial_invoice', 'packing_list', 'bill_of_lading', 'certificate_of_origin', 'insurance_document', 'other'];

export function DocumentsPanel({ shipmentId, mayEdit, mayApprove }: { shipmentId: string; mayEdit: boolean; mayApprove: boolean }) {
  const { toast } = useToast();
  const { data, isLoading, isError, error, refetch } = useDocuments({ shipment_id: shipmentId });
  const verify = useVerifyDocument(shipmentId);
  const reject = useRejectDocument(shipmentId);
  const validate = useValidateDocument(shipmentId);

  const docs = data?.items ?? [];

  async function run(label: string, p: Promise<unknown>) {
    try { await p; toast({ title: `${label} done` }); }
    catch (err) { toast({ title: `${label} failed`, description: errorMessage(err), variant: 'destructive' }); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Trade Documents</CardTitle>
          <CardDescription>Versioned, virus-scanned, encrypted at rest. Verification drives readiness.</CardDescription>
        </div>
        {mayEdit && <CreateDocumentDialog shipmentId={shipmentId} />}
      </CardHeader>
      <CardContent>
        <AsyncGate
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage(error)}
          onRetry={() => void refetch()}
          isEmpty={docs.length === 0}
          emptyMessage="No documents attached to this shipment yet."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead><TableHead>Title</TableHead><TableHead>Status</TableHead>
                <TableHead>Scan</TableHead><TableHead>Ver</TableHead><TableHead>Added</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => {
                const scan = d.versions?.[0]?.scan_status ?? '—';
                return (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs font-medium">{humanize(d.doc_type)}</TableCell>
                    <TableCell className="text-xs">{d.title ?? '—'}</TableCell>
                    <TableCell><DocStatusBadge status={d.status} /></TableCell>
                    <TableCell>{scan === '—' ? '—' : <ScanBadge status={scan} />}</TableCell>
                    <TableCell className="text-xs">v{d.current_version}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{when(d.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {mayEdit && (
                          <Button variant="ghost" size="sm" title="AI Validate" disabled={validate.isPending}
                            onClick={() => run('Validation', validate.mutateAsync({ document_ref: d.id, document_kind: 'tradeops_document' }))}>
                            <ScanSearch className="h-4 w-4" />
                          </Button>
                        )}
                        {mayApprove && d.status !== 'verified' && (
                          <Button variant="ghost" size="sm" title="Verify" disabled={verify.isPending}
                            onClick={() => run('Verify', verify.mutateAsync({ id: d.id }))}>
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          </Button>
                        )}
                        {mayApprove && d.status !== 'rejected' && (
                          <Button variant="ghost" size="sm" title="Reject" disabled={reject.isPending}
                            onClick={() => run('Reject', reject.mutateAsync({ id: d.id, reason: 'rejected_from_trade_ops' }))}>
                            <Ban className="h-4 w-4 text-rose-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AsyncGate>
      </CardContent>
    </Card>
  );
}

function CreateDocumentDialog({ shipmentId }: { shipmentId: string }) {
  const { toast } = useToast();
  const create = useCreateDocument(shipmentId);
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState<DocType>('commercial_invoice');
  const [title, setTitle] = useState('');

  async function submit() {
    try {
      await create.mutateAsync({ doc_type: docType, title: title || undefined, shipment_id: shipmentId });
      toast({ title: 'Document created' });
      setOpen(false); setTitle('');
    } catch (err) {
      toast({ title: 'Create failed', description: errorMessage(err), variant: 'destructive' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><FilePlus2 className="mr-2 h-4 w-4" /> Add Document</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Trade Document</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Document Type</Label>
            <Select value={docType} onValueChange={(v) => setDocType(v as DocType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{humanize(t)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Commercial Invoice #INV-001" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={create.isPending}>Cancel</Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
