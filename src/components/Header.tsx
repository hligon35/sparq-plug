// Header for dashboards styled to blue theme
export default function Header({ title }: { title: string }) {
  return (
    <header className="w-full bg-[#1d74d0] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-full bg-white/15 hover:bg-white/25 text-white px-4 py-2 text-sm font-medium transition">Help</button>
          <button className="rounded-full bg-white text-[#1d74d0] px-4 py-2 text-sm font-semibold transition shadow">Logout</button>
        </div>
      </div>
    </header>
  );
}
