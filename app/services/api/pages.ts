const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088/api';

export interface Page {
  id: string;
  language: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function getPageBySlug(
  slug: string,
  language: string = 'en'
): Promise<Page | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/${slug}?language=${language}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    // API returns { statusCode, message, data, timestamp }
    return result.data || null;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export async function getAllPages(language: string = 'en'): Promise<Page[]> {
  console.log('API_BASE_URL:', API_BASE_URL);
  try {
    const response = await fetch(`${API_BASE_URL}/pages?language=${language}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    // API returns { statusCode, message, data, timestamp }
    return result.data || [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}
