/**
 * CorporatePortal 루트 페이지 (placeholder).
 *
 * 본 프로젝트는 기준서 `00-Platform-최종-아키텍처-기준서.md §2.1` 의 신규 `Corporate` 계층 전용 포털이다.
 * BrandHQPortal 과는 코드/엔티티/라우트를 공유하지 않는다.
 * 공유되는 것은 `SharedContracts/ApiSdk/src/mealticket` 뿐이고, 번역 원본은 이 프로젝트 내부 i18n 이다.
 */
export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '48px',
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Corporate Portal</h1>
      <p style={{ color: '#6b7280', marginTop: 8 }}>
        식권 플랫폼 B2B 고객 기업 전용 관리 포털 — scaffolding placeholder
      </p>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>라우트 (초안)</h2>
        <ul style={{ lineHeight: 1.8, marginTop: 12 }}>
          <li><code>/dashboard</code> — 예산 소진 / 부서별 리포트</li>
          <li><code>/departments</code> — 부서 트리</li>
          <li><code>/employees</code> — 임직원 / Wallet / RFID 배지 매핑</li>
          <li><code>/policies</code> — 정책 빌더 (시간대·부서·한도·Split)</li>
          <li><code>/budget</code> — 충전 / 자동 할당 / 소멸 정책</li>
          <li><code>/merchants</code> — 허용 머천트 화이트리스트</li>
          <li><code>/invoices</code> — 월간 통합 전자세금계산서 (GDT)</li>
          <li><code>/integrations</code> — HRIS 연동</li>
          <li><code>/settings</code> — 회사 정보 / 세금코드 / 관리자 계정</li>
        </ul>
      </section>
    </main>
  );
}
