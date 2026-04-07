'use client';

import FullScreenPanel from '@shared/ui/templates/FullScreenPanel';
import Button from '@shared/ui/atoms/Button';

/**
 * SettingsMainDialog -- Settings main navigation hub
 *
 * Design doc: set-restaurantset-dialog.md (SCR-SET-MAIN)
 * Legacy: IDD_RESTAURANTSET_DIALOG (resource 102)
 *
 * Displays categorized grid of setting entry buttons.
 * Each button navigates to a sub-settings screen via React routing.
 *
 * Bridge Commands:
 *   SETUP:BASIC:SAVE (language change)
 *   SETUP:LOCK_TOGGLE, SETUP:LOCK_CLEAR
 *
 * RTK Query: setupApi.getBasicConfig
 */

type SettingsRoute =
  | 'main'
  | 'basic'
  | 'companyInfo'
  | 'storeInfo'
  | 'device'
  | 'employee'
  | 'itemInput'
  | 'itemDetail'
  | 'itemSettings'
  | 'itemGroupPos'
  | 'event'
  | 'favorites'
  | 'saleDiscount'
  | 'orderMessage'
  | 'tableMessage';

interface SettingsMainDialogProps {
  onNavigate: (route: SettingsRoute) => void;
  open?: boolean;
  onClose?: () => void;
}

interface SettingButton {
  route: SettingsRoute;
  label: string;
  priority: 'P0' | 'P1' | 'P2';
}

const SETTING_BUTTONS: SettingButton[] = [
  { route: 'basic', label: '기초설정', priority: 'P0' },
  { route: 'storeInfo', label: '매장설정', priority: 'P0' },
  { route: 'device', label: '장비설정', priority: 'P0' },
  { route: 'itemInput', label: '상품설정', priority: 'P0' },
  { route: 'companyInfo', label: '업체정보', priority: 'P2' },
  { route: 'employee', label: '직원설정', priority: 'P1' },
  { route: 'event', label: '행사설정', priority: 'P1' },
  { route: 'saleDiscount', label: '할인매출설정', priority: 'P1' },
  { route: 'orderMessage', label: '주문메시지', priority: 'P1' },
  { route: 'favorites', label: '즐겨찾기', priority: 'P2' },
  { route: 'itemGroupPos', label: '그룹표시설정', priority: 'P1' },
  { route: 'itemSettings', label: '세트설정', priority: 'P1' },
  { route: 'tableMessage', label: '테이블메시지', priority: 'P2' },
];

const SECTIONS: { title: string; priority: 'P0' | 'P1' | 'P2' }[] = [
  { title: '필수 설정', priority: 'P0' },
  { title: '추가 설정', priority: 'P1' },
  { title: '기타 설정', priority: 'P2' },
];

export default function SettingsMainDialog({
  onNavigate,
  open = true,
  onClose = () => {},
}: SettingsMainDialogProps) {
  return (
    <FullScreenPanel open={open} onClose={onClose} title="설정 메인" subtitle="SCR-SET-MAIN">
      <div className="flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <section
            key={section.priority}
            className="rounded-2xl bg-pos-surface shadow-pos-card p-5"
          >
            <h3 className="mb-3 text-sm font-semibold text-pos-text-muted">{section.title}</h3>
            <div className="grid grid-cols-4 gap-3">
              {SETTING_BUTTONS.filter((b) => b.priority === section.priority).map((btn) => (
                <Button
                  key={btn.route}
                  variant="secondary"
                  size="lg"
                  className="h-16 w-full"
                  onClick={() => onNavigate(btn.route)}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </FullScreenPanel>
  );
}
