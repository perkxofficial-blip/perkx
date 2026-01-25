import type { Metadata } from 'next';

interface CampaignsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: CampaignsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Campaigns | PerkX',
    description: 'Browse all available cashback campaigns and exclusive offers',
  };
}

export default async function CampaignsPage({ params }: CampaignsPageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Active Campaigns</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Discover exclusive cashback offers and rewards
        </p>
      </header>

      {/* TODO: Add filters, search, and campaign grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Campaign cards will go here */}
        <div className="p-6 border rounded-lg">
          <p className="text-gray-500">Campaign cards coming soon...</p>
        </div>
      </div>
    </div>
  );
}
