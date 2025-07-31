import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <Header title="Admin Dashboard" />
        <main className="flex-1 w-full flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
            <section className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center border-t-4 border-blue-500">
              <h2 className="text-2xl font-extrabold mb-4 text-blue-900">Analytics Overview</h2>
              {/* Analytics widgets go here */}
            </section>
            <section className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center border-t-4 border-blue-400">
              <h2 className="text-2xl font-extrabold mb-4 text-blue-800">Client Management</h2>
              {/* Client list and management tools go here */}
            </section>
            <section className="bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center border-t-4 border-blue-300">
              <h2 className="text-2xl font-extrabold mb-4 text-blue-700">Post Scheduling</h2>
              {/* Scheduling tools go here */}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
