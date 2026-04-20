import Link from 'next/link';

type Props = {
  id: string;
  title: string;
  updatedAt: string;
  isPublic: boolean;
};

export default function NoteCard({ id, title, updatedAt, isPublic }: Props) {
  const formatted = new Date(updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      href={`/notes/${id}/view`}
      className='block border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'
    >
      <div className='flex items-start justify-between gap-4'>
        <span className='font-medium truncate'>{title || 'Untitled note'}</span>
        {isPublic && (
          <span className='shrink-0 text-xs border border-neutral-300 rounded px-1.5 py-0.5 text-neutral-500'>
            Public
          </span>
        )}
      </div>
      <p className='text-sm text-neutral-500 mt-1'>Updated {formatted}</p>
    </Link>
  );
}
