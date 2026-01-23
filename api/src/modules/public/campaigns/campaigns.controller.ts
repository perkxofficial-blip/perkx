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
    description: 'Returns campaigns that are currently active within launch, preview, or archive periods. Can filter by status or featured. No pagination.',
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
  @ApiResponse({
    status: 200,
    description: 'List of campaigns retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          exchange_id: { type: 'number', nullable: true },
          title: { type: 'string' },
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
    },
  })
  async findAll(@Query() queryDto: PublicListCampaignsQueryDto) {
    return await this.campaignsService.findAll(queryDto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get campaign detail by ID (public, no authentication required)',
    description: 'Returns campaign detail if it is active and within launch/preview/archive periods.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        exchange_id: { type: 'number', nullable: true },
        title: { type: 'string' },
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
  async findOne(@Param('id') id: string) {
    const campaign = await this.campaignsService.findOne(+id);
    if (!campaign) {
      throw new NotFoundException('Campaign not found or not available');
    }
    return campaign;
  }
}
