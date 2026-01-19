import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../../../entities/page.entity';
import { CreatePageDto, UpdatePageDto } from './dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) { }

  async create(createPageDto: CreatePageDto): Promise<Page> {
    // Check if page with same slug already exists
    const existingPage = await this.pageRepository.findOne({
      where: {
        slug: createPageDto.slug,
      },
    });

    if (existingPage) {
      throw new ConflictException(
        `Page with slug "${createPageDto.slug}" already exists`,
      );
    }

    const page = this.pageRepository.create(createPageDto);
    return await this.pageRepository.save(page);
  }

  async findAll(language?: string): Promise<Page[]> {
    const pages = await this.pageRepository.find({
      order: { created_at: 'DESC' },
    });

    // Filter by language if specified (check if language exists in content)
    if (language) {
      return pages.filter(page => page.content[language]);
    }

    return pages;
  }

  async findOne(id: number): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });

    if (!page) {
      throw new NotFoundException(`Page with ID "${id}" not found`);
    }

    return page;
  }

  async findBySlug(slug: string, language: string = 'en'): Promise<any> {
    const page = await this.pageRepository.findOne({
      where: { slug },
    });

    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }

    // Check if language version exists
    const languageContent = page.content[language];
    if (!languageContent) {
      throw new NotFoundException(`Page with slug "${slug}" not found for language "${language}"`);
    }

    // Check if published for this language
    if (!languageContent.is_published) {
      throw new NotFoundException(`Page with slug "${slug}" is not published for language "${language}"`);
    }

    // Return page with only requested language content
    return {
      id: page.id,
      slug: page.slug,
      ...languageContent,
      created_at: page.created_at,
      updated_at: page.updated_at,
    };
  }

  async update(id: number, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(id);

    // If slug is being updated, check for conflicts
    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const existingPage = await this.pageRepository.findOne({
        where: { slug: updatePageDto.slug },
      });

      if (existingPage && existingPage.id !== id) {
        throw new ConflictException(
          `Page with slug "${updatePageDto.slug}" already exists`,
        );
      }
    }

    // Merge content if provided
    if (updatePageDto.content) {
      page.content = {
        ...page.content,
        ...updatePageDto.content,
      };
    }

    if (updatePageDto.slug) {
      page.slug = updatePageDto.slug;
    }

    return await this.pageRepository.save(page);
  }

  async remove(id: number): Promise<void> {
    const page = await this.findOne(id);
    await this.pageRepository.remove(page);
  }

  async getPublishedPages(language: string = 'en'): Promise<any[]> {
    const pages = await this.pageRepository.find({
      order: { created_at: 'DESC' },
    });

    // Filter and map pages that have published content for the requested language
    return pages
      .filter(page => page.content[language]?.is_published)
      .map(page => ({
        id: page.id,
        slug: page.slug,
        title: page.content[language].title,
        description: page.content[language].description,
        created_at: page.created_at,
        updated_at: page.updated_at,
      }));
  }
}
