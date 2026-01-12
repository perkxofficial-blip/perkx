'use client';

export default function AdminSettingsPage() {
  return (
    <div className="min-w-[1440px]">
      <div className="flex">
        {/* Sidebar placeholder */}
        <div className="w-64"></div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <header className="bg-white shadow-sm p-6">
            <h2 className="text-2xl font-bold">Admin Settings</h2>
          </header>

          <main className="p-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">System Settings</h3>
              <p className="text-gray-600">Admin settings page - Coming soon</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
