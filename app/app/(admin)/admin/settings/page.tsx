export default function AdminSettingsPage() {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your admin portal settings</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Settings</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Admin settings page - Coming soon
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configure email and push notifications
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage security and authentication settings
          </p>
        </div>
      </div>
    </>
  );
}
