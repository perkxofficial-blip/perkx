import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileValidator,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AdminExchangesService } from './exchanges.service';
import { AdminJwtAuthGuard } from '../auth/guards';
import { CurrentAdmin } from '../../../common/decorators';
import { Admin } from '../../../entities';
import { ListUserExchangesQueryDto, UpdateUserExchangeDto } from './dto';

/**
 * Custom validator for CSV files
 * Checks both file extension and MIME type
 */
class CsvFileValidator extends FileValidator {
  isValid(file?: Express.Multer.File): boolean {
    if (!file) {
      return false;
    }

    // Check file extension
    const extension = file.originalname.toLowerCase().endsWith('.csv');
    
    // Check MIME type (common CSV MIME types)
    const validMimeTypes = [
      'text/csv',
      'application/csv',
      'text/comma-separated-values',
      'application/vnd.ms-excel', // Excel sometimes sends CSV with this MIME type
    ];
    const mimeType = file.mimetype?.toLowerCase();
    const validMimeType = !mimeType || validMimeTypes.includes(mimeType);

    return extension && validMimeType;
  }

  buildErrorMessage(): string {
    return 'File must be a CSV file (.csv extension)';
  }
}

const CsvFileValidationPipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
    new CsvFileValidator({}),
  ],
});

@ApiTags('Admin - Exchanges')
@ApiBearerAuth('admin-jwt')
@Controller('admin/exchanges')
@UseGuards(AdminJwtAuthGuard)
export class AdminExchangesController {
  constructor(private readonly exchangesService: AdminExchangesService) {}

  @Get('list')
  @ApiOperation({
    summary: 'Get list of active exchanges',
    description: 'Returns list of active exchanges with id and name. Includes a special PerkX item with id: 0.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of exchanges retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Exchange ID. 0 for PerkX', example: 0 },
          name: { type: 'string', description: 'Exchange name', example: 'PerkX' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing admin token',
  })
  async getExchangeList() {
    return await this.exchangesService.getExchangeList();
  }

  @Post('import-products')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Import exchange products from CSV file',
    description:
      'Import exchange products from CSV file. Required fields: exchange_name, exchange_signup_link, product_name, discount, default_fee_maker, default_fee_taker, final_fee_maker, final_fee_taker. Decimal fields support comma as decimal separator.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file with exchange products data. Max size: 10MB',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Import completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number', description: 'Number of successfully imported rows' },
        failed: { type: 'number', description: 'Number of failed rows' },
        errors: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of error messages for failed rows',
        },
      },
    },
  })
  async importProducts(
    @UploadedFile(CsvFileValidationPipe) file: Express.Multer.File,
  ) {
    return await this.exchangesService.importExchangeProducts(file);
  }

  @Get('user_exchanges')
  @ApiOperation({
    summary: 'Get list of user exchanges',
    description: 'Returns paginated list of user exchanges with filters by exchange_id and status',
  })
  @ApiQuery({
    name: 'exchange_id',
    required: false,
    type: Number,
    description: 'Filter by exchange ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'PENDING', 'REJECTED'],
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 50)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'List of user exchanges retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              user_email: { type: 'string' },
              exchange_name: { type: 'string' },
              exchange_uid: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              status: { type: 'string', enum: ['ACTIVE', 'PENDING', 'REJECTED'] },
              updated_at: { type: 'string', format: 'date-time' },
              reason: { type: 'string', nullable: true },
              updated_by: { type: 'string', nullable: true },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total number of items' },
            page: { type: 'number', description: 'Current page number' },
            limit: { type: 'number', description: 'Number of items per page' },
            totalPages: { type: 'number', description: 'Total number of pages' },
          },
        },
      },
    },
  })
  async getUserExchanges(@Query() query: ListUserExchangesQueryDto) {
    return await this.exchangesService.getUserExchanges(query);
  }

  @Patch('user_exchanges/uid/:id/update')
  @ApiOperation({
    summary: 'Update user exchange status and reason',
    description: 'Update status (required) and reason (optional) for a user exchange',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User exchange ID',
  })
  @ApiBody({
    type: UpdateUserExchangeDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User exchange updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        status: { type: 'string', enum: ['ACTIVE', 'PENDING', 'REJECTED'] },
        reason: { type: 'string', nullable: true },
        updated_by: { type: 'string' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User exchange not found',
  })
  async updateUserExchange(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserExchangeDto,
    @CurrentAdmin() admin: Admin,
  ) {
    return await this.exchangesService.updateUserExchange(
      id,
      updateDto,
      admin.username,
    );
  }
}
