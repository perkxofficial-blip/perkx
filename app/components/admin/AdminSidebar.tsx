// Admin Sidebar Component

'use client';

interface AdminSidebarProps {
  onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-gray-800 min-h-screen fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-8">Admin Portal</h1>
        
        <nav className="space-y-2">
          <a 
            href="/admin" 
            className="block px-4 py-3 text-white rounded hover:bg-gray-700"
          >
            📊 Dashboard
          </a>
          <a 
            href="/admin/users" 
            className="block px-4 py-3 text-white rounded hover:bg-gray-700"
          >
            👥 User Management
          </a>
          <a 
            href="/admin/campaigns" 
            className="block px-4 py-3 text-white rounded hover:bg-gray-700"
          >
            📢 Campaign Management
          </a>
          <a 
            href="/admin/settings" 
            className="block px-4 py-3 text-white rounded hover:bg-gray-700"
          >
            ⚙️ Settings
          </a>
        </nav>

        <button
          onClick={onLogout}
          className="mt-8 w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
