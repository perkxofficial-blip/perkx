import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { UpdatePageDto } from './dto';
import { AdminJwtAuthGuard } from '../auth/guards';

@ApiTags('Admin - Pages')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pages' })
  @ApiQuery({ name: 'language', required: false, description: 'Filter by language (en, ko)' })
  @ApiResponse({ status: 200, description: 'Return all pages' })
  findAll(@Query('language') language?: string) {
    return this.pagesService.findAll(language);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a page by ID' })
  @ApiResponse({ status: 200, description: 'Return the page with all language versions' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  findOne(@Param('id') id: number) {
    return this.pagesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a page (merge content for languages)' })
  @ApiResponse({ status: 200, description: 'Page updated successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  @ApiResponse({ status: 409, description: 'Page with same slug already exists' })
  update(
    @Param('id') id: number,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, updatePageDto);
  }
}
