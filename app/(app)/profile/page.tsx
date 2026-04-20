import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProfile, getAvatarUrl } from '@/lib/profile';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/authentication');

  const profile = getProfile(session.user.id);
  if (!profile) redirect('/authentication');

  const gravatarUrl = getAvatarUrl(profile.email, null, 80);

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-semibold mb-8'>Profile</h1>
      <ProfileForm profile={profile} gravatarUrl={gravatarUrl} />
    </div>
  );
}
