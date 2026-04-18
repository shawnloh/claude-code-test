export default function Home() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center max-w-lg'>
        <h1 className='text-4xl font-bold mb-6'>Hello World</h1>
        <ul className='text-left list-disc list-inside space-y-2'>
          <li>Writes and edits code directly in your codebase</li>
          <li>Runs terminal commands and tests on your behalf</li>
          <li>Understands full project context across files</li>
          <li>Automates repetitive engineering tasks</li>
          <li>Integrates with Git for commits and pull requests</li>
          <li>Works inside VS Code, JetBrains, and the terminal</li>
        </ul>
      </div>
    </div>
  );
}
