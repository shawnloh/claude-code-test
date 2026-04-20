import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getNoteById } from '@/lib/notes';
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

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <div className='flex items-center justify-between mb-6'>
        <Link
          href='/dashboard'
          className='text-sm text-neutral-500 hover:text-foreground transition-colors'
        >
          ← Back to notes
        </Link>
        <NoteActions noteId={id} />
      </div>
      <h1 className='text-3xl font-bold mb-6'>{note.title || 'Untitled note'}</h1>
      <NoteViewer content={content} />
    </div>
  );
}
