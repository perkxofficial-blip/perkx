import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  ListCampaignsQueryDto,
  CampaignStatus,
} from './dto';
import { AdminJwtAuthGuard } from '../auth/guards';
import { CampaignCategory } from '../../../entities';

const ImageFileValidationPipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
  ],
});

const OptionalImageFileValidationPipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [
    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
    new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
  ],
});

@ApiTags('Admin Campaigns')
@ApiBearerAuth('admin-jwt')
@Controller('admin/campaigns')
@UseGuards(AdminJwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('banner'))
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'description', 'banner'],
      properties: {
        banner: {
          type: 'string',
          format: 'binary',
          description: 'Banner image file (required). Allowed types: PNG, JPG, JPEG. Max size: 5MB',
        },
        exchange_id: {
          type: 'number',
          nullable: true,
          description: 'Exchange ID. Must exist in the exchange table if provided.',
          example: 1,
        },
        title: { type: 'string' },
        description: { type: 'string' },
        redirect_url: { type: 'string', nullable: true },
        is_active: { type: 'boolean', nullable: true },
        preview_start: { type: 'string', format: 'date', nullable: true },
        preview_end: { type: 'string', format: 'date', nullable: true },
        launch_start: { type: 'string', format: 'date', nullable: true },
        launch_end: { type: 'string', format: 'date', nullable: true },
        archive_start: { type: 'string', format: 'date', nullable: true },
        archive_end: { type: 'string', format: 'date', nullable: true },
        featured: { type: 'boolean', nullable: true },
        category: { type: 'string', enum: Object.values(CampaignCategory), nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        exchange_id: {
          type: 'number',
          nullable: true,
          description: 'Exchange ID. Must exist in the exchange table if provided.',
          example: 1,
        },
        title: { type: 'string' },
        description: { type: 'string' },
        banner_path: { type: 'string' },
        banner_url: { type: 'string' },
        redirect_url: { type: 'string', nullable: true },
        is_active: { type: 'boolean' },
        preview_start: { type: 'string', format: 'date', nullable: true },
        preview_end: { type: 'string', format: 'date', nullable: true },
        launch_start: { type: 'string', format: 'date', nullable: true },
        launch_end: { type: 'string', format: 'date', nullable: true },
        archive_start: { type: 'string', format: 'date', nullable: true },
        archive_end: { type: 'string', format: 'date', nullable: true },
        featured: { type: 'boolean' },
        category: { type: 'string', enum: Object.values(CampaignCategory), nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data, missing banner file, invalid file type, file size exceeds 5MB, or exchange_id does not exist',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @UploadedFile(ImageFileValidationPipe) banner: Express.Multer.File,
  ) {
    return await this.campaignsService.create(createCampaignDto, banner);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all campaigns with filters and pagination',
  })
  @ApiQuery({
    name: 'exchange_id',
    required: false,
    description: 'Filter by exchange ID',
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (active, upcoming, expired)',
    enum: CampaignStatus,
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
              exchange_id: {
          type: 'number',
          nullable: true,
          description: 'Exchange ID. Must exist in the exchange table if provided.',
          example: 1,
        },
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
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  async findAll(@Query() queryDto: ListCampaignsQueryDto) {
    return await this.campaignsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        exchange_id: {
          type: 'number',
          nullable: true,
          description: 'Exchange ID. Must exist in the exchange table if provided.',
          example: 1,
        },
        title: { type: 'string' },
        description: { type: 'string' },
        banner_url: { type: 'string' },
        redirect_url: { type: 'string', nullable: true },
        is_active: { type: 'boolean' },
        preview_start: { type: 'string', format: 'date', nullable: true },
        preview_end: { type: 'string', format: 'date', nullable: true },
        launch_start: { type: 'string', format: 'date', nullable: true },
        launch_end: { type: 'string', format: 'date', nullable: true },
        archive_start: { type: 'string', format: 'date', nullable: true },
        archive_end: { type: 'string', format: 'date', nullable: true },
        featured: { type: 'boolean' },
        category: { type: 'string', enum: Object.values(CampaignCategory), nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findOne(@Param('id') id: string) {
    const campaign = await this.campaignsService.findOne(+id);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('banner'))
  @ApiOperation({
    summary: 'Update campaign by ID',
    description: 'Partially update a campaign. All fields are optional. Only provided fields will be updated.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        banner: {
          type: 'string',
          format: 'binary',
          description: 'Banner image file (optional). Allowed types: PNG, JPG, JPEG. Max size: 5MB. If provided, the old banner will be replaced.',
        },
        exchange_id: { type: 'number', nullable: true, description: 'Exchange ID' },
        title: { type: 'string', nullable: true, description: 'Campaign title (max 255 characters)' },
        description: { type: 'string', nullable: true, description: 'Campaign description' },
        redirect_url: { type: 'string', nullable: true, description: 'Redirect URL' },
        is_active: { type: 'boolean', nullable: true, description: 'Whether the campaign is active' },
        preview_start: { type: 'string', format: 'date-time', nullable: true, description: 'Preview start date (ISO 8601 format)' },
        preview_end: { type: 'string', format: 'date-time', nullable: true, description: 'Preview end date (ISO 8601 format)' },
        launch_start: { type: 'string', format: 'date-time', nullable: true, description: 'Launch start date (ISO 8601 format)' },
        launch_end: { type: 'string', format: 'date-time', nullable: true, description: 'Launch end date (ISO 8601 format)' },
        archive_start: { type: 'string', format: 'date-time', nullable: true, description: 'Archive start date (ISO 8601 format)' },
        archive_end: { type: 'string', format: 'date-time', nullable: true, description: 'Archive end date (ISO 8601 format)' },
        featured: { type: 'boolean', nullable: true, description: 'Whether the campaign is featured. Maximum 5 featured campaigns allowed.' },
        category: { type: 'string', enum: Object.values(CampaignCategory), nullable: true, description: 'Campaign category' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        exchange_id: {
          type: 'number',
          nullable: true,
          description: 'Exchange ID. Must exist in the exchange table if provided.',
          example: 1,
        },
        title: { type: 'string' },
        description: { type: 'string' },
        banner_path: { type: 'string' },
        banner_url: { type: 'string' },
        redirect_url: { type: 'string', nullable: true },
        is_active: { type: 'boolean' },
        preview_start: { type: 'string', format: 'date', nullable: true },
        preview_end: { type: 'string', format: 'date', nullable: true },
        launch_start: { type: 'string', format: 'date', nullable: true },
        launch_end: { type: 'string', format: 'date', nullable: true },
        archive_start: { type: 'string', format: 'date', nullable: true },
        archive_end: { type: 'string', format: 'date', nullable: true },
        featured: { type: 'boolean' },
        category: { type: 'string', enum: Object.values(CampaignCategory), nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data, or exchange_id does not exist',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @UploadedFile(OptionalImageFileValidationPipe)
    banner?: Express.Multer.File,
  ) {
    const campaign = await this.campaignsService.update(+id, updateCampaignDto, banner);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }


  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: Number })
  @ApiResponse({
    status: 204,
    description: 'Campaign deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async remove(@Param('id') id: string) {
    const deleted = await this.campaignsService.remove(+id);
    if (!deleted) {
      throw new NotFoundException('Campaign not found');
    }
  }
}
