'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getBaseDomain } from '@/lib/cookieUtil';

export async function logoutAction() {
  const cookieStore = await cookies();
  const baseDomain = await getBaseDomain();
  
  // Clear the token cookie from parent domain
  cookieStore.delete({
    name: 'token',
    path: '/',
    domain: baseDomain,
  });
  cookieStore.delete({
    name: 'verify-email',
    path: '/',
    domain: baseDomain,
  });
  
  // Redirect to home page
  redirect('/');
}
