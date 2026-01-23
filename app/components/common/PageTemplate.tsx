import type { ReactNode } from 'react';

interface PageTemplateProps {
  title: string;
  description?: string;
  children: ReactNode;
  showMeta?: boolean;
  updatedAt?: string;
  viewCount?: number;
  locale?: string;
  className?: string;
}

export default function PageTemplate({
  title,
  description,
  children,
  showMeta = false,
  updatedAt,
  viewCount,
  locale = 'en',
  className = '',
}: PageTemplateProps) {
  return (
    <article className={`max-w-4xl mx-auto px-4 py-8 ${className}`}>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {description && (
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
        {showMeta && updatedAt && (
          <div className="mt-4 text-sm text-gray-500">
            <time dateTime={updatedAt}>
              {new Date(updatedAt).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {viewCount !== undefined && (
              <>
                <span className="mx-2">•</span>
                <span>{viewCount} views</span>
              </>
            )}
          </div>
        )}
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        {children}
      </div>
    </article>
  );
}
