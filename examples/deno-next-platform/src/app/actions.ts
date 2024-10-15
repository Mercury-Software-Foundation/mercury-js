'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { dashboardPageMock, loginPageMock } from '@/mock/dashboard-page.mock';

export async function getPage(path?: string) {
  const cookieStore = cookies();
  const session = cookieStore.get('session');
  if (!session && path !== '/login') {
    redirect('/');
  }
  if (path === '/dashboard/home') {
    return dashboardPageMock;
  }
  if (path === '/login') {
    return loginPageMock;
  }
  return loginPageMock;
}
