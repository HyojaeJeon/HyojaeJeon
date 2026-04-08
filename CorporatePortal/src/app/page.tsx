import {
  DataTable,
  ListPageTemplate,
  SectionCard,
  type DataTableColumn,
  type SharedUiStat,
} from '@platform/shared-ui';

type RouteRow = {
  section: string;
  route: string;
  purpose: string;
};

const summaryItems: SharedUiStat[] = [
  { label: 'Organization', value: '3 lanes', hint: 'Departments / Employees / Badge mapping' },
  { label: 'Allowance Ledger', value: '6 views', hint: 'Company support / top-up / carryover' },
  { label: 'Funding Entry', value: '1 history', hint: 'Adjustments in and out of the ledger' },
  { label: 'Policies', value: '4 builders', hint: 'Rules / calendar / limits / exceptions' },
];

const routeRows: RouteRow[] = [
  { section: 'Dashboard', route: '/dashboard', purpose: '예산 소진 / 부서별 리포트' },
  { section: 'Organization > Departments', route: '/organization/departments', purpose: '부서 트리' },
  { section: 'Organization > Employees', route: '/organization/employees', purpose: '임직원 목록' },
  { section: 'Organization > Employee Detail', route: '/organization/employees/:employeeId', purpose: '임직원 상세' },
  { section: 'Organization > Allowance Ledger', route: '/organization/employees/:employeeId/allowance-ledger', purpose: '임직원 원장' },
  { section: 'Allowance Ledger > Funding Entry History', route: '/allowance-ledger/funding-entries', purpose: '회사 지원금 / 개인 충전 / 반전 기록' },
  { section: 'Policies', route: '/policies', purpose: '시간대·부서·한도·Split·Carryover' },
  { section: 'Merchants', route: '/merchants', purpose: '허용 머천트 화이트리스트' },
  { section: 'Invoices', route: '/invoices', purpose: '월간 통합 전자세금계산서' },
  { section: 'Integrations', route: '/integrations', purpose: 'HRIS 연동' },
  { section: 'Settings', route: '/settings', purpose: '회사 정보 / 세금코드 / 관리자 계정' },
];

const routeColumns: DataTableColumn<RouteRow>[] = [
  {
    key: 'section',
    header: 'Section',
    width: '260px',
    render: (row) => <strong>{row.section}</strong>,
  },
  {
    key: 'route',
    header: 'Route',
    width: '340px',
    render: (row) => <code>{row.route}</code>,
  },
  {
    key: 'purpose',
    header: 'Purpose',
    render: (row) => row.purpose,
  },
];

export default function HomePage() {
  return (
    <ListPageTemplate
      header={{
        breadcrumbs: [{ label: 'CorporatePortal' }],
        title: 'Corporate Portal',
        description: 'Allowance ledger 중심의 B2B 고객 기업 관리 포털 scaffold.',
      }}
      summaryItems={summaryItems}
    >
      <SectionCard
        title="IA 초안"
        description="조직 관리와 Allowance Ledger 운영을 분리한다. Funding Entry History 는 독립 화면으로 둔다."
      >
        <DataTable
          columns={routeColumns}
          rows={routeRows}
          rowKey={(row) => row.route}
          caption="공용 UI 패턴 위에서 route/resource 단위로 화면을 조립한다."
        />
      </SectionCard>

      <SectionCard
        title="운영 규칙"
        description="CorporatePortal 은 allowance ledger, 정책, 거래, 정산의 조회·운영만 담당한다."
      >
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>/allowance-ledger 는 회사 지원금, 개인 충전, 이월, 소멸, 사용 내역을 분리해서 보여준다.</li>
          <li>/allowance-ledger/funding-entries 는 충전 / 적립 / 회수 / 반전 이력을 별도 화면으로 추적한다.</li>
          <li>회사 지원금과 개인 충전은 같은 계정에서 보되, 원장 entry 는 sourceType 으로 구분한다.</li>
          <li>브랜드 본사, 매장 운영, 결제 승인 로직은 이 포털에서 다루지 않는다.</li>
        </ul>
      </SectionCard>
    </ListPageTemplate>
  );
}
