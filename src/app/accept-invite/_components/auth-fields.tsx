'use client';

/**
 * @file auth-fields.tsx
 * @description Shared field + message primitives for the public auth pages, styled to match the
 * login page's institutional input language (h-14, border-2, leading icon, focus ring).
 */

import type { ComponentType, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ShieldCheck, type LucideProps } from 'lucide-react';

interface AuthFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  minLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  icon: ComponentType<LucideProps>;
}

export function AuthField({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  required,
  autoComplete,
  defaultValue,
  value,
  onChange,
  minLength,
  disabled,
  autoFocus,
  icon: Icon,
}: AuthFieldProps) {
  return (
    <div className="space-y-3">
      <Label
        htmlFor={id}
        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
      >
        {label}
      </Label>
      <div className="relative group">
        <Input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          minLength={minLength}
          disabled={disabled}
          autoFocus={autoFocus}
          className="h-14 pl-12 border-2 font-bold focus-visible:ring-primary/20 transition-all bg-muted/5 group-hover:bg-background disabled:opacity-60"
        />
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
      </div>
    </div>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 text-destructive text-sm font-medium">
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export function AuthSuccess({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 text-primary text-sm font-medium">
      <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
