import { IsString, IsObject, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PageLanguageContent {
  @ApiProperty({ example: 'About Us', description: 'Page title' })
  title: string;

  @ApiProperty({
    example: 'Learn about our company',
    description: 'Page description',
  })
  description?: string;

  @ApiProperty({
    example: '<h1>Welcome</h1><p>Content...</p>',
    description: 'Page content (HTML)',
  })
  content: string;

  @ApiProperty({
    example: true,
    description: 'Whether this language version is published',
  })
  is_published?: boolean;

  @ApiProperty({
    example: {
      meta_title: 'About Us - Company',
      meta_description: 'Learn about our mission, vision...',
      meta_keywords: ['about', 'company', 'mission'],
      og_title: 'About Us',
      og_description: 'Learn about our company',
      og_image: 'https://example.com/og-image.jpg',
      canonical_url: 'https://example.com/about-us',
    },
    description: 'SEO metadata',
  })
  seo?: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    og_title?: string;
    og_description?: string;
    og_image?: string;
    canonical_url?: string;
  };
}

export class CreatePageDto {
  @ApiProperty({ example: 'about-us', description: 'URL-friendly slug' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({
    example: {
      en: {
        title: 'About Us',
        description: 'Learn about our company',
        content: '<h1>Welcome</h1>',
        is_published: true,
        seo: {
          meta_title: 'About Us',
          meta_description: 'Learn about our company',
        },
      },
      ko: {
        title: '회사 소개',
        description: '우리 회사에 대해 알아보세요',
        content: '<h1>환영합니다</h1>',
        is_published: true,
        seo: {
          meta_title: '회사 소개',
          meta_description: '우리 회사에 대해 알아보세요',
        },
      },
    },
    description: 'Content for each language (en, ko, etc.)',
  })
  @IsObject()
  @Type(() => Object)
  content: Record<string, PageLanguageContent>;
}
