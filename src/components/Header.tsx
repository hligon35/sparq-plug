// Header for dashboards
export default function Header({ title }: { title: string }) {
  return (
    <header className="w-full bg-white shadow flex items-center justify-center px-6 py-4 relative">
      <h1 className="text-xl font-semibold text-gray-900 text-center w-full">{title}</h1>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
        {/* Add user avatar, notifications, etc. */}
        <button className="rounded-full bg-blue-600 text-white px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">Profile</button>
      </div>
    </header>
  );
}
