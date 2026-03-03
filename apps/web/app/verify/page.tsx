import { redirect } from 'next/navigation';

/**
 * /verify is deprecated — redirect to the canonical /explorer/verify page.
 */
export default function VerifyRedirect() {
  redirect('/explorer/verify');
}
