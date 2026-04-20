import { notFound } from 'next/navigation';
import { getNoteBySlug } from '@/lib/notes';
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

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>{note.title || 'Untitled note'}</h1>
      <NoteViewer content={content} />
    </div>
  );
}
