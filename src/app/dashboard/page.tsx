export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Your bots</h1>
      <div className="rounded border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
        No bots yet. The guided setup wizard arrives in P2.
      </div>
    </main>
  );
}
