export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading client calendars...</p>
      </div>
    </div>
  );
}
