'use client';

import { useState } from 'react';

/* ─── Atoms ─── */
import Button from '@design-system/atoms/Button';
import Icon from '@design-system/atoms/Icon';
import TextInput from '@design-system/atoms/TextInput';
import NumberInput from '@design-system/atoms/NumberInput';
import Label from '@design-system/atoms/Label';
import Badge from '@design-system/atoms/Badge';
import Checkbox from '@design-system/atoms/Checkbox';
import Radio from '@design-system/atoms/Radio';
import Toggle from '@design-system/atoms/Toggle';
import Spinner from '@design-system/atoms/Spinner';
import Skeleton from '@design-system/atoms/Skeleton';
import Divider from '@design-system/atoms/Divider';

/* ─── Molecules ─── */
import NumPad from '@design-system/molecules/NumPad';
import AmountInput from '@design-system/molecules/AmountInput';
import Stepper from '@design-system/molecules/Stepper';
import SearchBar from '@design-system/molecules/SearchBar';
import FormField from '@design-system/molecules/FormField';
import Toast from '@design-system/molecules/Toast';
import Alert from '@design-system/molecules/Alert';
import Tabs from '@design-system/molecules/Tabs';
import Dropdown from '@design-system/molecules/Dropdown';
import Chip from '@design-system/molecules/Chip';
import DatePicker from '@design-system/molecules/DatePicker';
import ProgressBar from '@design-system/molecules/ProgressBar';

/* ─── Organisms ─── */
import TableCard from '@design-system/organisms/TableCard';
import MenuCard from '@design-system/organisms/MenuCard';
import OrderSidebar from '@design-system/organisms/OrderSidebar';
import TakeoutBar from '@design-system/organisms/TakeoutBar';
import Header from '@design-system/organisms/Header';
import NavigationBar from '@design-system/organisms/NavigationBar';
import CategoryBar from '@design-system/organisms/CategoryBar';
import MenuGrid from '@design-system/organisms/MenuGrid';
import OrderItemList from '@design-system/organisms/OrderItemList';
import TableGrid from '@design-system/organisms/TableGrid';
import FloorSelector from '@design-system/organisms/FloorSelector';
import PaymentMethodSelector from '@design-system/organisms/PaymentMethodSelector';
import KeypadPanel from '@design-system/organisms/KeypadPanel';
import SummaryPanel from '@design-system/organisms/SummaryPanel';
import Modal from '@design-system/organisms/Modal';
import ConfirmDialog from '@design-system/organisms/ConfirmDialog';
import Drawer from '@design-system/organisms/Drawer';
import ReceiptPreview from '@design-system/organisms/ReceiptPreview';
import CustomerInfoPanel from '@design-system/organisms/CustomerInfoPanel';
import EmployeeSelector from '@design-system/organisms/EmployeeSelector';
import DeviceStatus from '@design-system/organisms/DeviceStatus';
import KitchenDisplay from '@design-system/organisms/KitchenDisplay';

/* ─── Specialized ─── */
import OptionSelector from '@design-system/specialized/OptionSelector';
import PaymentStatus from '@design-system/specialized/PaymentStatus';
import ChangeCalculator from '@design-system/specialized/ChangeCalculator';
import DiscountCalculator from '@design-system/specialized/DiscountCalculator';
import QRCodeDisplay from '@design-system/specialized/QRCodeDisplay';
import SignaturePad from '@design-system/specialized/SignaturePad';
import ErrorRecovery from '@design-system/specialized/ErrorRecovery';
import VoidReceipt from '@design-system/specialized/VoidReceipt';

/* ─── Templates ─── */
import POSMainLayout from '@design-system/templates/POSMainLayout';
import SplitPanelLayout from '@design-system/templates/SplitPanelLayout';
import FullScreenModal from '@design-system/templates/FullScreenModal';

/* ─── Concepts ─── */
import ConceptSection from '@design-system/concepts/ConceptSection';
import { concepts } from '@design-system/concepts/index';


/* ════════════════════════════════════════════════════════════════
   Mock Data
   ════════════════════════════════════════════════════════════════ */

const noop = () => {};

const mockTables = {
  empty:    { id: 'T1', label: '1번', status: 'EMPTY',    orderSummary: '',                totalAmount: 0,       guests: 0, elapsedTimeMin: 0 },
  occupied: { id: 'T2', label: '2번', status: 'OCCUPIED', orderSummary: '김치찌개 외 2건', totalAmount: 465000,  guests: 3, elapsedTimeMin: 45 },
  paying:   { id: 'T3', label: '3번', status: 'PAYING',   orderSummary: '삼겹살 외 5건',   totalAmount: 1635000, guests: 4, elapsedTimeMin: 70 },
};

