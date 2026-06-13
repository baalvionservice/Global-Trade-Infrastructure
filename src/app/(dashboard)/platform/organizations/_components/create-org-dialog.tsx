'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Building } from 'lucide-react';
import { platformApi, type CreateOrgInput } from '@/lib/admin-api';
import { ORG_TYPES, ORG_TYPE_CONFIG, type OrgType } from '@/core/organizations';
import { useToast } from '@/hooks/use-toast';

type Props = {
  /** Called after a successful create so the parent can refresh its list. */
  onCreated: () => void;
};

const ORG_TYPE_OPTIONS: OrgType[] = Object.values(ORG_TYPES);

type FormState = {
  name: string;
  type: OrgType | '';
  slug: string;
  legalName: string;
  displayName: string;
  country: string;
  jurisdiction: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'suspended';
  ownerEmail: string;
  ownerFullName: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  type: '',
  slug: '',
  legalName: '',
  displayName: '',
  country: '',
  jurisdiction: '',
  contactEmail: '',
  contactPhone: '',
  status: 'active',
  ownerEmail: '',
  ownerFullName: '',
};

export function CreateOrgDialog({ onCreated }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    setOpen(next);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.name.trim()) {
      setError('Organization name is required.');
      return;
    }
    if (!form.type) {
      setError('Organization type is required.');
      return;
    }
    if (form.country && form.country.trim().length !== 2) {
      setError('Country must be a 2-letter ISO code (e.g. US, IN).');
      return;
    }

    // Only send populated optional fields — keep the payload tight.
    const payload: CreateOrgInput = {
      name: form.name.trim(),
      type: form.type,
      status: form.status,
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();
    if (form.legalName.trim()) payload.legalName = form.legalName.trim();
    if (form.displayName.trim()) payload.displayName = form.displayName.trim();
    if (form.country.trim()) payload.country = form.country.trim().toUpperCase();
    if (form.jurisdiction.trim()) payload.jurisdiction = form.jurisdiction.trim();
    if (form.contactEmail.trim()) payload.contactEmail = form.contactEmail.trim();
    if (form.contactPhone.trim()) payload.contactPhone = form.contactPhone.trim();
    if (form.ownerEmail.trim()) payload.ownerEmail = form.ownerEmail.trim();
    if (form.ownerFullName.trim()) payload.ownerFullName = form.ownerFullName.trim();

    setSubmitting(true);
    try {
      const res = await platformApi.createOrganization(payload);
      if (!res.success || !res.data) {
        setError(res.error?.message ?? 'Failed to create organization.');
        return;
      }
      const invited = res.data.ownerInvite?.email;
      toast({
        title: 'Organization created',
        description: invited
          ? `${res.data.org.name} created. Invitation sent to ${invited}.`
          : `${res.data.org.name} created.`,
      });
      handleOpenChange(false);
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error creating organization.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 font-black uppercase tracking-widest text-[11px] rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Create organization
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
            <Building className="h-5 w-5 text-primary" /> New organization
          </DialogTitle>
          <DialogDescription>
            Provision a tenant on the platform. Provide an owner email to send the first-owner
            invitation immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="org-name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="org-name"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Acme Trading Co."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-type">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select value={form.type} onValueChange={(v) => setField('type', v)}>
              <SelectTrigger id="org-type">
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                {ORG_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ORG_TYPE_CONFIG[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-status">Status</Label>
            <Select value={form.status} onValueChange={(v) => setField('status', v)}>
              <SelectTrigger id="org-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-slug">Slug</Label>
            <Input
              id="org-slug"
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              placeholder="acme-trading (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-legal">Legal name</Label>
            <Input
              id="org-legal"
              value={form.legalName}
              onChange={(e) => setField('legalName', e.target.value)}
              placeholder="Acme Trading Co. Ltd."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-display">Display name</Label>
            <Input
              id="org-display"
              value={form.displayName}
              onChange={(e) => setField('displayName', e.target.value)}
              placeholder="Acme"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-country">Country (2-letter)</Label>
            <Input
              id="org-country"
              value={form.country}
              maxLength={2}
              onChange={(e) => setField('country', e.target.value.toUpperCase())}
              placeholder="US"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-jurisdiction">Jurisdiction</Label>
            <Input
              id="org-jurisdiction"
              value={form.jurisdiction}
              onChange={(e) => setField('jurisdiction', e.target.value)}
              placeholder="Delaware, US"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-email">Contact email</Label>
            <Input
              id="org-email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setField('contactEmail', e.target.value)}
              placeholder="ops@acme.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-phone">Contact phone</Label>
            <Input
              id="org-phone"
              value={form.contactPhone}
              onChange={(e) => setField('contactPhone', e.target.value)}
              placeholder="+1 555 000 0000"
            />
          </div>

          <div className="md:col-span-2 mt-2 rounded-2xl border-2 border-dashed bg-muted/20 p-5 space-y-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              First owner invite (optional)
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="owner-email">Owner email</Label>
                <Input
                  id="owner-email"
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => setField('ownerEmail', e.target.value)}
                  placeholder="owner@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-name">Owner full name</Label>
                <Input
                  id="owner-name"
                  value={form.ownerFullName}
                  onChange={(e) => setField('ownerFullName', e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border-2 border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="font-black uppercase tracking-widest text-[11px]">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create organization
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
