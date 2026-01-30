import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from '../../../entities';
import { PublicListCampaignsQueryDto, CampaignStatus } from './dto';
import { StorageService } from '../../../common/storage/storage.service';

type CampaignResponse = Campaign & {
  banner_url: string | null;
  exchange: { id: number; name: string; code: string; logo_url: string | null } | null;
};

@Injectable()
export class PublicCampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    private storageService: StorageService,
  ) {}

  async findAll(queryDto: PublicListCampaignsQueryDto): Promise<CampaignResponse[]> {
    const today = new Date();

    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.exchange', 'exchange')
      .where('campaign.is_active = :isActive', { isActive: true });

    // Filter by status if provided (similar to admin logic)
    if (queryDto.status) {
      switch (queryDto.status) {
        case CampaignStatus.ACTIVE:
          queryBuilder.andWhere(
            'campaign.launch_start <= :today AND campaign.launch_end >= :today',
            { today },
          );
          break;

        case CampaignStatus.UPCOMING:
          queryBuilder.andWhere(
            'campaign.launch_start > :today AND ' +
            'campaign.preview_start <= :today AND campaign.preview_end >= :today',
            { today },
          );
          break;

        case CampaignStatus.EXPIRED:
          queryBuilder.andWhere(
            'campaign.launch_end < :today AND ' +
            'campaign.archive_start <= :today AND campaign.archive_end >= :today',
            { today },
          );
          break;
      }
    } else {
      // If no status filter, use OR logic for launch/preview/archive periods
      queryBuilder.andWhere(
        '((campaign.launch_start <= :today AND campaign.launch_end >= :today) OR ' +
        '(campaign.preview_start <= :today AND campaign.preview_end >= :today) OR ' +
        '(campaign.archive_start <= :today AND campaign.archive_end >= :today))',
        { today },
      );
    }

    // Filter by featured if provided
    if (queryDto.featured === true) {
      queryBuilder.andWhere('campaign.featured = :featured', { featured: true });
    }

    // Order by created_at DESC
    queryBuilder.orderBy('campaign.created_at', 'DESC');

    const campaigns = await queryBuilder.getMany();

    // Transform campaigns with banner_url and exchange
    return campaigns.map((campaign) => this.transformCampaignResponse(campaign));
  }

  async findOneBySlug(slug: string): Promise<CampaignResponse | null> {
    const today = new Date();

    const campaign = await this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.exchange', 'exchange')
      .where('campaign.slug = :slug', { slug })
      .andWhere('campaign.is_active = :isActive', { isActive: true })
      .andWhere(
        '((campaign.launch_start <= :today AND campaign.launch_end >= :today) OR ' +
        '(campaign.preview_start <= :today AND campaign.preview_end >= :today) OR ' +
        '(campaign.archive_start <= :today AND campaign.archive_end >= :today))',
        { today },
      )
      .getOne();

    if (!campaign) {
      return null;
    }

    return this.transformCampaignResponse(campaign);
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
            logo_url: campaign.exchange.logo_path
              ? this.storageService.getFileUrl(campaign.exchange.logo_path)
              : null,
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
}
