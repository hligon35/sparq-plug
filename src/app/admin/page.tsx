import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Admin Dashboard" />
        <main className="flex-1 p-8 overflow-y-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Analytics Overview</h2>
            {/* Analytics widgets go here */}
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Client Management</h2>
            {/* Client list and management tools go here */}
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-2">Post Scheduling</h2>
            {/* Scheduling tools go here */}
          </section>
        </main>
      </div>
    </div>
  );
}
