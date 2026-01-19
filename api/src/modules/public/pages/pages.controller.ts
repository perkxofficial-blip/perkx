import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PagesService } from '../../admin/pages/pages.service';
import { Public } from '../../../common/decorators';

@ApiTags('Public - Pages')
@Controller('pages')
export class PublicPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published page by slug and language' })
  @ApiParam({ name: 'slug', description: 'Page slug' })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Language code (default: en)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the page content for specified language',
  })
  @ApiResponse({ status: 404, description: 'Page not found or not published' })
  findBySlug(
    @Param('slug') slug: string,
    @Query('language') language: string = 'en',
  ) {
    return this.pagesService.findBySlug(slug, language);
  }
}
