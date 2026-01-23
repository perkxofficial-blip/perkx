import type { Metadata } from 'next';

interface ExchangesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ExchangesPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Exchanges | PerkX',
    description: 'View current exchange rates and convert your rewards',
  };
}

export default async function ExchangesPage({ params }: ExchangesPageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Exchange Rates</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Current rates for converting your rewards
        </p>
      </header>

      {/* Exchange rates table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* TODO: Add exchange rate rows */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Exchange rates coming soon...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Exchange calculator */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Quick Convert</h2>
        {/* TODO: Add conversion form */}
      </div>
    </div>
  );
}
