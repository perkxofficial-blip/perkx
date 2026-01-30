import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PublicCampaignsService } from './campaigns.service';
import { PublicListCampaignsQueryDto, CampaignStatus } from './dto';
import { Public } from '../../../common/decorators';
import { CampaignCategory } from '../../../entities';

@ApiTags('Public - Campaigns')
@Controller('campaigns')
export class PublicCampaignsController {
  constructor(private readonly campaignsService: PublicCampaignsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all active campaigns (public, no authentication required)',
    description: 'Returns campaigns that are currently active within launch, preview, or archive periods. Can filter by status, featured, category, or exchange. Supports pagination.',
  })
  @ApiQuery({
    name: 'featured',
    required: false,
    description: 'Filter by featured campaigns only',
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by campaign status (active, upcoming, expired). If not provided, returns campaigns in launch/preview/archive periods.',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by campaign category (New User or Trading Competition)',
    enum: CampaignCategory,
    example: CampaignCategory.NEW_USER,
  })
  @ApiQuery({
    name: 'exchange',
    required: false,
    description: 'Filter by exchange code (e.g., "binance", "bybit") or "perkx" for PerkX campaigns (exchange_id = 0)',
    type: String,
    example: 'binance',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (default: 15)',
    type: Number,
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              exchange_id: { type: 'number', nullable: true },
              title: { type: 'string' },
              slug: { type: 'string' },
              description: { type: 'string' },
              banner_path: { type: 'string' },
              banner_url: { type: 'string' },
              redirect_url: { type: 'string', nullable: true },
              is_active: { type: 'boolean' },
              preview_start: { type: 'string', format: 'date-time', nullable: true },
              preview_end: { type: 'string', format: 'date-time', nullable: true },
              launch_start: { type: 'string', format: 'date-time' },
              launch_end: { type: 'string', format: 'date-time' },
              archive_start: { type: 'string', format: 'date-time', nullable: true },
              archive_end: { type: 'string', format: 'date-time', nullable: true },
              featured: { type: 'boolean' },
              category: { type: 'string', enum: Object.values(CampaignCategory), nullable: true },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
              exchange: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  code: { type: 'string' },
                  logo_url: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total number of campaigns' },
            page: { type: 'number', description: 'Current page number' },
            limit: { type: 'number', description: 'Number of items per page' },
            totalPages: { type: 'number', description: 'Total number of pages' },
          },
        },
      },
    },
  })
  async findAll(@Query() queryDto: PublicListCampaignsQueryDto) {
    return await this.campaignsService.findAll(queryDto);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({
    summary: 'Get campaign detail by slug (public, no authentication required)',
    description: 'Returns campaign detail if it is active and within launch/preview/archive periods.',
  })
  @ApiParam({ name: 'slug', description: 'Campaign slug', type: String })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        exchange_id: { type: 'number', nullable: true },
        title: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        banner_path: { type: 'string' },
        banner_url: { type: 'string' },
        redirect_url: { type: 'string', nullable: true },
        is_active: { type: 'boolean' },
        preview_start: { type: 'string', format: 'date-time', nullable: true },
        preview_end: { type: 'string', format: 'date-time', nullable: true },
        launch_start: { type: 'string', format: 'date-time' },
        launch_end: { type: 'string', format: 'date-time' },
        archive_start: { type: 'string', format: 'date-time', nullable: true },
        archive_end: { type: 'string', format: 'date-time', nullable: true },
        featured: { type: 'boolean' },
        category: { type: 'string', enum: Object.values(CampaignCategory), nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        exchange: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Campaign not found or not available' })
  async findOne(@Param('slug') slug: string) {
    const campaign = await this.campaignsService.findOneBySlug(slug);
    if (!campaign) {
      throw new NotFoundException('Campaign not found or not available');
    }
    return campaign;
  }
}
