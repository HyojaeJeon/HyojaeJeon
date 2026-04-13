/**
 * Mock Data Seed Script for CorporatePortal development.
 *
 * Populates CORP-SAMSUNG-VN with realistic Vietnamese mock data:
 *   - CorporateAdminUser (linked to SuperAdmin wjsgywo2005@gmail.com)
 *   - 10 MealCorporateDepartment (with hierarchy)
 *   - 50 MealEmployee across departments
 *   - 50 MealWallet (one per employee)
 *   - 50+ MealWalletFundingEntry
 *   - 5 MealPolicy
 *   - 15 MealMerchantEnrollment + commission rates + settlement accounts
 *   - 50 MealTransaction
 *   - 5 EInvoice + 50 EInvoiceLine
 *   - 3 MealSettlementBatch
 *
 * Idempotent: uses upsert or findFirst guards.
 * Run: npx ts-node prisma/seedMockData.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// ── Helpers ──

function vndAmount(min: number, max: number): bigint {
  // Round to nearest 1000 VND
  const raw = Math.floor(Math.random() * (max - min + 1)) + min;
  return BigInt(Math.round(raw / 1000) * 1000);
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function padNum(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

// ── Vietnamese realistic data ──

const VN_FIRST_NAMES = [
  'An', 'Bao', 'Chi', 'Dung', 'Em', 'Giang', 'Hoa', 'Khanh', 'Linh', 'Minh',
  'Nga', 'Phuong', 'Quang', 'Son', 'Thanh', 'Trang', 'Tuan', 'Vy', 'Xuan', 'Yen',
  'Anh', 'Binh', 'Cuong', 'Dat', 'Ha', 'Hung', 'Lan', 'Long', 'Mai', 'Nam',
];

const VN_LAST_NAMES = [
  'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Vo', 'Dang', 'Bui', 'Do',
  'Ho', 'Ngo', 'Duong', 'Ly', 'Trinh',
];

const VN_MIDDLE_NAMES = [
  'Thi', 'Van', 'Duc', 'Minh', 'Hoang', 'Thanh', 'Ngoc', 'Quoc', 'Huu', 'Dinh',
];

function vnFullName(i: number): string {
  const last = VN_LAST_NAMES[i % VN_LAST_NAMES.length];
  const middle = VN_MIDDLE_NAMES[i % VN_MIDDLE_NAMES.length];
  const first = VN_FIRST_NAMES[i % VN_FIRST_NAMES.length];
  return `${last} ${middle} ${first}`;
}

function vnPhone(i: number): string {
  const prefix = ['090', '091', '093', '097', '098', '032', '033', '034', '035', '036'];
  return `${prefix[i % prefix.length]}${padNum(1000000 + i * 1234, 7)}`;
}

const DEPARTMENTS = [
  { code: 'DEPT-HR', name: 'Phong Nhan Su', parent: null },
  { code: 'DEPT-ENG', name: 'Phong Ky Thuat', parent: null },
  { code: 'DEPT-MKT', name: 'Phong Marketing', parent: null },
  { code: 'DEPT-FIN', name: 'Phong Tai Chinh', parent: null },
  { code: 'DEPT-OPS', name: 'Phong Van Hanh', parent: null },
  { code: 'DEPT-SALES', name: 'Phong Kinh Doanh', parent: null },
  { code: 'DEPT-LEGAL', name: 'Phong Phap Che', parent: null },
  { code: 'DEPT-RND', name: 'Phong Nghien Cuu', parent: 'DEPT-ENG' },
  { code: 'DEPT-QA', name: 'Phong Kiem Thu', parent: 'DEPT-ENG' },
  { code: 'DEPT-SUPPORT', name: 'Phong Ho Tro', parent: 'DEPT-OPS' },
];

const MERCHANT_BRANDS = [
  { code: 'BRD-COMGA-001', name: 'Com Ga Ba Buoi', category: 'RICE', taxCode: '0312345601', address: '123 Nguyen Hue, Q1, TP.HCM', phone: '0281234501' },
  { code: 'BRD-BUNBO-001', name: 'Bun Bo Hue Muoi', category: 'NOODLE', taxCode: '0312345602', address: '45 Le Loi, Q1, TP.HCM', phone: '0281234502' },
  { code: 'BRD-PHO24-001', name: 'Pho 24 Saigon', category: 'NOODLE', taxCode: '0312345603', address: '78 Hai Ba Trung, Q1, TP.HCM', phone: '0281234503' },
  { code: 'BRD-BANHMI-001', name: 'Banh Mi Huynh Hoa', category: 'BREAD', taxCode: '0312345604', address: '26 Le Thi Rieng, Q1, TP.HCM', phone: '0281234504' },
  { code: 'BRD-CHETHAI-001', name: 'Che Thai Sai Gon', category: 'DESSERT', taxCode: '0312345605', address: '90 Vo Van Tan, Q3, TP.HCM', phone: '0281234505' },
  { code: 'BRD-LOTTE-001', name: 'Lotteria Vietnam', category: 'FAST_FOOD', taxCode: '0312345606', address: '12 Dong Khoi, Q1, TP.HCM', phone: '0281234506' },
  { code: 'BRD-KFC-001', name: 'KFC Vietnam', category: 'FAST_FOOD', taxCode: '0312345607', address: '55 Nguyen Trai, Q5, TP.HCM', phone: '0281234507' },
  { code: 'BRD-HIGHLAND-001', name: 'Highlands Coffee', category: 'BEVERAGE', taxCode: '0312345608', address: '101 Tran Hung Dao, Q1, TP.HCM', phone: '0281234508' },
  { code: 'BRD-PIZZA-001', name: 'Pizza Company', category: 'PIZZA', taxCode: '0312345609', address: '33 Le Duan, Q1, TP.HCM', phone: '0281234509' },
  { code: 'BRD-COMTAM-001', name: 'Com Tam Moc', category: 'RICE', taxCode: '0312345610', address: '200 Cach Mang Thang 8, Q3, TP.HCM', phone: '0281234510' },
  { code: 'BRD-SUSHI-001', name: 'Sushi Hokkaido', category: 'JAPANESE', taxCode: '0312345611', address: '67 Pasteur, Q1, TP.HCM', phone: '0281234511' },
  { code: 'BRD-GOGI-001', name: 'GoGi House BBQ', category: 'KOREAN', taxCode: '0312345612', address: '45 Ly Tu Trong, Q1, TP.HCM', phone: '0281234512' },
  { code: 'BRD-JOLLY-001', name: 'Jollibee Vietnam', category: 'FAST_FOOD', taxCode: '0312345613', address: '88 Nam Ky Khoi Nghia, Q1, TP.HCM', phone: '0281234513' },
  { code: 'BRD-BUNCHA-001', name: 'Bun Cha Ha Noi', category: 'NOODLE', taxCode: '0312345614', address: '15 Bui Vien, Q1, TP.HCM', phone: '0281234514' },
  { code: 'BRD-COOFFE-001', name: 'The Coffee House', category: 'BEVERAGE', taxCode: '0312345615', address: '140 Nguyen Du, Q1, TP.HCM', phone: '0281234515' },
];

async function main() {
  console.log('Starting CorporatePortal mock data seed...');

  // ── 1. Find CORP-SAMSUNG-VN ──
  const corp = await prisma.mealCorporate.findUnique({
    where: { tenantCode: 'CORP-SAMSUNG-VN' },
  });
  if (!corp) {
    console.error('CORP-SAMSUNG-VN not found. Run base seed first: npx prisma db seed');
    process.exit(1);
  }
  const corporateId = corp.id;
  console.log(`Found corporate: ${corp.companyName} (${corporateId})`);

  // ── 2. Create CorporateAdminUser linked to wjsgywo2005@gmail.com ──
  const adminPasswordHash = await bcrypt.hash('admin1234!', 12);
  const adminUser = await prisma.corporateAdminUser.upsert({
    where: {
      uq_corporate_admin_login: {
        corporateId,
        loginId: 'wjsgywo2005@gmail.com',
      },
    },
    update: {},
    create: {
      corporateId,
      loginId: 'wjsgywo2005@gmail.com',
      passwordHash: adminPasswordHash,
      displayName: 'Hyojae Jeon (Super Admin)',
      email: 'wjsgywo2005@gmail.com',
      phone: '0901234567',
      status: 'ACTIVE',
    },
  });
  console.log(`CorporateAdminUser: ${adminUser.loginId} (${adminUser.id})`);

  // ── 3. Departments (10) ──
  const deptMap: Record<string, string> = {};
  // First pass: create departments without parents
  for (const d of DEPARTMENTS) {
    const dept = await prisma.mealCorporateDepartment.upsert({
      where: {
        uq_meal_dept_corp: {
          corporateId,
          departmentCode: d.code,
        },
      },
      update: {},
      create: {
        corporateId,
        departmentCode: d.code,
        departmentName: d.name,
        parentDepartmentId: null,
      },
    });
    deptMap[d.code] = dept.id;
  }
  // Second pass: set parent references
  for (const d of DEPARTMENTS) {
    if (d.parent && deptMap[d.parent]) {
      await prisma.mealCorporateDepartment.update({
        where: { id: deptMap[d.code] },
        data: { parentDepartmentId: deptMap[d.parent] },
      });
    }
  }
  console.log(`Departments: ${Object.keys(deptMap).length}`);

  // ── 4. Employees (50) ──
  const deptCodes = Object.keys(deptMap);
  const employeeIds: string[] = [];
  const EMPLOYMENT_TYPES = ['FULL_TIME', 'FULL_TIME', 'FULL_TIME', 'PART_TIME', 'CONTRACT'];
  const STATUSES = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED'];

  for (let i = 0; i < 50; i++) {
    const empCode = `EMP-${padNum(i + 1, 4)}`;
    const deptCode = deptCodes[i % deptCodes.length];
    const emp = await prisma.mealEmployee.upsert({
      where: {
        uq_meal_emp_corp: {
          corporateId,
          employeeCode: empCode,
        },
      },
      update: {},
      create: {
        corporateId,
        departmentId: deptMap[deptCode],
        employeeCode: empCode,
        fullName: vnFullName(i),
        email: `employee${padNum(i + 1, 3)}@samsung-vn.com`,
        phone: vnPhone(i),
        badgeRfid: `RFID-SS-${padNum(i + 1, 6)}`,
        status: STATUSES[i % STATUSES.length],
      },
    });
    employeeIds.push(emp.id);
  }
  console.log(`Employees: ${employeeIds.length}`);

  // ── 5. Wallets (50) ──
  const walletIds: string[] = [];
  for (let i = 0; i < 50; i++) {
    const balance = vndAmount(500_000, 5_000_000);
    const companyAllowance = vndAmount(300_000, 3_000_000);
    const personalTopUp = balance - companyAllowance > 0n ? balance - companyAllowance : 0n;

    const existing = await prisma.mealWallet.findUnique({
      where: { employeeId: employeeIds[i] },
    });
    if (existing) {
      walletIds.push(existing.id);
      continue;
    }

    const wallet = await prisma.mealWallet.create({
      data: {
        corporateId,
        employeeId: employeeIds[i],
        status: i % 10 === 9 ? 'SUSPENDED' : 'ACTIVE',
        balanceVnd: balance,
        companyAllowanceVnd: companyAllowance,
        personalTopUpVnd: personalTopUp,
        dailyLimitVnd: BigInt(200_000),
      },
    });
    walletIds.push(wallet.id);
  }
  console.log(`Wallets: ${walletIds.length}`);

  // ── 6. Wallet Funding Entries (60) ──
  let fundingCount = 0;
  for (let i = 0; i < 60; i++) {
    const walletId = walletIds[i % walletIds.length];
    const isCompany = i % 3 !== 2;
    const entryId = randomUUID();
    const existing = await prisma.mealWalletFundingEntry.findFirst({
      where: { walletId, sourceBatchId: `BATCH-2026-${padNum(Math.floor(i / 10) + 1, 2)}` },
    });
    if (existing) { fundingCount++; continue; }

    await prisma.mealWalletFundingEntry.create({
      data: {
        id: entryId,
        walletId,
        sourceType: isCompany ? 'COMPANY_ALLOWANCE' : 'PERSONAL_TOP_UP',
        status: 'POSTED',
        amountVnd: vndAmount(500_000, 3_000_000),
        sourceBatchId: `BATCH-2026-${padNum(Math.floor(i / 10) + 1, 2)}`,
        sourceReferenceId: `REF-${padNum(i + 1, 6)}`,
        note: isCompany ? 'Tro cap thang cua cong ty' : 'Nap tien ca nhan',
        postedAt: randomDate(new Date('2026-01-01'), new Date('2026-04-10')),
      },
    });
    fundingCount++;
  }
  console.log(`Funding entries: ${fundingCount}`);

  // ── 7. Meal Policies (5) ──
  const policyDefs = [
    {
      code: 'POL-LUNCH-STD',
      name: 'Standard Lunch Policy',
      deptCodes: ['DEPT-HR', 'DEPT-FIN', 'DEPT-LEGAL', 'DEPT-SALES'],
      maxPerTx: 150_000,
      dailyLimit: 200_000,
      ruleJson: { windows: [{ start: '11:00', end: '13:30', label: 'Lunch' }], allowedCategories: ['RICE', 'NOODLE', 'BREAD'] },
    },
    {
      code: 'POL-LUNCH-ENG',
      name: 'Engineering Lunch Policy',
      deptCodes: ['DEPT-ENG', 'DEPT-RND', 'DEPT-QA'],
      maxPerTx: 200_000,
      dailyLimit: 300_000,
      ruleJson: { windows: [{ start: '11:00', end: '14:00', label: 'Lunch' }], allowedCategories: ['ALL'] },
    },
    {
      code: 'POL-DINNER-OPS',
      name: 'Operations Night Shift Dinner',
      deptCodes: ['DEPT-OPS', 'DEPT-SUPPORT'],
      maxPerTx: 120_000,
      dailyLimit: 150_000,
      ruleJson: { windows: [{ start: '18:00', end: '21:00', label: 'Dinner' }], allowedCategories: ['ALL'] },
    },
    {
      code: 'POL-EXEC-MEAL',
      name: 'Executive Meal Allowance',
      deptCodes: [],
      maxPerTx: 500_000,
      dailyLimit: 1_000_000,
      ruleJson: { windows: [{ start: '06:00', end: '22:00', label: 'All Day' }], allowedCategories: ['ALL'], roleCodes: ['MANAGER', 'DIRECTOR'] },
    },
    {
      code: 'POL-WEEKEND-ALL',
      name: 'Weekend Team Lunch',
      deptCodes: [],
      maxPerTx: 100_000,
      dailyLimit: 100_000,
      ruleJson: { windows: [{ start: '11:00', end: '13:00', label: 'Weekend Lunch' }], daysOfWeek: [6, 7] },
    },
  ];

  for (const p of policyDefs) {
    await prisma.mealPolicy.upsert({
      where: {
        uq_meal_policy_corp: { corporateId, policyCode: p.code },
      },
      update: {},
      create: {
        corporateId,
        policyCode: p.code,
        policyName: p.name,
        appliesToDepartmentIds: p.deptCodes.map((c) => deptMap[c]).filter(Boolean),
        ruleJson: p.ruleJson,
        maxPerTransactionVnd: BigInt(p.maxPerTx),
        dailyLimitVnd: BigInt(p.dailyLimit),
        allowSplitPayment: true,
        status: 'ACTIVE',
        effectiveFrom: new Date('2026-01-01'),
        effectiveTo: null,
      },
    });
  }
  console.log(`Policies: ${policyDefs.length}`);

  // ── 8. Merchant Enrollments (15) ──
  // Create BrandProfile entries for merchants, then enroll them
  // Find a distributor for the required FK
  const dist = await prisma.distributorProfile.findFirst({ where: { deletedAt: null } });
  const distId = dist?.id ?? randomUUID();

  const merchantEnrollmentIds: string[] = [];
  for (let i = 0; i < MERCHANT_BRANDS.length; i++) {
    const m = MERCHANT_BRANDS[i];
    const brand = await prisma.brandProfile.upsert({
      where: { brandCode: m.code },
      update: {},
      create: {
        distributorId: distId,
        brandCode: m.code,
        brandName: m.name,
        countryCode: 'VN',
        defaultLanguageCode: 'vi-VN',
        businessNumber: m.taxCode,
        contactEmail: `contact@${m.code.toLowerCase().replace(/-/g, '')}.vn`,
        contactPhone: m.phone,
        status: 'ACTIVE',
      },
    });

    const enrollment = await prisma.mealMerchantEnrollment.upsert({
      where: { brandHqId: brand.id },
      update: {},
      create: {
        brandHqId: brand.id,
        isActive: i < 13, // 2 inactive
        loopType: i % 4 === 0 ? 'CLOSED_LOOP' : 'OPEN_LOOP',
        enrolledAt: randomDate(new Date('2025-06-01'), new Date('2026-01-01')),
        contractEndsAt: new Date('2027-12-31'),
      },
    });
    merchantEnrollmentIds.push(enrollment.id);

    // Commission rate
    const existingRate = await prisma.mealMerchantCommissionRate.findFirst({
      where: { enrollmentId: enrollment.id },
    });
    if (!existingRate) {
      await prisma.mealMerchantCommissionRate.create({
        data: {
          enrollmentId: enrollment.id,
          effectiveFrom: new Date('2026-01-01'),
          effectiveTo: null,
          baseRatePct: 2.5 + (i % 5) * 0.5,
          specialZoneRatePct: i % 3 === 0 ? 1.5 : null,
          franchiseFlatRatePct: i % 4 === 0 ? 3.0 : null,
        },
      });
    }

    // Settlement account
    const existingAcct = await prisma.mealMerchantSettlementAccount.findFirst({
      where: { enrollmentId: enrollment.id },
    });
    if (!existingAcct) {
      const banks = ['VCB', 'TCB', 'ACB', 'BIDV', 'MBB', 'VPB', 'STB', 'TPB'];
      await prisma.mealMerchantSettlementAccount.create({
        data: {
          enrollmentId: enrollment.id,
          bankCode: banks[i % banks.length],
          bankAccountNumber: `${padNum(10000000 + i * 111111, 14)}`,
          bankAccountHolder: m.name,
          taxCode: m.taxCode,
          isPrimary: true,
        },
      });
    }
  }
  console.log(`Merchant enrollments: ${merchantEnrollmentIds.length}`);

  // ── 9. Find existing brands+branches for transactions ──
  const allBrands = await prisma.brandProfile.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true },
    take: 15,
  });
  const allBranches = await prisma.branch.findMany({
    where: { deletedAt: null },
    select: { id: true, brandHQId: true },
    take: 20,
  });

  // If no branches exist, create minimal ones for our merchant brands
  let branchPool: { id: string; brandHQId: string }[] = allBranches;
  if (branchPool.length === 0) {
    for (let i = 0; i < Math.min(5, allBrands.length); i++) {
      const branchCode = `MOCK-BR-${padNum(i + 1, 3)}`;
      const br = await prisma.branch.upsert({
        where: { branchCode },
        update: {},
        create: {
          brandHQId: allBrands[i].id,
          distributorId: distId,
          branchCode,
          branchName: `Mock Branch ${i + 1}`,
          countryCode: 'VN',
          timeZoneCode: 'Asia/Ho_Chi_Minh',
          defaultLanguageCode: 'vi-VN',
          status: 'ACTIVE',
        },
      });
      branchPool.push({ id: br.id, brandHQId: br.brandHQId });
    }
  }

  // ── 10. Transactions (50) ──
  const AUTH_METHODS = ['APP_QR', 'DYNAMIC_BARCODE', 'RFID_BADGE', 'BIOMETRIC_FACE'];
  const TX_STATUSES = ['APPROVED', 'APPROVED', 'APPROVED', 'APPROVED', 'SETTLED', 'SETTLED', 'DECLINED', 'REVERSED'];
  let txCount = 0;

  for (let i = 0; i < 50; i++) {
    const idempKey = `MOCK-TX-SAMSUNG-${padNum(i + 1, 5)}`;
    const existing = await prisma.mealTransaction.findFirst({
      where: { idempotencyKey: idempKey },
    });
    if (existing) { txCount++; continue; }

    const walletIdx = i % walletIds.length;
    const branch = branchPool.length > 0 ? randomItem(branchPool) : null;
    const brandId = branch?.brandHQId ?? allBrands[i % allBrands.length]?.id ?? randomUUID();
    const branchId = branch?.id ?? randomUUID();
    const requestedAmount = vndAmount(30_000, 200_000);
    const status = TX_STATUSES[i % TX_STATUSES.length];
    const isApproved = status !== 'DECLINED';
    const approvedAmount = isApproved ? requestedAmount : 0n;
    const companyShare = isApproved ? (approvedAmount * 70n) / 100n : 0n;
    const employeeShare = isApproved ? approvedAmount - companyShare : 0n;
    const txDate = randomDate(new Date('2026-01-01'), new Date('2026-04-10'));

    await prisma.mealTransaction.create({
      data: {
        walletId: walletIds[walletIdx],
        corporateId,
        brandHqId: brandId,
        branchId,
        terminalId: null,
        loopType: i % 4 === 0 ? 'CLOSED_LOOP' : 'OPEN_LOOP',
        authMethod: AUTH_METHODS[i % AUTH_METHODS.length],
        requestedAmountVnd: requestedAmount,
        approvedAmountVnd: approvedAmount,
        companyShareVnd: companyShare,
        employeeShareVnd: employeeShare,
        status,
        declineReason: status === 'DECLINED' ? 'DAILY_LIMIT_EXCEEDED' : null,
        idempotencyKey: idempKey,
        authorizedAt: isApproved ? txDate : null,
        settledAt: status === 'SETTLED' ? new Date(txDate.getTime() + 86400000 * 3) : null,
        createdAt: txDate,
      },
    });
    txCount++;
  }
  console.log(`Transactions: ${txCount}`);

  // ── 11. EInvoice (5) + EInvoiceLine (10+ per invoice) ──
  const INVOICE_STATUSES = ['DRAFT', 'REQUESTED', 'ACCEPTED', 'ACCEPTED', 'POSTED'];
  let invoiceCount = 0;

  for (let m = 0; m < 5; m++) {
    const periodStart = new Date(`2026-${padNum(m + 1, 2)}-01`);
    const periodEnd = new Date(`2026-${padNum(m + 1, 2)}-${m === 1 ? '28' : '30'}`);
    const status = INVOICE_STATUSES[m];
    const totAmount = vndAmount(20_000_000, 80_000_000);
    const totVat = (totAmount * 10n) / 100n;

    const existing = await prisma.eInvoice.findFirst({
      where: {
        subjectType: 'CORPORATE',
        subjectId: corporateId,
        periodStart,
        periodEnd,
      },
    });
    if (existing) { invoiceCount++; continue; }

    const invoice = await prisma.eInvoice.create({
      data: {
        subjectType: 'CORPORATE',
        subjectId: corporateId,
        issuanceMode: 'CONSOLIDATED',
        periodStart,
        periodEnd,
        status,
        totAmountVnd: totAmount,
        totDiscountVnd: 0n,
        totVatAmountVnd: totVat,
        totPayableVnd: totAmount + totVat,
        consolidationStrategy: 'BY_MERCHANT',
        sourceTransactionCount: 200 + m * 50,
        sellerTaxCode: '0109876543',
        sellerCompanyName: 'Cong ty Co phan Hyojung Softtech',
        sellerAddress: '456 Nguyen Van Linh, Q7, TP.HCM',
        sellerEmail: 'invoice@hyojung.vn',
        buyerTaxCode: corp.taxCode,
        buyerCompanyName: corp.companyName,
        buyerAddress: corp.addressFull ?? '1 SCBD, Thu Duc, TP.HCM',
        buyerEmail: corp.contactEmail ?? 'finance@samsung-vn.com',
        reviewDueAt: status === 'DRAFT' ? new Date('2026-04-20') : null,
        requestedAt: ['REQUESTED', 'ACCEPTED', 'POSTED'].includes(status) ? new Date(`2026-${padNum(m + 2, 2)}-05`) : null,
        acceptedAt: ['ACCEPTED', 'POSTED'].includes(status) ? new Date(`2026-${padNum(m + 2, 2)}-10`) : null,
        invoiceIssuedAt: status === 'ACCEPTED' ? new Date(`2026-${padNum(m + 2, 2)}-10`) : null,
        formNo: '1',
        serialNo: status === 'ACCEPTED' ? `C26T-${padNum(m + 1, 4)}` : null,
        invoiceNo: status === 'ACCEPTED' ? `${padNum(1000 + m, 8)}` : null,
        currencyCode: 'VND',
        exchangeRate: 1,
        paymentMethod: 'TM/CK',
      },
    });

    // 10-12 lines per invoice (one per merchant)
    const lineCount = 10 + (m % 3);
    for (let l = 0; l < lineCount; l++) {
      const merchant = MERCHANT_BRANDS[l % MERCHANT_BRANDS.length];
      const lineAmount = vndAmount(1_000_000, 8_000_000);
      const lineVat = (lineAmount * 10n) / 100n;

      await prisma.eInvoiceLine.create({
        data: {
          invoiceId: invoice.id,
          seq: l + 1,
          itemCode: merchant.code,
          itemName: `Dich vu an uong - ${merchant.name}`,
          uom: 'Lan',
          quantity: 15 + l * 3,
          unitPriceVnd: Number(lineAmount) / (15 + l * 3),
          vatTreatment: 'TAXED',
          vatRatePct: 10,
          amountVnd: lineAmount,
          vatAmountVnd: lineVat,
          payAmountVnd: lineAmount + lineVat,
          feature: '1',
        },
      });
    }
    invoiceCount++;
  }
  console.log(`EInvoices: ${invoiceCount}`);

  // ── 12. Settlement Batches (3) ──
  for (let s = 0; s < 3; s++) {
    const brandId = allBrands[s % allBrands.length]?.id ?? randomUUID();
    const periodStart = new Date(`2026-${padNum(s + 1, 2)}-01`);
    const periodEnd = new Date(`2026-${padNum(s + 1, 2)}-${s === 1 ? '28' : '30'}`);
    const gross = vndAmount(10_000_000, 50_000_000);
    const commission = (gross * 3n) / 100n;

    const existing = await prisma.mealSettlementBatch.findFirst({
      where: { brandHqId: brandId, periodStart, periodEnd },
    });
    if (existing) continue;

    await prisma.mealSettlementBatch.create({
      data: {
        brandHqId: brandId,
        periodStart,
        periodEnd,
        status: s === 0 ? 'PAID' : s === 1 ? 'MATCHED' : 'OPEN',
        grossAmountVnd: gross,
        commissionAmountVnd: commission,
        netPayableVnd: gross - commission,
        threeWayMismatchCount: s === 2 ? 3 : 0,
      },
    });
  }
  console.log('Settlement batches: 3');

  // ── 13. MealFundingAccount ──
  const existingFunding = await prisma.mealFundingAccount.findFirst({
    where: { corporateId },
  });
  if (!existingFunding) {
    await prisma.mealFundingAccount.create({
      data: {
        corporateId,
        fundingModel: 'PREPAID_DEPOSIT',
        bankCode: 'VCB',
        bankAccountNo: '00712345678901',
        balanceVnd: BigInt(500_000_000),
        creditLimitVnd: 0n,
        status: 'ACTIVE',
      },
    });
  }
  console.log('Funding account: 1');

  console.log('\nMock data seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
