import Link from 'next/link';
import Image from 'next/image';
import LogoutButton from './LogoutButton';

type Props = { avatarUrl?: string; userName?: string };

export default function Header({ avatarUrl, userName }: Props) {
  return (
    <header className='border-b border-neutral-200 bg-background'>
      <div className='max-w-4xl mx-auto px-4 h-14 flex items-center justify-between'>
        <Link
          href='/dashboard'
          className='text-lg font-semibold text-foreground hover:opacity-80 transition-opacity'
        >
          NextNotes
        </Link>
        <div className='flex items-center gap-4'>
          <Link
            href='/profile'
            className='flex items-center gap-2 hover:opacity-80 transition-opacity'
          >
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={userName ?? 'Profile'}
                width={28}
                height={28}
                className='rounded-full'
              />
            )}
            <span className='text-sm text-neutral-500'>Profile</span>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
