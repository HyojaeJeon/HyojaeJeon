/**
 * Design Concept 메타데이터
 *
 * 각 컨셉은 CSS 변수 오버라이드 세트로 정의된다.
 * 컴포넌트 코드 변경 없이 data-concept 속성만으로 전체 룩앤필이 바뀐다.
 *
 * 디자인 원칙 (.impeccable.md 참고):
 * - 정보가 주인공 (장식 최소화)
 * - 색상은 의미를 전달 (장식용 색상 금지)
 * - 8시간 피로도 고려 (은은한 톤, 고대비 텍스트)
 * - 카드에 색상 띠/리본 금지
 */

export interface Concept {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  accentColor: string;
  accentBg: string;
}

export const concepts: Concept[] = [
  {
    id: 'soft-modern',
    name: 'Soft Modern',
    nameKo: '소프트 모던',
    description: '부드러운 곡선과 절제된 그림자. 따뜻하지만 과하지 않은, 피로하지 않는 기본 테마.',
    accentColor: '#E63946',
    accentBg: '#FFF1F2',
  },
  {
    id: 'bold-minimal',
    name: 'Clean Pro',
    nameKo: '클린 프로',
    description: '직선적이고 단정한 구조. 정보 밀도를 높이되 복잡하지 않은 전문가 테마.',
    accentColor: '#4F46E5',
    accentBg: '#F0F4FF',
  },
  {
    id: 'glass',
    name: 'Dark Mode',
    nameKo: '다크 모드',
    description: '야간 영업 매장을 위한 어두운 테마. 눈 피로를 줄이면서 정보 대비를 유지.',
    accentColor: '#6C85F7',
    accentBg: '#181B25',
  },
  {
    id: 'natural-warm',
    name: 'Natural Warm',
    nameKo: '내추럴 웜',
    description: '따뜻한 뉴트럴 톤. 카페/베이커리 매장에 어울리는 자연스럽고 편안한 테마.',
    accentColor: '#C07A3A',
    accentBg: '#FDF8F3',
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    nameKo: '하이 콘트라스트',
    description: '접근성 최우선. 밝은 조명 환경에서도 선명한 흑백 기반 테마.',
    accentColor: '#16A34A',
    accentBg: '#F0FDF4',
  },
];

export const conceptIds = concepts.map((c) => c.id);
