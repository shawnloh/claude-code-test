import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='border-b border-neutral-200'>
        <div className='max-w-5xl mx-auto px-4 py-4 flex items-center justify-between'>
          <span className='text-lg font-semibold'>NextNotes</span>
          <div className='flex items-center gap-3'>
            <Link
              href='/authentication?mode=login'
              className='text-sm text-foreground hover:opacity-70 transition-opacity'
            >
              Sign in
            </Link>
            <Link
              href='/authentication?mode=register'
              className='text-sm bg-foreground text-background rounded-lg px-4 py-2 hover:opacity-80 transition-opacity'
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className='flex-1 flex flex-col items-center justify-center px-4 py-20 text-center'>
        <h1 className='text-5xl font-bold mb-4'>Your notes, beautifully organized</h1>
        <p className='text-lg text-neutral-500 mb-10 max-w-xl'>
          Create rich-text notes with formatting, share them publicly with a link, and access them
          from anywhere.
        </p>
        <div className='flex items-center gap-4'>
          <Link
            href='/authentication?mode=register'
            className='bg-foreground text-background rounded-lg px-6 py-3 text-sm font-medium hover:opacity-80 transition-opacity'
          >
            Get started for free
          </Link>
          <Link
            href='/authentication?mode=login'
            className='text-sm text-foreground border border-neutral-300 rounded-lg px-6 py-3 hover:bg-neutral-100 transition-colors'
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
