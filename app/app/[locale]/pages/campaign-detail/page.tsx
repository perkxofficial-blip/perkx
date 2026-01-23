import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface CampaignDetailPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    id?: string;
  }>;
}

export async function generateMetadata({ searchParams }: CampaignDetailPageProps): Promise<Metadata> {
  const { id } = await searchParams;

  return {
    title: `Campaign Details | PerkX`,
    description: 'View campaign details and participate in exclusive offers',
  };
}

export default async function CampaignDetailPage({ params, searchParams }: CampaignDetailPageProps) {
  const { locale } = await params;
  const { id } = await searchParams;

  // TODO: Fetch campaign data by ID
  // const campaign = await getCampaignById(id, locale);
  // if (!campaign) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Campaign Title</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Campaign description goes here
          </p>
        </header>

        {/* Campaign details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Campaign Details</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Campaign ID: {id || 'Not specified'}
          </p>
          {/* TODO: Add campaign details, terms, participation button */}
        </div>

        {/* Related campaigns or similar offers */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Related Campaigns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Related campaign cards */}
          </div>
        </div>
      </div>
    </div>
  );
}
