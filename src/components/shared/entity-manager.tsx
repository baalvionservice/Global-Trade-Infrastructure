'use client';

import React, { useState, useEffect } from 'react';
import { EntityConfig } from '@/lib/crud-types';
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { DataTable } from '@/components/shared/data-table';
import { DynamicForm } from '@/components/shared/dynamic-form';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Plus, Edit2, Loader2, MapPin, ExternalLink, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface EntityManagerProps {
  config: EntityConfig;
}

/**
 * @file entity-manager.tsx
 * @description The master CRUD infrastructure component for the Baalvion OS.
 * Orchestrates listing, creation, modification and deletion with institutional-grade auditing.
 */
export function EntityManager({ config }: EntityManagerProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    const res = await apiClient.get<any[]>(`/${config.name}`, {
      search: searchTerm,
      searchKey: config.searchKey,
      sortBy: 'updated_at',
      order: 'desc'
    });
    // Normalize both the paginated envelope ({items}) and bare arrays so DataTable always
    // receives an array (typed resources like /shipments are paginated).
    setData(toList<any>(res));
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [config.name, searchTerm]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const endpoint = selectedItem ? `/${config.name}/${selectedItem.id}` : `/${config.name}`;
    const method = selectedItem ? 'patch' : 'post';
    
    const res = await (apiClient as any)[method](endpoint, formData);
    
    if (!res.success) {
      toast({ variant: 'destructive', title: 'Ledger Rejection', description: res.error?.message || 'Transaction failed.' });
    } else {
      toast({ title: 'Record Finalized', description: `${config.label} state synchronized on the global ledger.` });
      setModalOpen(false);
      fetchData();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSubmitting(true);
    const res = await apiClient.delete(`/${config.name}/${itemToDelete.id}`);
    
    if (res.success) {
      toast({ title: 'Record Purged', description: `${config.label} has been removed from the institutional view.` });
      fetchData();
    } else {
      toast({ variant: 'destructive', title: 'Authority Denial', description: res.error?.message || 'Purge failed.' });
    }
    setDeleteOpen(false);
    setItemToDelete(null);
    setIsSubmitting(false);
  };

  const columns = [
    {
      header: 'Identity',
      accessorKey: 'id' as any,
      cell: (row: any) => (
         <div className="flex flex-col">
            <span className="font-mono text-[11px] font-black text-primary uppercase">{row.id}</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{row.version ? `v${row.version}` : 'v1'} Signed</span>
         </div>
      )
    },
    ...config.fields.filter(f => f.name !== 'id').map(f => ({
      header: f.label,
      accessorKey: f.name,
      cell: (row: any) => {
        if (f.name === 'status') return <StatusBadge status={row[f.name]} />;
        if (f.type === 'date') return row[f.name] ? <span className="font-bold text-xs uppercase">{new Date(row[f.name]).toLocaleDateString()}</span> : '-';
        if (f.type === 'number' && (f.name.toLowerCase().includes('cost') || f.name.toLowerCase().includes('amount') || f.name.toLowerCase().includes('value'))) {
          return <span className="font-black text-sm tabular-nums">${row[f.name]?.toLocaleString()}</span>;
        }
        return <span className="font-medium text-xs truncate max-w-[200px]">{row[f.name] || '-'}</span>;
      }
    })),
    {
      header: 'Authority',
      accessorKey: 'id' as any,
      cell: (row: any) => (
        <div className="flex gap-2">
          {config.name === 'shipments' && (
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2" onClick={() => router.push(`/logistics-shipment/${row.id}/tracking`)}>
              <MapPin className="h-4 w-4 text-primary" />
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2 text-blue-600 hover:bg-blue-50" onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(row);
            setModalOpen(true);
          }}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-2 text-red-600 hover:bg-red-50" onClick={(e) => {
            e.stopPropagation();
            setItemToDelete(row);
            setDeleteOpen(true);
          }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-6">
        <div className="space-y-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-primary">Registry: {config.name.toUpperCase()}</p>
           <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter text-foreground leading-none">{config.pluralLabel}</h2>
           <p className="text-muted-foreground font-medium italic">Authoritative record management for {config.pluralLabel.toLowerCase()}.</p>
        </div>
        
        <div className="flex gap-4">
          <Dialog open={modalOpen} onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setSelectedItem(null);
          }}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 font-black uppercase tracking-widest text-[11px] shadow-2xl">
                <Plus className="mr-2 h-4 w-4" /> NEW {config.label.toUpperCase()}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 overflow-hidden border-none shadow-md">
              <div className="bg-primary p-6 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Zap className="h-32 w-32 brightness-0 invert" /></div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter relative z-10">{selectedItem ? 'Authorize Update' : 'New Mandate'}</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-2 relative z-10">Registry Synchronization Node</p>
              </div>
              <div className="p-6 bg-background max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <DynamicForm 
                    fields={config.fields} 
                    onSubmit={handleSubmit} 
                    initialData={selectedItem}
                    isLoading={isSubmitting}
                 />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        columns={columns as any}
        data={data}
        isLoading={loading}
        onSearch={setSearchTerm}
        searchPlaceholder={`Resolve ${config.pluralLabel.toLowerCase()} by ${config.searchKey}...`}
        className="animate-in fade-in slide-in-from-bottom-4 duration-700"
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-3xl border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">Systemic Purge Authorization</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-sm">
              Critical Warning: This action will permanently delist the <strong>{config.label}</strong> record from the production ledger. This event is logged for forensic audit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0 mt-4">
            <AlertDialogCancel disabled={isSubmitting} className="rounded-xl border-2 font-black uppercase text-[10px] tracking-widest h-12">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }} 
              className="bg-red-600 hover:bg-red-700 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Authorize Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}