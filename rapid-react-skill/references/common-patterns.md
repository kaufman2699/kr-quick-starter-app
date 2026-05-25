# Common Patterns

Copy-pasteable recipes for the most common things people build with this kit. Each pattern is intentionally minimal — extend as needed.

## Fetching from a Domo dataset

```jsx
import { useEffect, useState } from 'react';
import { getDatasetRows } from './lib/domo.js';

export default function SalesTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDatasetRows('sales', ['region', 'revenue'])
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;
  return (
    <table className="w-full text-sm">
      <thead><tr><th>Region</th><th>Revenue</th></tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}><td>{r.region}</td><td>${r.revenue}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
```

Remember to add the dataset to `manifest.json` `mapping`.

## Fetching from a public API

```jsx
import useFetch from './hooks/useFetch.js';

export default function GithubStars() {
  const { data, loading, error } = useFetch('https://api.github.com/repos/facebook/react');
  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  return <p>⭐ {data.stargazers_count.toLocaleString()}</p>;
}
```

## Routing (multi-page app)

```bash
npm install react-router-dom
```

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="border-b p-4">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

For GH Pages, use `HashRouter` instead of `BrowserRouter` (or configure 404 fallback) to avoid refresh-breaks-the-route problems.

## Controlled form

```jsx
import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '' });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    // Do something with form
    console.log(form);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className="w-full rounded border px-3 py-2"
        placeholder="Name"
        value={form.name}
        onChange={update('name')}
      />
      <input
        className="w-full rounded border px-3 py-2"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={update('email')}
      />
      <button className="rounded bg-slate-900 px-4 py-2 text-white">Submit</button>
    </form>
  );
}
```

## Chart with Recharts

```bash
npm install recharts
```

```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [{ month: 'Jan', value: 30 }, { month: 'Feb', value: 45 }, { month: 'Mar', value: 60 }];

export default function TrendChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## App-wide state via Context

```jsx
import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
```

Wrap your app: `<AppProvider><App /></AppProvider>` in `main.jsx`.

## Loading + error states (consistent pattern)

```jsx
function withStatus(loading, error, render) {
  if (loading) return <div className="p-4 text-slate-500">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error.message}</div>;
  return render();
}

// usage:
return withStatus(loading, error, () => <DataView data={data} />);
```
