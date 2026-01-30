import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Vietnamese characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

export class UpdateCampaignsSlugFromTitle1769767331744 implements MigrationInterface {
  name = 'UpdateCampaignsSlugFromTitle1769767331744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all campaigns that don't have a slug or have empty slug
    const campaigns = await queryRunner.query(`
      SELECT id, title, slug
      FROM campaigns
      WHERE slug IS NULL OR slug = '' OR slug = 'null'
      ORDER BY id
    `);

    console.log(`Found ${campaigns.length} campaigns to update with slug`);

    // Process each campaign
    for (const campaign of campaigns) {
      if (!campaign.title) {
        console.log(`Skipping campaign ${campaign.id}: no title`);
        continue; // Skip if no title
      }

      // Generate base slug from title
      let baseSlug = generateSlug(campaign.title);
      
      // Ensure slug is not empty
      if (!baseSlug) {
        baseSlug = `campaign-${campaign.id}`;
      }

      // Check if slug already exists and make it unique
      let slug = baseSlug;
      let counter = 1;
      let exists = true;

      while (exists) {
        const existing = await queryRunner.query(
          `SELECT id FROM campaigns WHERE slug = $1 AND id != $2`,
          [slug, campaign.id]
        );

        if (existing.length === 0) {
          exists = false;
        } else {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      // Update the campaign with the generated slug
      await queryRunner.query(
        `UPDATE campaigns SET slug = $1 WHERE id = $2`,
        [slug, campaign.id]
      );

      console.log(`Updated campaign ${campaign.id}: "${campaign.title}" -> "${slug}"`);
    }

    console.log(`✅ Successfully updated ${campaigns.length} campaigns with slugs`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Optionally, you can clear all slugs or leave them as is
    // For now, we'll leave them as is since this is a data migration
    // If you want to revert, uncomment the line below:
    // await queryRunner.query(`UPDATE campaigns SET slug = NULL`);
  }
}
