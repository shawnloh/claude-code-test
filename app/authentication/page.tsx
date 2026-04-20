import AuthForm from './AuthForm';

type Props = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function AuthenticationPage({ searchParams }: Props) {
  const { mode } = await searchParams;
  const isLogin = mode !== 'register';

  return (
    <main className='min-h-screen flex items-center justify-center'>
      <div className='w-full max-w-sm bg-background border border-neutral-200 rounded-xl p-8 shadow-sm'>
        <h1 className='text-xl font-semibold mb-6'>{isLogin ? 'Sign in' : 'Create account'}</h1>
        <AuthForm mode={isLogin ? 'login' : 'register'} />
        <p className='mt-4 text-sm text-neutral-500 text-center'>
          {isLogin ? (
            <>
              No account?{' '}
              <a href='/authentication?mode=register' className='text-foreground underline'>
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href='/authentication?mode=login' className='text-foreground underline'>
                Sign in
              </a>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
