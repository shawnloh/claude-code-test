import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getNoteById } from '@/lib/notes';
import EditNoteForm from '@/app/components/EditNoteForm';

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/authentication');

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  let content: object;
  try {
    content = JSON.parse(note.contentJson);
  } catch {
    notFound();
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-semibold mb-6'>Edit Note</h1>
      <EditNoteForm noteId={id} initialTitle={note.title} initialContent={content} />
    </div>
  );
}
