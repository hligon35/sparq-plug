// Sidebar navigation for dashboards
import Link from 'next/link';

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Clients', href: '/admin' },
  { name: 'Analytics', href: '/admin/analytics' },
  { name: 'Scheduling', href: '/admin/scheduling' },
  { name: 'Settings', href: '/admin/settings' },
];

export default function Sidebar() {
  return (
    <nav className="h-full w-64 bg-gray-900 text-white flex flex-col p-4" aria-label="Sidebar">
      <div className="mb-8 text-2xl font-bold">SparQ Admin</div>
      <ul className="space-y-4">
        {navItems.map(item => (
          <li key={item.name}>
            <Link href={item.href} className="block py-2 px-4 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
