import { redirect } from 'next/navigation';

export default async function NoteRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/notes/${id}/view`);
}
