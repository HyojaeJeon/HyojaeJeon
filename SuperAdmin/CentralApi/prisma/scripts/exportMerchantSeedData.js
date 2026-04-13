#!/usr/bin/env node
/**
 * fooding MySQL + crawl JSON → Platform 시드 JSON 변환 스크립트.
 *
 * 실행: node prisma/scripts/exportMerchantSeedData.js
 * 출력: prisma/seed-data/merchants.json
 *
 * Platform DB 구조에 맞춘 시드 데이터:
 *   - brandProfiles[]  → BrandProfile (가맹점 본사)
 *   - branches[]       → Branch (가맹점 지점)
 *   - menuCategories[] → BrandMenuCategory
 *   - menuItems[]      → BrandMenuItem
 *   - optionGroups[]   → BrandMenuOptionGroup
 *   - options[]        → BrandMenuOption
 *   - branchImages[]   → BranchImage
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const FOODING_DB = {
  host: 'localhost',
  port: 3306,
  database: 'fooding',
  user: 'root',
  password: 'gywo9988!@',
};

const CRAWL_DIR = '/Users/hyojae/projects/crollForm/delivery-k-croll/data';
const OUTPUT = path.join(__dirname, '..', 'seed-data', 'merchants.json');

// Platform 키 생성 유틸
const uuid = () => crypto.randomUUID();
const crypto = require('crypto');

function normalizePhone(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('0')) return '+84' + cleaned.slice(1);
  return '+84' + cleaned;
}

function parseCuisineToCategory(cuisineType) {
  // fooding cuisineType → 간단한 카테고리 코드
  if (!cuisineType) return 'GENERAL';
  const map = {
    'food-p-vietnamese': 'VIETNAMESE',
    'food-p-western': 'WESTERN',
    'food-p-japanese': 'JAPANESE',
    'food-p-korean': 'KOREAN',
    'food-p-chinese': 'CHINESE',
    'food-p-thai': 'THAI',
    'food-p-indian': 'INDIAN',
    'food-p-fastfood': 'FAST_FOOD',
    'food-p-cafe': 'CAFE',
    'food-p-bakery': 'BAKERY',
    'food-p-bbq': 'BBQ',
    'food-p-seafood': 'SEAFOOD',
    'food-p-pizza': 'PIZZA',
    'food-p-chicken': 'CHICKEN',
    'food-p-noodles': 'NOODLES',
    'food-p-dessert': 'DESSERT',
  };
  return map[cuisineType] || cuisineType.replace('food-p-', '').toUpperCase();
}

function extractRegionCode(address) {
  if (!address) return null;
  const lower = address.toLowerCase();
  if (lower.includes('hồ chí minh') || lower.includes('ho chi minh')) return 'VN-SG';
  if (lower.includes('hà nội') || lower.includes('hanoi')) return 'VN-HN';
  if (lower.includes('đà nẵng') || lower.includes('da nang')) return 'VN-DN';
  if (lower.includes('nha trang')) return 'VN-NT';
  if (lower.includes('hải phòng') || lower.includes('hai phong')) return 'VN-HP';
  if (lower.includes('bắc ninh') || lower.includes('bac ninh')) return 'VN-BN';
  if (lower.includes('vũng tàu') || lower.includes('vung tau')) return 'VN-VT';
  if (lower.includes('phú quốc') || lower.includes('phu quoc')) return 'VN-PQ';
  if (lower.includes('hội an') || lower.includes('hoi an')) return 'VN-QN';
  return 'VN-OTHER';
}

// 크롤링 메타데이터 로드 (store_info.json)
function loadCrawlMeta(storeName) {
  try {
    const cities = fs.readdirSync(CRAWL_DIR).filter(f =>
      fs.statSync(path.join(CRAWL_DIR, f)).isDirectory() && f !== '__pycache__'
    );
    for (const city of cities) {
      const storeDir = path.join(CRAWL_DIR, city, storeName);
      const infoPath = path.join(storeDir, 'store_info.json');
      if (fs.existsSync(infoPath)) {
        return JSON.parse(fs.readFileSync(infoPath, 'utf8'));
      }
    }
  } catch { /* ignore */ }
  return null;
}

