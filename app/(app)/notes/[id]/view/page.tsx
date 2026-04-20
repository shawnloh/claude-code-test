import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getNoteById } from '@/lib/notes';
import { getProfile, getAvatarUrl } from '@/lib/profile';
import NoteViewer from '@/app/components/NoteViewer';
import NoteActions from '@/app/components/NoteActions';

export default async function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/authentication');

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  let content;
  try {
    content = JSON.parse(note.contentJson);
  } catch {
    notFound();
  }

  const creator = getProfile(session.user.id);
  const avatarUrl = creator ? getAvatarUrl(creator.email, creator.image) : null;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <Link
          href='/dashboard'
          className='text-sm text-neutral-500 hover:text-foreground transition-colors'
        >
          ← Back to notes
        </Link>
        <NoteActions noteId={id} isPublic={note.isPublic} publicSlug={note.publicSlug} />
      </div>
      <h1 className='text-3xl font-bold mb-2'>{note.title || 'Untitled note'}</h1>
      {creator && (
        <div className='flex items-center gap-2 mb-8'>
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt={creator.name}
              width={24}
              height={24}
              className='rounded-full'
            />
          )}
          <span className='text-sm text-neutral-500'>{creator.name}</span>
        </div>
      )}
      <NoteViewer content={content} />
    </div>
  );
}
