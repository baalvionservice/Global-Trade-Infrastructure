'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { FieldConfig } from '@/lib/crud-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function DynamicForm({ fields, onSubmit, initialData, isLoading, title, description }: DynamicFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-1">
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2.5">
            <Label htmlFor={field.name} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
               {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            
            <div className="relative group">
               {field.type === 'textarea' ? (
                 <Textarea
                   id={field.name}
                   placeholder={field.placeholder}
                   className={cn(
                      "min-h-[120px] border-2 rounded-2xl focus-visible:ring-primary/20 bg-muted/5 group-hover:bg-background transition-all font-medium",
                      errors[field.name] && "border-red-500 focus-visible:ring-red-500/20"
                   )}
                   {...register(field.name, { required: field.required })}
                 />
               ) : field.type === 'select' ? (
                 <Select
                   onValueChange={(val) => setValue(field.name, val)}
                   defaultValue={initialData?.[field.name]}
                 >
                   <SelectTrigger className="h-14 border-2 rounded-2xl focus:ring-primary/20 bg-muted/5 group-hover:bg-background transition-all font-bold">
                     <SelectValue placeholder={field.placeholder || "Select option..."} />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl border-2">
                     {field.options?.map((opt) => (
                       <SelectItem key={opt.value} value={opt.value} className="font-bold text-xs uppercase tracking-tight">
                         {opt.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               ) : (
                 <Input
                   id={field.name}
                   type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                   placeholder={field.placeholder}
                   className={cn(
                      "h-14 border-2 rounded-2xl focus-visible:ring-primary/20 bg-muted/5 group-hover:bg-background transition-all font-bold",
                      errors[field.name] && "border-red-500 focus-visible:ring-red-500/20"
                   )}
                   {...register(field.name, { required: field.required })}
                 />
               )}
            </div>
            
            {errors[field.name] && (
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 mt-1 ml-1 animate-in fade-in slide-in-from-left-1">
                 <AlertCircle className="h-3 w-3" /> Mandatory institutional field missing.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 border-t space-y-4">
        <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex gap-4 text-indigo-700 shadow-inner">
           <ShieldCheck className="h-6 w-6 shrink-0 mt-0.5 opacity-60" />
           <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tight">
              By authorizing this record, you affirm that the data matches the jurisdictional mandate. All mutations are cryptographically signed on the Baalvion Ledger.
           </p>
        </div>
        <Button 
           type="submit" 
           className="w-full h-12 font-black uppercase tracking-wide text-base shadow-xl" 
           disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <ShieldCheck className="mr-3 h-6 w-6" />}
          {initialData ? 'Authorize Update' : 'Finalize Record'}
        </Button>
      </div>
    </form>
  );
}