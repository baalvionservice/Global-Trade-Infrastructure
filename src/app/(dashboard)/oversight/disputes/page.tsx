import { redirect } from 'next/navigation';

export default function DeprecatedPage() {
  // Canonical dispute registry lives under /governance/disputes.
  redirect('/governance/disputes');
}
