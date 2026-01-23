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
  UpdateCampaignStatusDto,
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
        exchange_id: { type: 'number', nullable: true },
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
        exchange_id: { type: 'number', nullable: true },
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
    description: 'Bad request - invalid input data, missing banner file, invalid file type, or file size exceeds 5MB',
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
        exchange_id: { type: 'number', nullable: true },
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

  @Put(':id')
  @UseInterceptors(FileInterceptor('banner'))
  @ApiOperation({ summary: 'Update campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        banner: {
          type: 'string',
          format: 'binary',
          description: 'Banner image file (optional). Allowed types: PNG, JPG, JPEG. Max size: 5MB',
        },
        exchange_id: { type: 'number', nullable: true },
        title: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
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
    status: 200,
    description: 'Campaign updated successfully',
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
    description: 'Bad request - invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @UploadedFile(ImageFileValidationPipe)
    banner?: Express.Multer.File,
  ) {
    const campaign = await this.campaignsService.update(+id, updateCampaignDto, banner);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update campaign status (featured and/or is_active)' })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        featured: {
          type: 'boolean',
          description: 'Update featured status (optional)',
          example: true,
        },
        is_active: {
          type: 'boolean',
          description: 'Update active status (optional)',
          example: true,
        },
      },
      required: [],
      minProperties: 1,
      description: 'At least one field (featured or is_active) must be provided',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign status updated successfully',
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
  @ApiResponse({
    status: 400,
    description: 'Bad request - at least one field (featured or is_active) must be provided, or maximum 5 featured campaigns exceeded',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCampaignStatusDto,
  ) {
    // Validate that at least one field is provided
    if (
      updateStatusDto.featured === undefined &&
      updateStatusDto.is_active === undefined
    ) {
      throw new BadRequestException(
        'At least one field (featured or is_active) must be provided',
      );
    }

    const campaign = await this.campaignsService.updateStatus(
      +id,
      updateStatusDto,
    );
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