const mockMenus = {
  normal:  { id: 'M1', name: '김치찌개', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=400&h=400&q=80', isSoldOut: false },
  soldOut: { id: 'M2', name: '감자탕',   price: 475000, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&h=400&q=80', isSoldOut: true },
};

const mockOrder = [
  { name: '김치찌개', price: 150000, quantity: 2 },
  { name: '제육볶음', price: 190000, quantity: 1 },
];

const mockMenuItems = [
  { id: 'M1', name: '김치찌개', price: 150000 },
  { id: 'M2', name: '된장찌개', price: 150000 },
  { id: 'M3', name: '삼겹살',   price: 530000 },
  { id: 'M4', name: '제육볶음', price: 190000 },
  { id: 'M5', name: '불고기',   price: 280000 },
  { id: 'M6', name: '비빔밥',   price: 120000 },
  { id: 'M7', name: '냉면',     price: 130000 },
  { id: 'M8', name: '콜라',     price: 30000  },
];

const mockCategories = [
  { id: 'C1', name: '전체' },
  { id: 'C2', name: '찌개류' },
  { id: 'C3', name: '구이류' },
  { id: 'C4', name: '밥류' },
  { id: 'C5', name: '면류' },
  { id: 'C6', name: '음료' },
  { id: 'C7', name: '사이드' },
  { id: 'C8', name: '주류' },
];

const mockFloors = [
  { id: 'F1', name: '1층' },
  { id: 'F2', name: '2층' },
  { id: 'F3', name: '3층' },
  { id: 'F4', name: '테라스' },
];

const mockEmployees = [
  { id: 'E1', name: '김민수', role: '매니저' },
  { id: 'E2', name: '이영희', role: '홀 직원' },
  { id: 'E3', name: '박지훈', role: '주방장' },
  { id: 'E4', name: '최서연', role: '캐셔' },
  { id: 'E5', name: '정하늘', role: '홀 직원' },
  { id: 'E6', name: '강도윤', role: '알바' },
];

const mockDevices = [
  { name: 'POS 프린터', connected: true,  type: 'printer' },
  { name: 'BC 카드리더', connected: true,  type: 'cardReader' },
  { name: '전자저울',     connected: false, type: 'scale' },
  { name: 'LAN',         connected: true,  type: 'network' },
];

const mockKitchenOrders = [
  { orderNo: '0042', tableName: '1번 테이블', items: [{ name: '김치찌개', qty: 2 }, { name: '공기밥', qty: 2 }], elapsedMin: 3,  status: 'pending' as const },
  { orderNo: '0041', tableName: '5번 테이블', items: [{ name: '삼겹살', qty: 3 }, { name: '된장찌개', qty: 1 }], elapsedMin: 8,  status: 'cooking' as const },
  { orderNo: '0040', tableName: '3번 테이블', items: [{ name: '비빔밥', qty: 1 }],                              elapsedMin: 15, status: 'done' as const },
];

const mockReceiptItems = [
  { name: '김치찌개', qty: 2, price: 150000 },
  { name: '제육볶음', qty: 1, price: 190000 },
  { name: '콜라',     qty: 2, price: 30000 },
];

const mockOptionGroups = [
  {
    name: '맵기 선택',
    required: true,
    options: [
      { id: 'O1', name: '순한맛' },
      { id: 'O2', name: '보통' },
      { id: 'O3', name: '매운맛' },
      { id: 'O4', name: '아주 매운맛', price: 10000 },
    ],
  },
  {
    name: '추가 토핑',
    required: false,
    options: [
      { id: 'O5', name: '계란',   price: 10000 },
      { id: 'O6', name: '치즈',   price: 20000 },
      { id: 'O7', name: '만두',   price: 30000 },
      { id: 'O8', name: '공기밥', price: 10000 },
    ],
  },
];

const mockVoidReceipt = {
  no: '2026-0404-0042',
  date: '2026-04-04 14:32',
  amount: 490000,
  items: [
    { name: '김치찌개', qty: 2, price: 150000 },
    { name: '제육볶음', qty: 1, price: 190000 },
  ],
};

const mockTableGrid = [
  { id: 'T1',  label: '1번',  status: 'EMPTY',    totalAmount: 0,       guests: 0, elapsedTimeMin: 0 },
  { id: 'T2',  label: '2번',  status: 'OCCUPIED', totalAmount: 465000,  guests: 3, elapsedTimeMin: 45, orderSummary: '김치찌개 외 2건' },
  { id: 'T3',  label: '3번',  status: 'PAYING',   totalAmount: 1635000, guests: 4, elapsedTimeMin: 70, orderSummary: '삼겹살 외 5건' },
  { id: 'T4',  label: '4번',  status: 'EMPTY',    totalAmount: 0,       guests: 0, elapsedTimeMin: 0 },
  { id: 'T5',  label: '5번',  status: 'OCCUPIED', totalAmount: 280000,  guests: 2, elapsedTimeMin: 20, orderSummary: '불고기 외 1건' },
  { id: 'T6',  label: '6번',  status: 'EMPTY',    totalAmount: 0,       guests: 0, elapsedTimeMin: 0 },
  { id: 'T7',  label: '7번',  status: 'EMPTY',    totalAmount: 0,       guests: 0, elapsedTimeMin: 0 },
  { id: 'T8',  label: '8번',  status: 'OCCUPIED', totalAmount: 120000,  guests: 1, elapsedTimeMin: 10, orderSummary: '비빔밥' },
];

const mockNavItems = [
  { id: 'table',   label: '테이블' },
  { id: 'order',   label: '주문' },
  { id: 'payment', label: '결제' },
  { id: 'history', label: '매출' },
  { id: 'setting', label: '설정' },
];

const mockTabItems = [
  { id: 'tab1', label: '전체 주문' },
  { id: 'tab2', label: '대기 중' },
  { id: 'tab3', label: '처리 완료' },
];

const mockDropdownOptions = [
  { value: 'all',    label: '전체' },
  { value: 'cash',   label: '현금' },
  { value: 'card',   label: '카드' },
  { value: 'point',  label: '포인트' },
];

/* ─── Icon for demo ─── */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);


/* ════════════════════════════════════════════════════════════════
   Atom Previews
   ════════════════════════════════════════════════════════════════ */

/* ─── Button Preview ─── */
function ButtonPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">유형별</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">기본</Button>
              <Button variant="secondary">보조</Button>
              <Button variant="danger">위험</Button>
              <Button variant="ghost">투명</Button>
              <Button variant="outline">외곽선</Button>
            </div>
          </div>
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">크기별</p>
            <div className="flex items-end gap-3">
              <Button size="sm">작게</Button>
              <Button size="md">보통</Button>
              <Button size="lg">크게</Button>
            </div>
          </div>
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">상태별</p>
            <div className="flex flex-wrap gap-3">
              <Button>기본 상태</Button>
              <Button disabled>비활성화</Button>
              <Button loading>로딩 중</Button>
              <Button icon={<PlusIcon />}>아이콘 포함</Button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">전체 너비</p>
            <div className="max-w-md">
              <Button fullWidth size="lg">결제하기</Button>
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Icon Preview ─── */
function IconPreview() {
  const iconNames = [
    'plus', 'minus', 'close', 'check', 'search',
    'back', 'forward', 'up', 'down', 'menu',
    'home', 'settings', 'print', 'cart', 'trash',
    'edit', 'refresh', 'user', 'bell', 'wifi', 'wifi-off',
  ];
  const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];

  return (
    <div className="space-y-6">
      {/* 전체 아이콘 목록 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">전체 아이콘 (기본 크기)</p>
        <div className="flex flex-wrap gap-4">
          {iconNames.map((name) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50">
                <Icon name={name} size="md" />
              </div>
              <span className="text-2xs text-gray-400 font-mono">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 크기 비교 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">크기 비교</p>
        <div className="flex items-end gap-6">
          {sizes.map((size) => (
            <div key={size} className="flex flex-col items-center gap-1.5">
              <Icon name="home" size={size} />
              <span className="text-2xs text-gray-400">{size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 색상 변형 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">색상 변형</p>
        <div className="flex items-center gap-5">
          <Icon name="check" size="lg" color="text-pos-success" />
          <Icon name="close" size="lg" color="text-pos-error" />
          <Icon name="bell" size="lg" color="text-primary-500" />
          <Icon name="settings" size="lg" color="text-pos-text-muted" />
        </div>
      </div>
    </div>
  );
}

/* ─── TextInput Preview ─── */
function TextInputPreview() {
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('홍길동');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-4 max-w-md">
            <TextInput label="고객명" placeholder="이름을 입력하세요" value={v1} onChange={setV1} />
            <TextInput label="고객명 (입력됨)" placeholder="이름을 입력하세요" value={v2} onChange={setV2} />
            <TextInput label="전화번호 (에러)" placeholder="010-0000-0000" value="abc" onChange={noop} error="올바른 전화번호를 입력해주세요" />
            <TextInput label="비활성화" placeholder="입력 불가" value="" onChange={noop} disabled />
            <TextInput label="전체 너비" placeholder="메모를 입력하세요" value="" onChange={noop} fullWidth />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── NumberInput Preview ─── */
function NumberInputPreview() {
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('5');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-4 max-w-md">
            <NumberInput label="수량" placeholder="0" value={v1} onChange={setV1} />
            <NumberInput label="수량 (입력됨)" placeholder="0" value={v2} onChange={setV2} />
            <NumberInput label="금액 (에러)" placeholder="0" value="abc" onChange={noop} error="숫자만 입력 가능합니다" />
            <NumberInput label="비활성화" placeholder="0" value="" onChange={noop} disabled />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Label Preview ─── */
function LabelPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">크기별</p>
        <div className="flex flex-col gap-2">
          <Label size="xs">xs: 김치찌개 150,000원</Label>
          <Label size="sm">sm: 김치찌개 150,000원</Label>
          <Label size="md">md: 김치찌개 150,000원</Label>
          <Label size="lg">lg: 김치찌개 150,000원</Label>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">굵기별</p>
        <div className="flex flex-col gap-2">
          <Label weight="regular">regular: 주문 내역</Label>
          <Label weight="medium">medium: 주문 내역</Label>
          <Label weight="semibold">semibold: 주문 내역</Label>
          <Label weight="bold">bold: 주문 내역</Label>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">색상별</p>
        <div className="flex flex-wrap gap-3">
          <Label color="default">기본</Label>
          <Label color="secondary">보조</Label>
          <Label color="muted">비활성</Label>
          <Label color="primary">주요</Label>
          <Label color="success">성공</Label>
          <Label color="error">오류</Label>
          <Label color="warning">경고</Label>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">말줄임</p>
        <div className="w-40">
          <Label truncate>아주 긴 메뉴 이름입니다 예를들어 스페셜 김치찌개 세트</Label>
        </div>
      </div>
    </div>
  );
}

/* ─── Badge Preview ─── */
function BadgePreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">변형별</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">기본</Badge>
              <Badge variant="primary">주문접수</Badge>
              <Badge variant="success">결제완료</Badge>
              <Badge variant="warning">대기중</Badge>
              <Badge variant="error">취소</Badge>
              <Badge variant="info">배달중</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">크기별</p>
            <div className="flex items-center gap-3">
              <Badge size="sm" variant="primary">sm</Badge>
              <Badge size="md" variant="primary">md</Badge>
              <Badge size="sm" variant="error">3</Badge>
              <Badge size="md" variant="success">완료</Badge>
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Checkbox Preview ─── */
function CheckboxPreview() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-3">
            <Checkbox checked={checked1} onChange={setChecked1} label="영수증 출력" />
            <Checkbox checked={checked2} onChange={setChecked2} label="포인트 적립" />
            <Checkbox checked={false} onChange={noop} label="비활성화 (미선택)" disabled />
            <Checkbox checked={true} onChange={noop} label="비활성화 (선택됨)" disabled />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Radio Preview ─── */
function RadioPreview() {
  const [selected, setSelected] = useState('card');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-3">
            <Radio checked={selected === 'cash'} onChange={() => setSelected('cash')} label="현금 결제" name={`pay-${concept.id}`} />
            <Radio checked={selected === 'card'} onChange={() => setSelected('card')} label="카드 결제" name={`pay-${concept.id}`} />
            <Radio checked={selected === 'point'} onChange={() => setSelected('point')} label="포인트 결제" name={`pay-${concept.id}`} />
            <Radio checked={false} onChange={noop} label="비활성화" disabled name={`pay-${concept.id}`} />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Toggle Preview ─── */
function TogglePreview() {
  const [t1, setT1] = useState(false);
  const [t2, setT2] = useState(true);
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-4">
            <Toggle checked={t1} onChange={setT1} label="자동 인쇄" />
            <Toggle checked={t2} onChange={setT2} label="소리 알림" />
            <Toggle checked={false} onChange={noop} label="비활성화 (꺼짐)" disabled />
            <Toggle checked={true} onChange={noop} label="비활성화 (켜짐)" disabled />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Spinner Preview ─── */
function SpinnerPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">크기별</p>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="sm" />
            <span className="text-2xs text-gray-400">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span className="text-2xs text-gray-400">md</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <span className="text-2xs text-gray-400">lg</span>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">색상별</p>
        <div className="flex items-center gap-6">
          <div className="text-primary-500"><Spinner size="md" /></div>
          <div className="text-pos-success"><Spinner size="md" /></div>
          <div className="text-pos-error"><Spinner size="md" /></div>
          <div className="text-gray-400"><Spinner size="md" /></div>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton Preview ─── */
function SkeletonPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">기본 형태</p>
        <div className="flex flex-col gap-3 max-w-md">
          <Skeleton width="100%" height="1rem" />
          <Skeleton width="80%" height="1rem" />
          <Skeleton width="60%" height="1rem" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">모서리 변형</p>
        <div className="flex gap-4">
          <Skeleton width="80px" height="80px" rounded="sm" />
          <Skeleton width="80px" height="80px" rounded="md" />
          <Skeleton width="80px" height="80px" rounded="lg" />
          <Skeleton width="80px" height="80px" rounded="full" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">카드 스켈레톤</p>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 p-3 border border-gray-100 rounded-lg w-[140px]">
              <Skeleton width="100%" height="80px" rounded="md" />
              <Skeleton width="70%" height="0.75rem" />
              <Skeleton width="50%" height="0.75rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Divider Preview ─── */
function DividerPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">수평 구분선 (간격별)</p>
        <div className="max-w-md bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">첫 번째 섹션</p>
          <Divider spacing="sm" />
          <p className="text-sm text-gray-600">sm 간격</p>
          <Divider spacing="md" />
          <p className="text-sm text-gray-600">md 간격</p>
          <Divider spacing="lg" />
          <p className="text-sm text-gray-600">lg 간격</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">수직 구분선</p>
        <div className="flex items-center h-10 gap-0 bg-gray-50 p-4 rounded-lg">
          <span className="text-sm text-gray-600">테이블</span>
          <Divider orientation="vertical" spacing="md" />
          <span className="text-sm text-gray-600">주문</span>
          <Divider orientation="vertical" spacing="md" />
          <span className="text-sm text-gray-600">결제</span>
        </div>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   Molecule Previews
   ════════════════════════════════════════════════════════════════ */

/* ─── NumPad Preview ─── */
function NumPadPreview() {
  const [display, setDisplay] = useState('');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="max-w-[280px]">
            <div className="mb-3 h-touch px-4 flex items-center justify-end bg-gray-50 rounded-lg border border-gray-200">
              <span className="font-mono tabular-nums font-bold text-xl text-pos-text select-none">
                {display || '0'}
              </span>
            </div>
            <NumPad
              onInput={(key) => setDisplay((p) => p + key)}
              onConfirm={noop}
              onClear={() => setDisplay('')}
              onBackspace={() => setDisplay((p) => p.slice(0, -1))}
            />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── AmountInput Preview ─── */
function AmountInputPreview() {
  const [val, setVal] = useState(490000);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">크기별</p>
        <div className="flex flex-col gap-3">
          <AmountInput value={150000} currency="₫" size="md" />
          <AmountInput value={490000} currency="₫" size="lg" />
          <AmountInput value={1635000} currency="₫" size="xl" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">통화별</p>
        <div className="flex flex-col gap-3">
          <AmountInput value={150000} currency="₫" size="lg" />
          <AmountInput value={15000} currency="₩" size="lg" />
          <AmountInput value={12} currency="$" size="lg" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">편집 가능</p>
        <div className="max-w-xs">
          <AmountInput value={val} currency="₫" size="lg" onChange={setVal} />
        </div>
      </div>
    </div>
  );
}

/* ─── Stepper Preview ─── */
function StepperPreview() {
  const [v1, setV1] = useState(1);
  const [v2, setV2] = useState(0);
  const [v3, setV3] = useState(5);
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-28">김치찌개</span>
              <Stepper value={v1} onChange={setV1} min={0} max={99} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-28">제육볶음 (0)</span>
              <Stepper value={v2} onChange={setV2} min={0} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-28">콜라 (최대 10)</span>
              <Stepper value={v3} onChange={setV3} min={0} max={10} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-28">비활성화</span>
              <Stepper value={3} onChange={noop} disabled />
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── SearchBar Preview ─── */
function SearchBarPreview() {
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('김치');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-4 max-w-md">
            <SearchBar value={q1} onChange={setQ1} placeholder="메뉴를 검색하세요" />
            <SearchBar value={q2} onChange={setQ2} placeholder="메뉴를 검색하세요" onClear={() => setQ2('')} />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── FormField Preview ─── */
function FormFieldPreview() {
  const [name, setName] = useState('');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-4 max-w-md">
            <FormField label="고객 이름" required>
              <TextInput value={name} onChange={setName} placeholder="이름을 입력하세요" fullWidth />
            </FormField>
            <FormField label="전화번호" required error="올바른 전화번호를 입력해주세요">
              <TextInput value="abc" onChange={noop} placeholder="010-0000-0000" fullWidth error="올바른 전화번호를 입력해주세요" />
            </FormField>
            <FormField label="메모">
              <TextInput value="" onChange={noop} placeholder="주문 메모 (선택)" fullWidth />
            </FormField>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Toast Preview ─── */
function ToastPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">유형별 (인라인 표시)</p>
        <div className="flex flex-col gap-3 relative" style={{ minHeight: 200 }}>
          <div className="relative flex items-center gap-2.5 px-5 py-3 rounded-lg shadow-md bg-green-600 text-white select-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="text-md font-medium">결제가 완료되었습니다</span>
          </div>
          <div className="relative flex items-center gap-2.5 px-5 py-3 rounded-lg shadow-md bg-red-500 text-white select-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span className="text-md font-medium">카드 승인에 실패했습니다</span>
          </div>
          <div className="relative flex items-center gap-2.5 px-5 py-3 rounded-lg shadow-md bg-yellow-400 text-gray-900 select-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6v4M10 13v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span className="text-md font-medium">프린터 용지가 부족합니다</span>
          </div>
          <div className="relative flex items-center gap-2.5 px-5 py-3 rounded-lg shadow-md bg-blue-500 text-white select-none">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="1" fill="currentColor" /><path d="M10 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span className="text-md font-medium">새 주문이 접수되었습니다</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400">Toast 컴포넌트는 visible 상태에서 화면 하단에 고정 표시됩니다. 위 예시는 인라인으로 유형별 스타일을 보여줍니다.</p>
    </div>
  );
}

/* ─── Alert Preview ─── */
function AlertPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-3 max-w-lg">
            <Alert type="success" title="결제 완료" message="490,000원이 정상적으로 결제되었습니다." onClose={noop} />
            <Alert type="error" title="승인 실패" message="카드사 응답 시간이 초과되었습니다. 다시 시도해주세요." onClose={noop} />
            <Alert type="warning" message="프린터 용지가 부족합니다. 교체해주세요." onClose={noop} />
            <Alert type="info" message="시스템 점검 예정: 2026-04-05 02:00 ~ 04:00" />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Tabs Preview ─── */
function TabsPreview() {
  const [active, setActive] = useState<Record<string, string>>(
    Object.fromEntries(concepts.map((c) => [c.id, 'tab1']))
  );
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="max-w-lg">
            <Tabs
              tabs={mockTabItems}
              activeId={active[concept.id]}
              onSelect={(id) => setActive((prev) => ({ ...prev, [concept.id]: id }))}
            />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Dropdown Preview ─── */
function DropdownPreview() {
  const [val, setVal] = useState('');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-4 max-w-xs">
            <div>
              <p className="text-xs text-gray-400 mb-2">기본</p>
              <Dropdown options={mockDropdownOptions} value={val} onChange={setVal} placeholder="결제 수단 선택" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">비활성화</p>
              <Dropdown options={mockDropdownOptions} value="card" onChange={noop} disabled />
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Chip Preview ─── */
function ChipPreview() {
  const [selected, setSelected] = useState<Record<string, boolean>>({ C1: true, C3: true });
  const chipItems = ['전체', '찌개류', '구이류', '밥류', '면류', '음료'];
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-wrap gap-2">
            {chipItems.map((label, idx) => {
              const key = `C${idx}`;
              return (
                <Chip
                  key={key}
                  label={label}
                  selected={!!selected[key]}
                  onToggle={() => setSelected((prev) => ({ ...prev, [key]: !prev[key] }))}
                />
              );
            })}
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── DatePicker Preview ─── */
function DatePickerPreview() {
  const [date, setDate] = useState('2026-04-04');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <DatePicker value={date} onChange={setDate} />
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── ProgressBar Preview ─── */
function ProgressBarPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-5 max-w-md">
            <ProgressBar value={25} label="동기화 진행" showPercent variant="default" />
            <ProgressBar value={70} label="데이터 전송" showPercent variant="success" />
            <ProgressBar value={45} label="처리 중" showPercent variant="warning" />
            <ProgressBar value={90} label="오류 발생" showPercent variant="error" />
            <ProgressBar value={100} label="완료" showPercent variant="success" />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   Organism Previews
   ════════════════════════════════════════════════════════════════ */

/* ─── TableCard Preview ─── */
function TableCardPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex gap-5 items-start">
            {Object.entries(mockTables).map(([key, table]) => (
              <div key={key} className="flex flex-col items-center gap-3">
                <div className="w-[200px] h-[170px]">
                  <TableCard table={table} onClick={noop} />
                </div>
                <span className="text-2xs text-gray-400 font-medium tracking-wide">{{ empty: '빈 테이블', occupied: '사용 중', paying: '결제 중' }[key] || key}</span>
              </div>
            ))}
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── MenuCard Preview ─── */
function MenuCardPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex gap-5 items-start">
            {Object.entries(mockMenus).map(([key, menu]) => (
              <div key={key} className="flex flex-col items-center gap-3">
                <div className="w-[140px] h-[170px]">
                  <MenuCard menu={menu} onAdd={noop} />
                </div>
                <span className="text-2xs text-gray-400 font-medium">
                  {key === 'normal' ? '일반' : '품절'}
                </span>
              </div>
            ))}
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── TakeoutBar Preview ─── */
function TakeoutBarPreview() {
  const [tabs, setTabs] = useState<Record<string, string>>(
    Object.fromEntries(concepts.map((c) => [c.id, 'hall']))
  );
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="w-full max-w-[640px]">
            <TakeoutBar
              activeTab={tabs[concept.id]}
              onTabSelect={(id) => setTabs((prev) => ({ ...prev, [concept.id]: id }))}
              counts={{ takeout: 1, delivery: 3 }}
            />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── OrderSidebar Preview ─── */
function OrderSidebarPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex gap-6 h-[480px]">
            <div className="flex flex-col items-center gap-2">
              <OrderSidebar orderItems={[]} totalAmount={0} onCheckout={noop} isLoading={false} onScrollUp={noop} onScrollDown={noop} />
              <span className="text-2xs text-gray-400">비어있음</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <OrderSidebar orderItems={mockOrder} totalAmount={490000} onCheckout={noop} isLoading={false} onScrollUp={noop} onScrollDown={noop} />
              <span className="text-2xs text-gray-400">주문 있음</span>
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Header Preview ─── */
function HeaderPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-4">
            <Header title="테이블 관리" subtitle="1층 - 12개 테이블" />
            <Header title="주문 화면" onBack={noop} />
            <Header
              title="결제"
              subtitle="3번 테이블"
              onBack={noop}
              rightActions={
                <Button size="sm" variant="ghost">
                  <Icon name="print" size="sm" />
                </Button>
              }
            />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── NavigationBar Preview ─── */
function NavigationBarPreview() {
  const [activeH, setActiveH] = useState('table');
  const [activeV, setActiveV] = useState('order');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs text-gray-400 mb-2">수평 네비게이션</p>
              <NavigationBar items={mockNavItems} activeId={activeH} onSelect={setActiveH} direction="horizontal" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">수직 네비게이션</p>
              <div className="h-[200px]">
                <NavigationBar items={mockNavItems} activeId={activeV} onSelect={setActiveV} direction="vertical" />
              </div>
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── CategoryBar Preview ─── */
function CategoryBarPreview() {
  const [active, setActive] = useState('C1');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="w-full max-w-[640px]">
            <CategoryBar categories={mockCategories} activeId={active} onSelect={setActive} />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── MenuGrid Preview ─── */
function MenuGridPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="h-[420px] border border-gray-200 rounded-lg overflow-hidden">
            <MenuGrid
              items={mockMenuItems}
              onAdd={noop}
              columns={4}
              rows={2}
              page={1}
              totalPages={2}
              onPageUp={noop}
              onPageDown={noop}
            />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── OrderItemList Preview ─── */
function OrderItemListPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex gap-5">
            <div className="w-[280px] h-[300px] border border-gray-200 rounded-lg overflow-hidden">
              <p className="text-2xs text-gray-400 px-3 pt-2 pb-1">비어있음</p>
              <OrderItemList items={[]} onQuantityChange={noop} onRemove={noop} />
            </div>
            <div className="w-[280px] h-[300px] border border-gray-200 rounded-lg overflow-hidden">
              <p className="text-2xs text-gray-400 px-3 pt-2 pb-1">주문 있음</p>
              <OrderItemList
                items={[
                  { name: '김치찌개', price: 150000, quantity: 2 },
                  { name: '제육볶음', price: 190000, quantity: 1 },
                  { name: '콜라',     price: 30000,  quantity: 3 },
                  { name: '비빔밥',   price: 120000, quantity: 1 },
                ]}
                onQuantityChange={noop}
                onRemove={noop}
              />
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── TableGrid Preview ─── */
function TableGridPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="h-[380px] border border-gray-200 rounded-lg overflow-hidden">
            <TableGrid tables={mockTableGrid} onSelect={noop} columns={4} />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── FloorSelector Preview ─── */
function FloorSelectorPreview() {
  const [active, setActive] = useState('F1');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <FloorSelector floors={mockFloors} activeId={active} onSelect={setActive} />
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── PaymentMethodSelector Preview ─── */
function PaymentMethodSelectorPreview() {
  const [selected, setSelected] = useState('card');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="max-w-[320px]">
            <PaymentMethodSelector selectedId={selected} onSelect={setSelected} />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── KeypadPanel Preview ─── */
function KeypadPanelPreview() {
  const [display, setDisplay] = useState('');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="max-w-[280px]">
            <KeypadPanel
              display={display}
              onInput={(key) => setDisplay((p) => p + key)}
              onConfirm={noop}
              onClear={() => setDisplay('')}
              onBackspace={() => setDisplay((p) => p.slice(0, -1))}
            />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── SummaryPanel Preview ─── */
function SummaryPanelPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex gap-5">
            <div className="w-[280px]">
              <p className="text-2xs text-gray-400 mb-2">기본</p>
              <SummaryPanel subtotal={490000} total={490000} />
            </div>
            <div className="w-[280px]">
              <p className="text-2xs text-gray-400 mb-2">할인 + 세금 + 봉사료</p>
              <SummaryPanel subtotal={490000} discount={50000} tax={44000} serviceCharge={22000} total={506000} />
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── Modal Preview ─── */
function ModalPreview() {
  const [openSm, setOpenSm] = useState(false);
  const [openMd, setOpenMd] = useState(false);
  const [openLg, setOpenLg] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">크기별 (클릭하여 열기)</p>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" onClick={() => setOpenSm(true)}>작은 모달 (sm)</Button>
          <Button size="sm" variant="outline" onClick={() => setOpenMd(true)}>중간 모달 (md)</Button>
          <Button size="sm" variant="outline" onClick={() => setOpenLg(true)}>큰 모달 (lg)</Button>
        </div>
      </div>
      <Modal open={openSm} onClose={() => setOpenSm(false)} title="알림" size="sm">
        <p className="text-sm text-gray-600">주문이 정상적으로 접수되었습니다.</p>
      </Modal>
      <Modal open={openMd} onClose={() => setOpenMd(false)} title="주문 상세" size="md" footer={
        <>
          <Button variant="secondary" onClick={() => setOpenMd(false)}>닫기</Button>
          <Button variant="primary" onClick={() => setOpenMd(false)}>확인</Button>
        </>
      }>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">3번 테이블 주문 내역</p>
          <div className="flex justify-between text-sm"><span>김치찌개 x2</span><span>300,000₫</span></div>
          <div className="flex justify-between text-sm"><span>제육볶음 x1</span><span>190,000₫</span></div>
          <div className="border-t pt-2 flex justify-between font-bold"><span>합계</span><span>490,000₫</span></div>
        </div>
      </Modal>
      <Modal open={openLg} onClose={() => setOpenLg(false)} title="영업 일보" size="lg">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">2026-04-04 영업 요약</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">총 매출</p><p className="text-lg font-bold">12,450,000₫</p></div>
            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">주문 건수</p><p className="text-lg font-bold">47건</p></div>
            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">카드 결제</p><p className="text-lg font-bold">8,200,000₫</p></div>
            <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">현금 결제</p><p className="text-lg font-bold">4,250,000₫</p></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─── ConfirmDialog Preview ─── */
function ConfirmDialogPreview() {
  const [openDefault, setOpenDefault] = useState(false);
  const [openDanger, setOpenDanger] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">변형별 (클릭하여 열기)</p>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" onClick={() => setOpenDefault(true)}>기본 확인</Button>
          <Button size="sm" variant="danger" onClick={() => setOpenDanger(true)}>위험 확인</Button>
        </div>
      </div>
      <ConfirmDialog
        open={openDefault}
        title="주문 확인"
        message="3번 테이블 주문을 접수하시겠습니까? 총 금액은 490,000₫입니다."
        confirmLabel="주문 접수"
        cancelLabel="취소"
        onConfirm={() => setOpenDefault(false)}
        onCancel={() => setOpenDefault(false)}
      />
      <ConfirmDialog
        open={openDanger}
        title="주문 취소"
        message="이 주문을 취소하면 복구할 수 없습니다. 정말 취소하시겠습니까?"
        confirmLabel="주문 취소"
        cancelLabel="돌아가기"
        variant="danger"
        onConfirm={() => setOpenDanger(false)}
        onCancel={() => setOpenDanger(false)}
      />
    </div>
  );
}

/* ─── Drawer Preview ─── */
function DrawerPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">클릭하여 열기</p>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>주문 상세 패널 열기</Button>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="주문 상세" width={360}>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">테이블</p>
            <p className="text-md font-bold">3번 테이블</p>
          </div>
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm"><span>김치찌개 x2</span><span className="tabular-nums">300,000₫</span></div>
            <div className="flex justify-between text-sm"><span>제육볶음 x1</span><span className="tabular-nums">190,000₫</span></div>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold"><span>합계</span><span className="tabular-nums">490,000₫</span></div>
          <Button fullWidth size="lg">결제 진행</Button>
        </div>
      </Drawer>
    </div>
  );
}

/* ─── ReceiptPreview Preview ─── */
function ReceiptPreviewPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <ReceiptPreview
            storeName="효정 레스토랑 1호점"
            items={mockReceiptItems}
            subtotal={490000}
            discount={50000}
            tax={44000}
            total={484000}
            receiptNo="2026-0404-0042"
            date="2026-04-04 14:32"
            onPrint={noop}
          />
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── CustomerInfoPanel Preview ─── */
function CustomerInfoPanelPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex flex-col gap-4 max-w-sm">
            <div>
              <p className="text-2xs text-gray-400 mb-2">고객 정보 없음</p>
              <CustomerInfoPanel onSearch={noop} />
            </div>
            <div>
              <p className="text-2xs text-gray-400 mb-2">고객 정보 있음</p>
              <CustomerInfoPanel
                customer={{ name: '김민수', phone: '010-1234-5678', address: '서울시 강남구 역삼동 123-45', points: 15200 }}
                onEdit={noop}
              />
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── EmployeeSelector Preview ─── */
function EmployeeSelectorPreview() {
  const [selected, setSelected] = useState('E1');
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="max-w-[360px]">
            <EmployeeSelector employees={mockEmployees} selectedId={selected} onSelect={setSelected} />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── DeviceStatus Preview ─── */
function DeviceStatusPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">전체 연결됨</p>
        <DeviceStatus devices={mockDevices.map((d) => ({ ...d, connected: true }))} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">일부 연결 끊김</p>
        <DeviceStatus devices={mockDevices} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">전체 연결 끊김</p>
        <DeviceStatus devices={mockDevices.map((d) => ({ ...d, connected: false }))} />
      </div>
    </div>
  );
}

/* ─── KitchenDisplay Preview ─── */
function KitchenDisplayPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <KitchenDisplay orders={mockKitchenOrders} onStatusChange={noop} />
        </ConceptSection>
      ))}
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   Specialized (POS 전용) Previews
   ════════════════════════════════════════════════════════════════ */

/* ─── OptionSelector Preview ─── */
function OptionSelectorPreview() {
  const [selected, setSelected] = useState<Record<string, string[]>>({ '맵기 선택': ['O2'] });
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="max-w-sm">
            <OptionSelector groups={mockOptionGroups} selected={selected} onChange={setSelected} />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── PaymentStatus Preview ─── */
function PaymentStatusPreview() {
  const statuses: Array<{ status: '대기' | '승인중' | '승인완료' | '거절됨' | '오류'; msg: string }> = [
    { status: '대기',     msg: '카드를 리더기에 삽입해주세요' },
    { status: '승인중',   msg: '카드사 승인 요청 중...' },
    { status: '승인완료', msg: '490,000원 결제가 완료되었습니다' },
    { status: '거절됨',   msg: '잔액이 부족합니다' },
    { status: '오류',     msg: '카드리더기 연결이 끊어졌습니다' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {statuses.map(({ status, msg }) => (
          <div key={status} className="h-[260px] border border-gray-200 rounded-lg overflow-hidden">
            <PaymentStatus status={status} message={msg} onRetry={status === '거절됨' || status === '오류' ? noop : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ChangeCalculator Preview ─── */
function ChangeCalculatorPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="flex gap-5">
            <div className="w-[260px]">
              <p className="text-2xs text-gray-400 mb-2">거스름돈 있음</p>
              <ChangeCalculator totalAmount={490000} receivedAmount={500000} />
            </div>
            <div className="w-[260px]">
              <p className="text-2xs text-gray-400 mb-2">정확히 일치</p>
              <ChangeCalculator totalAmount={490000} receivedAmount={490000} />
            </div>
            <div className="w-[260px]">
              <p className="text-2xs text-gray-400 mb-2">부족</p>
              <ChangeCalculator totalAmount={490000} receivedAmount={400000} />
            </div>
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── DiscountCalculator Preview ─── */
function DiscountCalculatorPreview() {
  return (
    <div className="space-y-6">
      {concepts.map((concept) => (
        <ConceptSection key={concept.id} concept={concept}>
          <div className="max-w-[300px]">
            <DiscountCalculator originalAmount={490000} onApply={noop} />
          </div>
        </ConceptSection>
      ))}
    </div>
  );
}

/* ─── QRCodeDisplay Preview ─── */
function QRCodeDisplayPreview() {
  return (
    <div className="space-y-6">
      <div className="flex gap-8">
        <QRCodeDisplay data="https://pay.example.com/order/0042" size={180} label="결제 QR 코드" />
        <QRCodeDisplay data="https://pay.example.com/order/0043" size={140} label="소형 QR" />
      </div>
    </div>
  );
}

/* ─── SignaturePad Preview ─── */
function SignaturePadPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">서명 캡처</p>
        <div className="max-w-[340px]">
          <SignaturePad onSave={noop} onClear={noop} width={320} height={180} />
        </div>
      </div>
    </div>
  );
}

/* ─── ErrorRecovery Preview ─── */
function ErrorRecoveryPreview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5">
        <ErrorRecovery
          errorCode="ERR_CARD_001"
          errorMessage="카드 리더기 응답 시간이 초과되었습니다"
          suggestions={[
            '카드 리더기 케이블 연결 상태를 확인하세요',
            '카드 리더기를 재시작하세요',
            '문제가 지속되면 관리자에게 문의하세요',
          ]}
          onRetry={noop}
          onCancel={noop}
        />
        <ErrorRecovery
          errorCode="ERR_NET_002"
          errorMessage="서버에 연결할 수 없습니다"
          suggestions={[
            '네트워크 연결 상태를 확인하세요',
            '잠시 후 다시 시도하세요',
          ]}
          onRetry={noop}
        />
      </div>
    </div>
  );
}

/* ─── VoidReceipt Preview ─── */
function VoidReceiptPreview() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <VoidReceipt
          receipt={mockVoidReceipt}
          onConfirm={noop}
          onCancel={noop}
        />
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   Template Previews
   ════════════════════════════════════════════════════════════════ */

/* ─── POSMainLayout Preview ─── */
function POSMainLayoutPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">기본 레이아웃 (축소 표시)</p>
        <div className="w-[640px] h-[480px] border border-gray-200 rounded-lg overflow-hidden" style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
          <POSMainLayout
            header={
              <div className="h-12 bg-gray-100 border-b flex items-center px-4">
                <span className="text-sm font-bold">효정 레스토랑 POS</span>
                <div className="ml-auto flex gap-2">
                  <span className="text-2xs text-gray-400">2026-04-04 14:32</span>
                </div>
              </div>
            }
            content={
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <span className="text-sm text-gray-400">메인 콘텐츠 영역</span>
              </div>
            }
            sidebar={
              <div className="w-[200px] h-full bg-white border-l flex flex-col items-center justify-center">
                <span className="text-sm text-gray-400">사이드바</span>
              </div>
            }
            footer={
              <div className="h-10 bg-gray-100 border-t flex items-center justify-center">
                <span className="text-2xs text-gray-400">상태 바</span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ─── SplitPanelLayout Preview ─── */
function SplitPanelLayoutPreview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">좌우 분할 (1fr + 300px)</p>
        <div className="w-[640px] h-[360px] border border-gray-200 rounded-lg overflow-hidden">
          <SplitPanelLayout
            left={
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <span className="text-sm text-gray-400">왼쪽 패널 (메뉴 / 테이블)</span>
              </div>
            }
            right={
              <div className="w-full h-full bg-white flex items-center justify-center">
                <span className="text-sm text-gray-400">오른쪽 패널 (주문 / 결제)</span>
              </div>
            }
          />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">커스텀 비율 (2fr + 1fr)</p>
        <div className="w-[640px] h-[360px] border border-gray-200 rounded-lg overflow-hidden">
          <SplitPanelLayout
            left={
              <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                <span className="text-sm text-blue-400">넓은 왼쪽</span>
              </div>
            }
            right={
              <div className="w-full h-full bg-purple-50 flex items-center justify-center">
                <span className="text-sm text-purple-400">좁은 오른쪽</span>
              </div>
            }
            leftWidth="2fr"
            rightWidth="1fr"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── FullScreenModal Preview ─── */
function FullScreenModalPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 tracking-wider mb-3">클릭하여 열기</p>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>전체 화면 모달 열기</Button>
      </div>
      <FullScreenModal open={open} onClose={() => setOpen(false)}>
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <span className="text-xl font-bold text-gray-700">전체 화면 모달</span>
          <p className="text-sm text-gray-400">결제 상세, 영수증 전체보기 등에 사용합니다</p>
          <Button variant="primary" onClick={() => setOpen(false)}>닫기</Button>
        </div>
      </FullScreenModal>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   Component Registry
   ════════════════════════════════════════════════════════════════ */

const previewRegistry: Record<string, { title: string; desc: string; render: () => React.ReactNode }> = {
  /* ── Atoms ── */
  'button':           { title: '버튼',           desc: 'POS 기본 버튼. 유형 / 크기 / 상태 조합',                   render: () => <ButtonPreview /> },
  'icon':             { title: '아이콘',          desc: 'SVG 아이콘 래퍼. 크기 / 색상 / 전체 목록',                 render: () => <IconPreview /> },
  'text-input':       { title: '텍스트 입력',     desc: '텍스트 입력 필드. 라벨 / 에러 / 비활성화',                 render: () => <TextInputPreview /> },
  'number-input':     { title: '숫자 입력',       desc: '숫자 전용 입력 필드. 필터링 / 에러 / 비활성화',            render: () => <NumberInputPreview /> },
  'label':            { title: '레이블',          desc: '텍스트 레이블. 크기 / 굵기 / 색상 / 말줄임',              render: () => <LabelPreview /> },
  'badge':            { title: '배지',            desc: '상태 배지. 변형 / 크기',                                  render: () => <BadgePreview /> },
  'checkbox':         { title: '체크박스',        desc: '체크박스. 선택 / 비활성화 상태',                           render: () => <CheckboxPreview /> },
  'radio':            { title: '라디오',          desc: '라디오 버튼. 결제 수단 선택 등',                           render: () => <RadioPreview /> },
  'toggle':           { title: '토글',            desc: '토글 스위치. 설정 켜기/끄기',                             render: () => <TogglePreview /> },
  'spinner':          { title: '스피너',          desc: '로딩 스피너. 크기 / 색상',                                render: () => <SpinnerPreview /> },
  'skeleton':         { title: '스켈레톤',        desc: '스켈레톤 로더. 형태 / 모서리 / 카드 스켈레톤',            render: () => <SkeletonPreview /> },
  'divider':          { title: '구분선',          desc: '수평/수직 구분선. 간격별',                                render: () => <DividerPreview /> },

  /* ── Molecules ── */
  'numpad':           { title: '숫자 키패드',     desc: 'POS 4x4 숫자 키패드. 금액/수량 입력',                     render: () => <NumPadPreview /> },
  'amount-input':     { title: '금액 표시',       desc: '통화 금액 표시. 크기 / 통화 / 편집 모드',                 render: () => <AmountInputPreview /> },
  'stepper':          { title: '수량 조절',       desc: '+/- 수량 조절 컴포넌트',                                  render: () => <StepperPreview /> },
  'search-bar':       { title: '검색바',          desc: '검색 입력 바. 초기화 버튼 포함',                          render: () => <SearchBarPreview /> },
  'form-field':       { title: '폼 필드',         desc: '라벨 + 입력 + 에러 래퍼',                                 render: () => <FormFieldPreview /> },
  'toast':            { title: '토스트',          desc: '하단 알림 토스트. 유형별 스타일',                         render: () => <ToastPreview /> },
  'alert':            { title: '알림',            desc: '인라인 알림 블록. 성공 / 오류 / 경고 / 정보',            render: () => <AlertPreview /> },
  'tabs':             { title: '탭',              desc: '수평 탭 네비게이션',                                      render: () => <TabsPreview /> },
  'dropdown':         { title: '드롭다운',        desc: '선택 드롭다운. 터치 환경 최적화',                         render: () => <DropdownPreview /> },
  'chip':             { title: '칩',              desc: '필터 칩. 카테고리 필터 / 태그 선택',                      render: () => <ChipPreview /> },
  'date-picker':      { title: '날짜 선택기',     desc: '캘린더 그리드 날짜 선택',                                 render: () => <DatePickerPreview /> },
  'progress-bar':     { title: '진행 표시기',     desc: '수평 진행 바. 변형 / 퍼센트 표시',                        render: () => <ProgressBarPreview /> },

  /* ── Organisms ── */
  'table-card':       { title: '테이블 카드',     desc: '테이블 상태를 표시하는 카드 (빈 테이블 / 사용 중 / 결제 중)', render: () => <TableCardPreview /> },
  'menu-card':        { title: '메뉴 카드',       desc: '메뉴 이미지 + 이름 + 가격 표시 카드',                     render: () => <MenuCardPreview /> },
  'order-sidebar':    { title: '주문 사이드바',    desc: '주문 내역 목록 + 합계 + 결제 버튼',                       render: () => <OrderSidebarPreview /> },
  'takeout-bar':      { title: '포장/배달 탭',    desc: '홀 / 포장 / 배달 전환 탭 바',                             render: () => <TakeoutBarPreview /> },
  'header':           { title: '헤더',            desc: 'POS 상단 헤더. 뒤로가기 / 제목 / 우측 액션',             render: () => <HeaderPreview /> },
  'navigation-bar':   { title: '네비게이션 바',    desc: '수평/수직 네비게이션 바',                                 render: () => <NavigationBarPreview /> },
  'category-bar':     { title: '카테고리 바',     desc: '메뉴 카테고리 스크롤 바',                                 render: () => <CategoryBarPreview /> },
  'menu-grid':        { title: '메뉴 그리드',     desc: '메뉴 카드 그리드 + 페이지네이션',                         render: () => <MenuGridPreview /> },
  'order-item-list':  { title: '주문 항목 목록',   desc: '주문 항목 목록. 수량 조절 / 삭제',                        render: () => <OrderItemListPreview /> },
  'table-grid':       { title: '테이블 그리드',    desc: '테이블 카드 그리드 레이아웃',                             render: () => <TableGridPreview /> },
  'floor-selector':   { title: '층 선택',         desc: '1층 / 2층 / 3층 / 테라스 전환',                          render: () => <FloorSelectorPreview /> },
  'payment-method-selector': { title: '결제 수단',  desc: '결제 수단 선택 그리드. 현금 / 카드 / 포인트 / 쿠폰',    render: () => <PaymentMethodSelectorPreview /> },
  'keypad-panel':     { title: '키패드 패널',     desc: '금액 표시 + 숫자 키패드 결합',                            render: () => <KeypadPanelPreview /> },
  'summary-panel':    { title: '합계 패널',       desc: '소계 / 할인 / 세금 / 봉사료 / 총합계',                   render: () => <SummaryPanelPreview /> },
  'modal':            { title: '모달',            desc: '중앙 모달 대화상자. 크기별',                              render: () => <ModalPreview /> },
  'confirm-dialog':   { title: '확인 대화상자',    desc: '기본 / 위험 확인 대화상자',                               render: () => <ConfirmDialogPreview /> },
  'drawer':           { title: '서랍',            desc: '오른쪽 슬라이드 패널',                                    render: () => <DrawerPreview /> },
  'receipt-preview':  { title: '영수증 미리보기',  desc: '열감지 영수증 스타일 미리보기',                           render: () => <ReceiptPreviewPreview /> },
  'customer-info-panel': { title: '고객 정보',    desc: '고객 이름 / 전화번호 / 주소 / 포인트',                   render: () => <CustomerInfoPanelPreview /> },
  'employee-selector': { title: '직원 선택',      desc: '직원 선택 그리드',                                        render: () => <EmployeeSelectorPreview /> },
  'device-status':    { title: '장치 상태',       desc: '장치 연결 상태 표시 바',                                  render: () => <DeviceStatusPreview /> },
  'kitchen-display':  { title: '주방 디스플레이',  desc: '주방 주문 카드 그리드. 대기 / 조리중 / 완료',             render: () => <KitchenDisplayPreview /> },

  /* ── POS Specialized ── */
  'option-selector':  { title: '옵션 선택기',     desc: '메뉴 옵션 그룹 선택. 필수/선택 / 추가금액',               render: () => <OptionSelectorPreview /> },
  'payment-status':   { title: '결제 상태',       desc: '결제 처리 상태 표시. 대기 / 승인중 / 완료 / 거절 / 오류',  render: () => <PaymentStatusPreview /> },
  'change-calculator': { title: '거스름돈 계산기', desc: '받을 금액 / 받은 금액 / 거스름돈 자동 계산',               render: () => <ChangeCalculatorPreview /> },
  'discount-calculator': { title: '할인 계산기',   desc: '금액/비율 할인 입력 + 실시간 미리보기',                    render: () => <DiscountCalculatorPreview /> },
  'qr-code-display':  { title: 'QR 코드',        desc: 'QR 코드 표시 플레이스홀더',                                render: () => <QRCodeDisplayPreview /> },
  'signature-pad':    { title: '서명 패드',       desc: '터치 서명 캡처 캔버스',                                   render: () => <SignaturePadPreview /> },
  'error-recovery':   { title: '오류 복구',       desc: '오류 코드 / 메시지 / 조치 안내 / 재시도',                 render: () => <ErrorRecoveryPreview /> },
  'void-receipt':     { title: '거래 취소',       desc: '영수증 요약 + 취소 사유 입력',                            render: () => <VoidReceiptPreview /> },

  /* ── Templates ── */
  'pos-main-layout':     { title: 'POS 메인 레이아웃', desc: '헤더 + 콘텐츠 + 사이드바 + 푸터 기본 구조',          render: () => <POSMainLayoutPreview /> },
  'split-panel-layout':  { title: '좌우 분할 레이아웃', desc: 'CSS Grid 기반 좌우 분할',                            render: () => <SplitPanelLayoutPreview /> },
  'fullscreen-modal':    { title: '전체 화면 모달',    desc: '1024x768 전체를 덮는 모달 오버레이',                   render: () => <FullScreenModalPreview /> },
};


/* ════════════════════════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════════════════════════ */

export default function ComponentPreviewClient({ slug }: { slug: string }) {
  const entry = previewRegistry[slug];

  if (!entry) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{slug?.replace(/-/g, ' ')}</h1>
          <p className="text-sm text-gray-400">준비 중인 컴포넌트입니다. 곧 추가됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{entry.title}</h1>
        <p className="text-sm text-gray-400 mt-1">{entry.desc}</p>
        <div className="flex items-center gap-2 mt-3">
          {concepts.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 text-2xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full"
            >
              <span className="w-2 h-2 rounded-full" style={{ background: c.accentColor }} />
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* Concept Sections */}
      {entry.render()}
    </div>
  );
}
