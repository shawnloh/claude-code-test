import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@/app/components/Header';
import { getAvatarUrl } from '@/lib/profile';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/authentication');

  const avatarUrl = getAvatarUrl(session.user.email, session.user.image ?? null);

  return (
    <div className='min-h-screen flex flex-col'>
      <Header avatarUrl={avatarUrl} userName={session.user.name} />
      <main className='flex-1'>{children}</main>
    </div>
  );
}