async function main() {
  console.log('Connecting to fooding MySQL...');
  const conn = await mysql.createConnection(FOODING_DB);

  // 1. Stores
  console.log('Fetching stores...');
  const [stores] = await conn.execute(`
    SELECT id, name, nameKo, nameEn, slug, address, phone, latitude, longitude,
           cuisineType, logoUrl, profileImage, rating, reviewCount, totalRatings,
           deliveryFee, minOrderAmount, openingHours, status, description, descriptionKo, descriptionEn,
           paymentMethods, closedDays, parking
    FROM Stores WHERE deletedAt IS NULL AND status = 'ACTIVE'
    ORDER BY id
  `);
  console.log(`  ${stores.length} stores loaded.`);

  // 2. MenuCategories
  console.log('Fetching menu categories...');
  const [categories] = await conn.execute(`
    SELECT id, storeId, name, nameKo, nameEn, description, descriptionKo, descriptionEn,
           displayOrder, isActive, iconUrl, availableFrom, availableTo, availableDays
    FROM MenuCategories ORDER BY storeId, displayOrder
  `);
  console.log(`  ${categories.length} categories loaded.`);

  // 3. MenuItems
  console.log('Fetching menu items...');
  const [items] = await conn.execute(`
    SELECT id, storeId, categoryId, name, nameKo, nameEn, description, descriptionKo, descriptionEn,
           price, discountPrice, discountPercentage, profileImage, isAvailable, isFeatured, isBestSeller,
           isPopular, calories, preparationTime, spicyLevel, tags, displayOrder, maxOrderQuantity
    FROM MenuItems ORDER BY storeId, categoryId, displayOrder
  `);
  console.log(`  ${items.length} items loaded.`);

  // 4. MenuOptionGroups
  console.log('Fetching option groups...');
  const [groups] = await conn.execute(`
    SELECT id, menuItemId, name, nameKo, nameEn, description, descriptionKo, descriptionEn,
           isRequired, maxSelections, displayOrder
    FROM MenuOptionGroups ORDER BY menuItemId, displayOrder
  `);
  console.log(`  ${groups.length} option groups loaded.`);

  // 5. MenuOptions
  console.log('Fetching options...');
  const [options] = await conn.execute(`
    SELECT id, groupId, name, nameKo, nameEn, price, isDefault, isAvailable, displayOrder
    FROM MenuOptions ORDER BY groupId, displayOrder
  `);
  console.log(`  ${options.length} options loaded.`);

  // 6. StoreImages
  console.log('Fetching store images...');
  const [storeImages] = await conn.execute(`
    SELECT id, storeId, imageType, url, displayOrder, isPrimary
    FROM StoreImages ORDER BY storeId, displayOrder
  `);
  console.log(`  ${storeImages.length} store images loaded.`);

  // 7. MenuImages (Cloudflare)
  console.log('Fetching menu images...');
  const [menuImages] = await conn.execute(`
    SELECT id, menuItemId, url, thumbnailUrl, cloudflareId, imageType, isPrimary, displayOrder
    FROM MenuImages WHERE url LIKE '%imagedelivery%' ORDER BY menuItemId, displayOrder
  `);
  console.log(`  ${menuImages.length} menu images loaded.`);

  await conn.end();

  // ── 변환: fooding → Platform 구조 ──

  console.log('\nTransforming to Platform schema...');

  // ID 매핑 (fooding bigint → Platform UUID)
  const storeIdMap = new Map();    // fooding storeId → { brandProfileId, branchId }
  const categoryIdMap = new Map(); // fooding categoryId → Platform UUID
  const itemIdMap = new Map();     // fooding itemId → Platform UUID
  const groupIdMap = new Map();    // fooding groupId → Platform UUID

  const brandProfiles = [];
  const branches = [];
  const seedCategories = [];
  const seedItems = [];
  const seedOptionGroups = [];
  const seedOptions = [];
  const branchImages = [];

  // Transform Stores → BrandProfile + Branch
  for (const s of stores) {
    const brandProfileId = uuid();
    const branchId = uuid();
    const distributorId = null; // 시드에서는 null, 추후 할당
    const regionCode = extractRegionCode(s.address);

    storeIdMap.set(s.id, { brandProfileId, branchId });

    // 크롤링 메타데이터 병합 시도
    const crawlMeta = loadCrawlMeta(s.slug || `store-${s.id}`);

    brandProfiles.push({
      id: brandProfileId,
      brandCode: `MRC-${String(s.id).padStart(5, '0')}`,
      brandName: s.name,
      brandNameKo: s.nameKo || null,
      brandNameEn: s.nameEn || null,
      cuisineType: parseCuisineToCategory(s.cuisineType),
      status: 'ACTIVE',
      externalSourceId: String(s.id),
    });

    branches.push({
      id: branchId,
      brandHQId: brandProfileId,
      distributorId,
      branchCode: s.slug || `branch-${s.id}`,
      branchName: s.name,
      branchType: 'STORE',
      countryCode: 'VN',
      regionCode,
      addressLine1: s.address || null,
      addressLine2: null,
      postalCode: null,
      timeZoneCode: 'Asia/Ho_Chi_Minh',
      defaultLanguageCode: 'vi-VN',
      businessHoursJson: s.openingHours ? (typeof s.openingHours === 'string' ? JSON.parse(s.openingHours) : s.openingHours) : {},
      status: 'ACTIVE',
      // 신규 확장 필드
      phone: normalizePhone(s.phone),
      latitude: s.latitude ? parseFloat(s.latitude) : null,
      longitude: s.longitude ? parseFloat(s.longitude) : null,
      cuisineType: parseCuisineToCategory(s.cuisineType),
      logoUrl: s.logoUrl || null,
      profileImageUrl: s.profileImage || null,
      bannerImageUrl: crawlMeta?.thumb_url || s.profileImage || null,
      deliveryFeeVnd: s.deliveryFee || 0,
      minOrderAmountVnd: s.minOrderAmount || 0,
      rating: s.rating ? parseFloat(s.rating) : null,
      reviewCount: s.reviewCount || 0,
      description: s.description || null,
      descriptionKo: s.descriptionKo || null,
      descriptionEn: s.descriptionEn || null,
      paymentMethodsJson: s.paymentMethods || null,
      externalSourceId: String(s.id),
      // 크롤링 보강 메타데이터
      _crawl: crawlMeta ? {
        nationality: crawlMeta.nationality || null,
        deliveryTimeText: crawlMeta.delivery_time_text || null,
        operatingHours: crawlMeta.operating_hours || null,
        favorites: crawlMeta.favorites || null,
        orderCount: crawlMeta.order_count || null,
        paymentMethods: crawlMeta.payment_methods || null,
      } : null,
    });
  }

  // Transform MenuCategories
  for (const c of categories) {
    const mapping = storeIdMap.get(c.storeId);
    if (!mapping) continue;
    const catId = uuid();
    categoryIdMap.set(c.id, catId);

    seedCategories.push({
      id: catId,
      brandHQId: mapping.brandProfileId,
      categoryCode: `CAT-${c.storeId}-${c.displayOrder || c.id}`,
      categoryName: c.name,
      categoryNameKo: c.nameKo || null,
      categoryNameEn: c.nameEn || null,
      description: c.description || null,
      descriptionKo: c.descriptionKo || null,
      descriptionEn: c.descriptionEn || null,
      displayOrder: c.displayOrder || 0,
      isActive: c.isActive ? true : false,
      iconUrl: c.iconUrl || null,
    });
  }

  // Transform MenuItems
  for (const i of items) {
    const mapping = storeIdMap.get(i.storeId);
    const catId = categoryIdMap.get(i.categoryId);
    if (!mapping || !catId) continue;
    const itemId = uuid();
    itemIdMap.set(i.id, itemId);

    // Cloudflare 이미지 찾기
    const cfImage = menuImages.find(mi => mi.menuItemId === i.id && mi.isPrimary);
    const imageUrl = cfImage?.url || i.profileImage || null;

    let parsedTags = null;
    if (i.tags) {
      try {
        parsedTags = typeof i.tags === 'string' ? JSON.parse(i.tags) : i.tags;
      } catch { parsedTags = null; }
    }

    seedItems.push({
      id: itemId,
      brandHQId: mapping.brandProfileId,
      categoryId: catId,
      itemCode: `ITEM-${i.storeId}-${i.id}`,
      itemName: i.name,
      itemNameKo: i.nameKo || null,
      itemNameEn: i.nameEn || null,
      description: i.description || null,
      descriptionKo: i.descriptionKo || null,
      descriptionEn: i.descriptionEn || null,
      basePrice: i.price || 0,
      profileImageUrl: imageUrl,
      discountPriceVnd: i.discountPrice || null,
      discountPct: i.discountPercentage || null,
      calories: i.calories || null,
      preparationTime: i.preparationTime || null,
      spicyLevel: i.spicyLevel || 0,
      tags: parsedTags,
      displayOrder: i.displayOrder || 0,
      isAvailable: i.isAvailable ? true : false,
      isFeatured: i.isFeatured ? true : false,
      isBestSeller: i.isBestSeller ? true : false,
    });
  }

  // Transform MenuOptionGroups
  for (const g of groups) {
    const itemId = itemIdMap.get(g.menuItemId);
    if (!itemId) continue;
    const gId = uuid();
    groupIdMap.set(g.id, gId);

    seedOptionGroups.push({
      id: gId,
      menuItemId: itemId,
      name: g.name,
      nameKo: g.nameKo || null,
      nameEn: g.nameEn || null,
      isRequired: g.isRequired ? true : false,
      maxSelections: g.maxSelections || null,
      displayOrder: g.displayOrder || 0,
    });
  }

  // Transform MenuOptions
  for (const o of options) {
    const gId = groupIdMap.get(o.groupId);
    if (!gId) continue;

    seedOptions.push({
      id: uuid(),
      groupId: gId,
      name: o.name,
      nameKo: o.nameKo || null,
      nameEn: o.nameEn || null,
      priceVnd: o.price || 0,
      isDefault: o.isDefault ? true : false,
      isAvailable: o.isAvailable !== false,
      displayOrder: o.displayOrder || 0,
    });
  }

  // Transform StoreImages → BranchImage
  for (const si of storeImages) {
    const mapping = storeIdMap.get(si.storeId);
    if (!mapping) continue;

    branchImages.push({
      id: uuid(),
      branchId: mapping.branchId,
      imageType: si.imageType || 'EXTERIOR',
      url: si.url,
      displayOrder: si.displayOrder || 0,
      isPrimary: si.isPrimary ? true : false,
    });
  }

  // ── 결과 JSON 저장 ──

  const result = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source: 'fooding MySQL + delivery-k-croll',
      counts: {
        brandProfiles: brandProfiles.length,
        branches: branches.length,
        menuCategories: seedCategories.length,
        menuItems: seedItems.length,
        optionGroups: seedOptionGroups.length,
        options: seedOptions.length,
        branchImages: branchImages.length,
      },
    },
    brandProfiles,
    branches,
    menuCategories: seedCategories,
    menuItems: seedItems,
    optionGroups: seedOptionGroups,
    options: seedOptions,
    branchImages,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n✅ Seed data written to ${OUTPUT}`);
  console.log(`   Brand Profiles: ${brandProfiles.length}`);
  console.log(`   Branches: ${branches.length}`);
  console.log(`   Menu Categories: ${seedCategories.length}`);
  console.log(`   Menu Items: ${seedItems.length}`);
  console.log(`   Option Groups: ${seedOptionGroups.length}`);
  console.log(`   Options: ${seedOptions.length}`);
  console.log(`   Branch Images: ${branchImages.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
