'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getBaseDomain } from '@/lib/cookieUtil';

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete({
    name: 'token',
    path: '/'
  });
  cookieStore.delete({
    name: 'verify-email',
    path: '/'
  });
  // Redirect to home page
  redirect('/');
}
