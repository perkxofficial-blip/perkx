'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const cookieStore = await cookies();
  
  // Clear the token cookie
  cookieStore.delete('token');
  cookieStore.delete('verify-email');
  
  // Redirect to home page
  redirect('/');
}
