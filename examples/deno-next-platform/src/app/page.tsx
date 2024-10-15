import type { Metadata } from 'next';
import PageComposer from './pageComposer';
import { getPage } from './actions';

export const metadata: Metadata = {
  title: 'Login | Mercury',
  description: 'Mercury Platform',
};

export default async function Home() {
  const page = await getPage('/login');
  return <PageComposer page={page.page} />;
}
