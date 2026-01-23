import {getTranslations} from 'next-intl/server';
export async function generateMetadata() {
  const t = await getTranslations('landing');
  
  return {
    title: `Perkx - ${t('title')}`,
    description: t('description'),
  };
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}
