import { redirect } from 'next/navigation';

export default function DeprecatedPage() {
  redirect('/governance/audit-logs');
}
