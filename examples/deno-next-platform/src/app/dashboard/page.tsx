import PageComposer from '@/app/pageComposer';
import { getPage } from '@/app/actions';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Mercury',
  description: 'Mercury Platform',
};

export default async function Dashboard() {
  const page = await getPage('/dashboard/home');
  return <PageComposer page={page.page} />;
}
