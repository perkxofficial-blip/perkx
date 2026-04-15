import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileValidator,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  DefaultValuePipe,
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
} from '@nestjs/swagger';
import { AdminExchangesService } from './exchanges.service';
import { AdminJwtAuthGuard } from '../auth/guards';

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
    description: 'Returns list of active exchanges with id and name. Optionally includes a special PerkX item with id: 0 based on is_extension query parameter.',
  })
  @ApiQuery({
    name: 'is_extension',
    required: false,
    description: 'If true, includes PerkX item (id: 0) as the first item. If false or not provided, excludes PerkX item.',
    type: Boolean,
    example: true,
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
  async getExchangeList(
    @Query('is_extension', new DefaultValuePipe(false), ParseBoolPipe)
    isExtension: boolean,
  ) {
    return await this.exchangesService.getExchangeList(isExtension);
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

}
