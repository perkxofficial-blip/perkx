import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly diskDriver: string;
  private readonly s3Client: S3Client | null = null;
  private readonly s3Bucket: string | undefined;
  private readonly s3Region: string;
  private readonly cdn: string;
  private readonly localStoragePath: string;

  constructor(private configService: ConfigService) {
    this.diskDriver = this.configService.get<string>('storage.diskDriver');
    this.localStoragePath = this.configService.get<string>('storage.localPath');
    this.cdn = this.configService.get<string>('storage.s3.cdn');

    if (this.diskDriver === 's3') {
      this.s3Bucket = this.configService.get<string>('storage.s3.bucket');
      this.s3Region = this.configService.get<string>('storage.s3.region');

      this.s3Client = new S3Client({
        region: this.s3Region,
        credentials: {
          accessKeyId: this.configService.get<string>('storage.s3.accessKeyId'),
          secretAccessKey: this.configService.get<string>('storage.s3.secretAccessKey'),
        },
      });
    } else {
      // Ensure local storage directory exists
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ path: string; url: string }> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    if (this.diskDriver === 's3') {
      return await this.uploadToS3(file.buffer, filePath, file.mimetype);
    } else {
      return await this.uploadToLocal(file.buffer, filePath);
    }
  }

  private async uploadToS3(
    buffer: Buffer,
    filePath: string,
    contentType: string,
  ): Promise<{ path: string; url: string }> {
    if (!this.s3Client || !this.s3Bucket) {
      throw new Error('S3 configuration is missing');
    }

    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: 'uploads/' + filePath,
      Body: buffer,
      ContentType: contentType
    });

    await this.s3Client.send(command);

    const url = this.cdn + '/uploads/' + filePath;

    return {
      path: filePath,
      url,
    };
  }

  private async uploadToLocal(
    buffer: Buffer,
    filePath: string,
  ): Promise<{ path: string; url: string }> {
    const fullPath = path.join(this.localStoragePath, filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(fullPath, buffer);

    // Generate URL (assuming files are served statically)
    const baseUrl = this.configService.get<string>('storage.localBaseUrl') || '/uploads';
    const url = `${baseUrl}/${filePath}`;

    return {
      path: filePath,
      url,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    if (this.diskDriver === 's3') {
      if (!this.s3Client || !this.s3Bucket) {
        throw new Error('S3 configuration is missing');
      }

      const command = new DeleteObjectCommand({
        Bucket: this.s3Bucket,
        Key: filePath,
      });

      await this.s3Client.send(command);
    } else {
      const fullPath = path.join(this.localStoragePath, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  /**
   * Generate local file URL
   * @param filePath - The file path stored in database
   * @returns The full local URL to access the file
   */
  getFileLocal(filePath: string): string | null {
    if (!filePath) {
      return null;
    }

    const baseUrl = this.configService.get<string>('storage.localBaseUrl');
    return `${baseUrl}/${filePath}`;
  }

  /**
   * Generate S3 file URL
   * @param filePath - The file path stored in database
   * @returns The full S3 URL to access the file
   */
  getFileS3(filePath: string): string | null {
    if (!filePath) {
      return null;
    }

    if (!this.s3Bucket) {
      throw new Error('S3 configuration is missing');
    }

    // Generate S3 URL
      return this.cdn + '/uploads/' + filePath;
  }

  /**
   * Generate URL from file path based on storage driver configuration
   * @param filePath - The file path stored in database
   * @returns The full URL to access the file
   */
  getFileUrl(filePath: string): string | null {
    if (this.diskDriver === 's3') {
      return this.getFileS3(filePath);
    } else {
      return this.getFileLocal(filePath);
    }
  }
}
