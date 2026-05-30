import { redirect } from 'next/navigation';

// Section landing → primary child route. The sidebar links children directly; this index
// keeps the bare section path from 404-ing when navigated or bookmarked.
export default function Page() {
  redirect('/buyer/dashboard');
}
