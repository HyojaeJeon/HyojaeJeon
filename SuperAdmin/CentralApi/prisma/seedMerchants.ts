/**
 * 가맹점 시드 스크립트 — merchants.json → PostgreSQL.
 *
 * 실행: npx ts-node prisma/seedMerchants.ts
 *
 * 멱등: externalSourceId / branchCode / itemCode 기준 upsert.
 * 배치: 100개씩 트랜잭션으로 처리.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const BATCH_SIZE = 100;

interface SeedData {
  _meta: { counts: Record<string, number> };
  brandProfiles: Array<Record<string, unknown>>;
  branches: Array<Record<string, unknown>>;
  menuCategories: Array<Record<string, unknown>>;
  menuItems: Array<Record<string, unknown>>;
  optionGroups: Array<Record<string, unknown>>;
  options: Array<Record<string, unknown>>;
  branchImages: Array<Record<string, unknown>>;
}

function loadSeedData(): SeedData {
  const filePath = path.join(__dirname, 'seed-data', 'merchants.json');
  console.log(`Loading seed data from ${filePath}...`);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

async function seedBrandProfiles(data: SeedData) {
  const items = data.brandProfiles;
  console.log(`\nSeeding ${items.length} BrandProfiles...`);
  let created = 0, updated = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map((bp) =>
        prisma.brandProfile.upsert({
          where: { brandCode: bp.brandCode as string },
          update: {
            brandName: bp.brandName as string,
            brandNameKo: (bp.brandNameKo as string) ?? null,
            brandNameEn: (bp.brandNameEn as string) ?? null,
            cuisineType: (bp.cuisineType as string) ?? null,
            externalSourceId: (bp.externalSourceId as string) ?? null,
          },
          create: {
            id: bp.id as string,
            brandCode: bp.brandCode as string,
            brandName: bp.brandName as string,
            brandNameKo: (bp.brandNameKo as string) ?? null,
            brandNameEn: (bp.brandNameEn as string) ?? null,
            cuisineType: (bp.cuisineType as string) ?? null,
            externalSourceId: (bp.externalSourceId as string) ?? null,
            countryCode: 'VN',
            defaultLanguageCode: 'vi-VN',
            status: 'ACTIVE',
          },
        }),
      ),
    );
    const progress = Math.min(i + BATCH_SIZE, items.length);
    process.stdout.write(`  ${progress}/${items.length}\r`);
  }
  console.log(`  BrandProfiles done.`);
}

async function seedBranches(data: SeedData) {
  const items = data.branches;
  console.log(`Seeding ${items.length} Branches...`);

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map((b) =>
        prisma.branch.upsert({
          where: { branchCode: b.branchCode as string },
          update: {
            branchName: b.branchName as string,
            addressLine1: (b.addressLine1 as string) ?? null,
            phone: (b.phone as string) ?? null,
            latitude: b.latitude != null ? new Prisma.Decimal(b.latitude as number) : null,
            longitude: b.longitude != null ? new Prisma.Decimal(b.longitude as number) : null,
            cuisineType: (b.cuisineType as string) ?? null,
            logoUrl: (b.logoUrl as string) ?? null,
            profileImageUrl: (b.profileImageUrl as string) ?? null,
            bannerImageUrl: (b.bannerImageUrl as string) ?? null,
            deliveryFeeVnd: (b.deliveryFeeVnd as number) ?? null,
            minOrderAmountVnd: (b.minOrderAmountVnd as number) ?? null,
            rating: b.rating != null ? new Prisma.Decimal(b.rating as number) : null,
            reviewCount: (b.reviewCount as number) ?? 0,
            description: (b.description as string) ?? null,
            descriptionKo: (b.descriptionKo as string) ?? null,
            descriptionEn: (b.descriptionEn as string) ?? null,
            businessHoursJson: (b.businessHoursJson ?? {}) as Prisma.InputJsonValue,
            paymentMethodsJson: b.paymentMethodsJson ? (b.paymentMethodsJson as Prisma.InputJsonValue) : Prisma.JsonNull,
            externalSourceId: (b.externalSourceId as string) ?? null,
          },
          create: {
            id: b.id as string,
            brandHQId: b.brandHQId as string,
            distributorId: null,
            branchCode: b.branchCode as string,
            branchName: b.branchName as string,
            branchType: 'STORE',
            countryCode: 'VN',
            regionCode: (b.regionCode as string) ?? null,
            addressLine1: (b.addressLine1 as string) ?? null,
            timeZoneCode: 'Asia/Ho_Chi_Minh',
            defaultLanguageCode: 'vi-VN',
            businessHoursJson: (b.businessHoursJson ?? {}) as Prisma.InputJsonValue,
            status: 'ACTIVE',
            phone: (b.phone as string) ?? null,
            latitude: b.latitude != null ? new Prisma.Decimal(b.latitude as number) : null,
            longitude: b.longitude != null ? new Prisma.Decimal(b.longitude as number) : null,
            cuisineType: (b.cuisineType as string) ?? null,
            logoUrl: (b.logoUrl as string) ?? null,
            profileImageUrl: (b.profileImageUrl as string) ?? null,
            bannerImageUrl: (b.bannerImageUrl as string) ?? null,
            deliveryFeeVnd: (b.deliveryFeeVnd as number) ?? null,
            minOrderAmountVnd: (b.minOrderAmountVnd as number) ?? null,
            rating: b.rating != null ? new Prisma.Decimal(b.rating as number) : null,
            reviewCount: (b.reviewCount as number) ?? 0,
            description: (b.description as string) ?? null,
            descriptionKo: (b.descriptionKo as string) ?? null,
            descriptionEn: (b.descriptionEn as string) ?? null,
            paymentMethodsJson: b.paymentMethodsJson ? (b.paymentMethodsJson as Prisma.InputJsonValue) : Prisma.JsonNull,
            externalSourceId: (b.externalSourceId as string) ?? null,
          },
        }),
      ),
    );
    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}\r`);
  }
  console.log(`  Branches done.`);
}

async function seedMenuCategories(data: SeedData) {
  const items = data.menuCategories;
  console.log(`Seeding ${items.length} MenuCategories...`);

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    for (const c of batch) {
      await prisma.brandMenuCategory.upsert({
        where: {
          uq_menu_category_brand: {
            brandHQId: c.brandHQId as string,
            categoryCode: c.categoryCode as string,
          },
        },
        update: {
          categoryName: c.categoryName as string,
          displayOrder: (c.displayOrder as number) ?? 0,
          isActive: (c.isActive as boolean) ?? true,
        },
        create: {
          id: c.id as string,
          brandHQId: c.brandHQId as string,
          categoryCode: c.categoryCode as string,
          categoryName: c.categoryName as string,
          displayOrder: (c.displayOrder as number) ?? 0,
          isActive: (c.isActive as boolean) ?? true,
        },
      });
    }
    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}\r`);
  }
  console.log(`  MenuCategories done.`);
}

async function seedMenuItems(data: SeedData) {
  const items = data.menuItems;
  console.log(`Seeding ${items.length} MenuItems...`);

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    for (const it of batch) {
      await prisma.brandMenuItem.upsert({
        where: {
          uq_menu_item_brand: {
            brandHQId: it.brandHQId as string,
            itemCode: it.itemCode as string,
          },
        },
        update: {
          itemName: it.itemName as string,
          itemNameKo: (it.itemNameKo as string) ?? null,
          itemNameEn: (it.itemNameEn as string) ?? null,
          basePrice: new Prisma.Decimal(it.basePrice as number),
          profileImageUrl: (it.profileImageUrl as string) ?? null,
          displayOrder: (it.displayOrder as number) ?? 0,
          isActive: (it.isAvailable as boolean) ?? true,
          isFeatured: (it.isFeatured as boolean) ?? false,
          isBestSeller: (it.isBestSeller as boolean) ?? false,
          spicyLevel: (it.spicyLevel as number) ?? 0,
          calories: (it.calories as number) ?? null,
          tags: it.tags ? (it.tags as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
        create: {
          id: it.id as string,
          brandHQId: it.brandHQId as string,
          categoryId: it.categoryId as string,
          itemCode: it.itemCode as string,
          itemName: it.itemName as string,
          itemNameKo: (it.itemNameKo as string) ?? null,
          itemNameEn: (it.itemNameEn as string) ?? null,
          basePrice: new Prisma.Decimal(it.basePrice as number),
          profileImageUrl: (it.profileImageUrl as string) ?? null,
          displayOrder: (it.displayOrder as number) ?? 0,
          isActive: (it.isAvailable as boolean) ?? true,
          isFeatured: (it.isFeatured as boolean) ?? false,
          isBestSeller: (it.isBestSeller as boolean) ?? false,
          spicyLevel: (it.spicyLevel as number) ?? 0,
          calories: (it.calories as number) ?? null,
          tags: it.tags ? (it.tags as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });
    }
    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}\r`);
  }
  console.log(`  MenuItems done.`);
}

async function seedOptionGroups(data: SeedData) {
  const items = data.optionGroups;
  console.log(`Seeding ${items.length} OptionGroups...`);

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    for (const g of batch) {
      const existing = await prisma.brandMenuOptionGroup.findUnique({ where: { id: g.id as string } });
      if (existing) {
        await prisma.brandMenuOptionGroup.update({
          where: { id: g.id as string },
          data: {
            name: g.name as string,
            nameKo: (g.nameKo as string) ?? null,
            nameEn: (g.nameEn as string) ?? null,
            isRequired: (g.isRequired as boolean) ?? false,
            maxSelections: (g.maxSelections as number) ?? null,
            displayOrder: (g.displayOrder as number) ?? 0,
          },
        });
      } else {
        await prisma.brandMenuOptionGroup.create({
          data: {
            id: g.id as string,
            menuItemId: g.menuItemId as string,
            name: g.name as string,
            nameKo: (g.nameKo as string) ?? null,
            nameEn: (g.nameEn as string) ?? null,
            isRequired: (g.isRequired as boolean) ?? false,
            maxSelections: (g.maxSelections as number) ?? null,
            displayOrder: (g.displayOrder as number) ?? 0,
          },
        });
      }
    }
    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}\r`);
  }
  console.log(`  OptionGroups done.`);
}

async function seedOptions(data: SeedData) {
  const items = data.options;
  console.log(`Seeding ${items.length} Options...`);

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    for (const o of batch) {
      const existing = await prisma.brandMenuOption.findUnique({ where: { id: o.id as string } });
      if (existing) {
        await prisma.brandMenuOption.update({
          where: { id: o.id as string },
          data: {
            name: o.name as string,
            nameKo: (o.nameKo as string) ?? null,
            nameEn: (o.nameEn as string) ?? null,
            priceVnd: BigInt(o.priceVnd as number),
            isDefault: (o.isDefault as boolean) ?? false,
            isAvailable: (o.isAvailable as boolean) ?? true,
            displayOrder: (o.displayOrder as number) ?? 0,
          },
        });
      } else {
        await prisma.brandMenuOption.create({
          data: {
            id: o.id as string,
            groupId: o.groupId as string,
            name: o.name as string,
            nameKo: (o.nameKo as string) ?? null,
            nameEn: (o.nameEn as string) ?? null,
            priceVnd: BigInt(o.priceVnd as number),
            isDefault: (o.isDefault as boolean) ?? false,
            isAvailable: (o.isAvailable as boolean) ?? true,
            displayOrder: (o.displayOrder as number) ?? 0,
          },
        });
      }
    }
    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}\r`);
  }
  console.log(`  Options done.`);
}

async function seedBranchImages(data: SeedData) {
  const items = data.branchImages;
  console.log(`Seeding ${items.length} BranchImages...`);

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    for (const img of batch) {
      const existing = await prisma.branchImage.findUnique({ where: { id: img.id as string } });
      if (!existing) {
        await prisma.branchImage.create({
          data: {
            id: img.id as string,
            branchId: img.branchId as string,
            imageType: img.imageType as string,
            url: img.url as string,
            displayOrder: (img.displayOrder as number) ?? 0,
            isPrimary: (img.isPrimary as boolean) ?? false,
          },
        });
      }
    }
    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}\r`);
  }
  console.log(`  BranchImages done.`);
}

async function main() {
  console.log('=== Merchant Seed: merchants.json → PostgreSQL ===\n');

  const data = loadSeedData();
  console.log('Counts:', JSON.stringify(data._meta.counts, null, 2));

  await seedBrandProfiles(data);
  await seedBranches(data);
  await seedMenuCategories(data);
  await seedMenuItems(data);
  await seedOptionGroups(data);
  await seedOptions(data);
  await seedBranchImages(data);

  console.log('\n✅ Merchant seed completed.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
