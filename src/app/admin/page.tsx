export default function AdminDashboard() {
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-sm text-slate-600">Welcome, administrator. This is the top-level control panel.</p>
      <ul className="list-disc pl-6 text-sm text-slate-700 space-y-1">
        <li>User / Registration Requests (coming soon)</li>
        <li>System Health & Metrics</li>
        <li>Audit Log Viewer</li>
      </ul>
      <p className="text-xs text-slate-400 pt-4">(Placeholder page simplified – richer UI components intentionally removed for now.)</p>
    </main>
  );
}