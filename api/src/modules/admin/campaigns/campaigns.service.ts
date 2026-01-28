import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, Exchange } from '../../../entities';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  ListCampaignsQueryDto,
  CampaignStatus,
} from './dto';
import { StorageService } from '../../../common/storage/storage.service';

type CampaignResponse = Campaign & {
  banner_url: string | null;
  exchange: { id: number; name: string; code: string } | null;
};

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    private storageService: StorageService,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
    banner: Express.Multer.File,
  ): Promise<CampaignResponse> {
    // Validate exchange_id if provided
    if (createCampaignDto.exchange_id !== undefined && createCampaignDto.exchange_id !== null) {
      const exchange = await this.exchangeRepository.findOne({
        where: { id: createCampaignDto.exchange_id, is_active: true },
      });

      if (!exchange) {
        throw new BadRequestException(
          `Exchange with ID ${createCampaignDto.exchange_id} does not exist`,
        );
      }

    }
    // Upload banner file
    const { path: bannerPath } =
      await this.storageService.uploadFile(banner, 'campaigns');

    // Create campaign with banner_path only
    const campaign = this.campaignRepository.create({
      ...createCampaignDto,
      banner_path: bannerPath,
    });

    const savedCampaign = await this.campaignRepository.save(campaign);

    // Reload with exchange relation to ensure consistency
    const reloadedCampaign = await this.campaignRepository.findOne({
      where: { id: savedCampaign.id },
      relations: ['exchange'],
    });

    // Return with banner_url generated from banner_path
    return this.transformCampaignResponse(reloadedCampaign);
  }

  async findAll(queryDto: ListCampaignsQueryDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 15;
    const skip = (page - 1) * limit;

    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.exchange', 'exchange');

    // Filter by exchange_id
    if (queryDto.exchange_id !== undefined) {
      queryBuilder.andWhere('campaign.exchange_id = :exchange_id', {
        exchange_id: queryDto.exchange_id,
      });
    }

    // Filter by status
    if (queryDto.status) {
      const today = new Date();
      // today.setHours(0, 0, 0, 0);

      switch (queryDto.status) {
        case CampaignStatus.ACTIVE:
          queryBuilder.andWhere(
            'campaign.launch_start <= :today AND campaign.launch_end >= :today',
            { today },
          );
          break;

        case CampaignStatus.UPCOMING:
          queryBuilder.andWhere('campaign.launch_start > :today', { today });
          break;

        case CampaignStatus.EXPIRED:
          queryBuilder.andWhere('campaign.launch_end < :today', { today });
          break;
      }
    }

    // Count total
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    queryBuilder.skip(skip).take(limit).orderBy('campaign.created_at', 'DESC');

    const campaigns = await queryBuilder.getMany();

    // Transform campaigns with banner_url and exchange
    const data = campaigns.map((campaign) =>
      this.transformCampaignResponse(campaign),
    );

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<CampaignResponse | null> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['exchange'],
    });

    if (!campaign) {
      return null;
    }

    return this.transformCampaignResponse(campaign);
  }

  async update(
    id: number,
    updateCampaignDto: UpdateCampaignDto,
    banner?: Express.Multer.File,
  ): Promise<CampaignResponse | null> {
    const campaign = await this.campaignRepository.findOne({
      where: { id }
    });

    if (!campaign) {
      return null;
    }

    // Validate exchange_id if provided
    if (updateCampaignDto.exchange_id !== undefined && updateCampaignDto.exchange_id !== null) {
      const exchange = await this.exchangeRepository.findOne({
        where: { id: updateCampaignDto.exchange_id, is_active: true },
      });

      if (!exchange) {
        throw new BadRequestException(
          `Exchange with ID ${updateCampaignDto.exchange_id} does not exist`,
        );
      }
    }

    // Check featured limit if updating featured to true
    if (
      updateCampaignDto.featured === true &&
      campaign.featured !== true
    ) {
      // Count current featured campaigns
      const featuredCount = await this.campaignRepository.count({
        where: { featured: true },
      });

      // Maximum 5 featured campaigns allowed
      if (featuredCount >= 5) {
        throw new BadRequestException(
          'Maximum 5 featured campaigns allowed. Please disable another campaign first.',
        );
      }
    }

    // If banner is provided, upload new banner and delete old one
    if (banner) {
      // Delete old banner file if exists
      if (campaign.banner_path) {
        await this.storageService.deleteFile(campaign.banner_path);
      }

      // Upload new banner
      const { path: bannerPath } =
        await this.storageService.uploadFile(banner, 'campaigns');

      updateCampaignDto = {
        ...updateCampaignDto,
        banner_path: bannerPath,
      } as any;
    }

    Object.assign(campaign, updateCampaignDto);
    const savedCampaign = await this.campaignRepository.save(campaign);

    // Reload with exchange relation to ensure consistency
    const reloadedCampaign = await this.campaignRepository.findOne({
      where: { id: savedCampaign.id },
      relations: ['exchange'],
    });

    if (!reloadedCampaign) {
      return null;
    }

    // Return with banner_url generated from banner_path
    return this.transformCampaignResponse(reloadedCampaign);
  }

  /**
   * Transform campaign entity to response format with banner_url and exchange
   */
  private transformCampaignResponse(campaign: Campaign): CampaignResponse {
    return {
      ...campaign,
      banner_url: this.getBannerUrl(campaign.banner_path),
      exchange: campaign.exchange
        ? {
            id: campaign.exchange.id,
            name: campaign.exchange.name,
            code: campaign.exchange.code,
          }
        : null,
    } as CampaignResponse;
  }

  /**
   * Generate banner URL from banner_path based on storage configuration
   * @param bannerPath - The banner path stored in database
   * @returns The full URL to access the banner image
   */
  private getBannerUrl(bannerPath: string): string | null {
    return this.storageService.getFileUrl(bannerPath);
  }


  async remove(id: number): Promise<boolean> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    
    if (!campaign) {
      return false;
    }

    // Delete banner file if exists
    if (campaign.banner_path) {
      await this.storageService.deleteFile(campaign.banner_path);
    }

    const result = await this.campaignRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }
}
