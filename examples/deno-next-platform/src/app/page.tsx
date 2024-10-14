import PageComposer from './pageComposer';
import page from '../mock/dashboard-page.mock';

export default function Home() {
  return <PageComposer page={page.page} />;
}
