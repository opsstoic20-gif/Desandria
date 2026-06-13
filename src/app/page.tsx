export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Desandria</h1>
      <p className="max-w-md text-center text-zinc-400">
        Describe your Discord bot in plain English &rarr; it&apos;s generated,
        tested, and hosted 24/7 in minutes.
      </p>
      <a
        href="/login"
        className="rounded bg-zinc-100 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
      >
        Get started
      </a>
    </main>
  );
}
