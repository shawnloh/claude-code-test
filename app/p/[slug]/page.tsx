import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getNoteBySlug } from '@/lib/notes';
import { getProfile, getAvatarUrl } from '@/lib/profile';
import NoteViewer from '@/app/components/NoteViewer';

export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) notFound();

  let content;
  try {
    content = JSON.parse(note.contentJson);
  } catch {
    notFound();
  }

  const creator = getProfile(note.userId);
  const avatarUrl = creator ? getAvatarUrl(creator.email, creator.image) : null;

  const session = await auth.api.getSession({ headers: await headers() });
  const isOwner = session?.user.id === note.userId;

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='flex items-start justify-between mb-2'>
        <h1 className='text-3xl font-bold'>{note.title || 'Untitled note'}</h1>
        {isOwner && (
          <Link
            href={`/notes/${note.id}/edit`}
            className='shrink-0 ml-4 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'
          >
            Edit
          </Link>
        )}
      </div>
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
