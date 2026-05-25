import Card from './components/Card.jsx';

// This is your app. Edit freely.
// Delete the demo content below and build whatever you need.

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight">Rapid React App</h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
              src/App.jsx
            </code>{' '}
            to start building.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="1. Build" body="Run npm run dev and edit src/App.jsx. Tailwind is wired up." />
          <Card title="2. Fetch" body="Use the useFetch hook or src/lib/domo.js for Domo datasets." />
          <Card
            title="3. Ship"
            body="npm run deploy:domo or npm run deploy:gh. Manifest and build are automatic."
          />
        </div>
      </main>
    </div>
  );
}
