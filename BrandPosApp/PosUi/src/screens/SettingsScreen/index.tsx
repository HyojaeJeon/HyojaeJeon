'use client';

import { useState, useCallback } from 'react';
import Button from '@shared/ui/atoms/Button';
import SettingsMainDialog from './components/SettingsMainDialog';
import BasicSettingsDialog from './components/BasicSettingsDialog';
import CompanyInfoDialog from './components/CompanyInfoDialog';
import StoreInfoDialog from './components/StoreInfoDialog';
import DeviceSettingsDialog from './components/DeviceSettingsDialog';
import EmployeeInputDialog from './components/EmployeeInputDialog';
import ItemInputDialog from './components/ItemInputDialog';
import ItemInputDetailDialog from './components/ItemInputDetailDialog';
import ItemSettingsDialog from './components/ItemSettingsDialog';
import ItemGroupPosDialog from './components/ItemGroupPosDialog';
import EventSettingsDialog from './components/EventSettingsDialog';
import FavoritesDialog from './components/FavoritesDialog';
import SaleDiscountDialog from './components/SaleDiscountDialog';
import OrderMessageDialog from './components/OrderMessageDialog';
import TableMessageSettingsDialog from './components/TableMessageSettingsDialog';

/**
 * SettingsScreen -- Settings Part 1 hub (15 screens)
 *
 * This is the central navigation hub for Settings Part 1 screens.
 * Each sub-screen is rendered in the content area based on the active route.
 *
 * Design doc: set-restaurantset-dialog.md (SCR-SET-MAIN)
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

interface NavItem {
  route: SettingsRoute;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: 'basic', label: '기초설정' },
  { route: 'companyInfo', label: '업체정보' },
  { route: 'storeInfo', label: '매장설정' },
  { route: 'device', label: '장비설정' },
  { route: 'employee', label: '직원설정' },
  { route: 'itemInput', label: '상품설정' },
  { route: 'itemDetail', label: '상품상세' },
  { route: 'itemSettings', label: '세트설정' },
  { route: 'itemGroupPos', label: '그룹표시설정' },
  { route: 'event', label: '행사설정' },
  { route: 'favorites', label: '즐겨찾기' },
  { route: 'saleDiscount', label: '할인설정' },
  { route: 'orderMessage', label: '주문메시지' },
  { route: 'tableMessage', label: '테이블메시지' },
];

export default function SettingsScreen() {
  const [activeRoute, setActiveRoute] = useState<SettingsRoute>('main');

  const handleNavigate = useCallback((route: SettingsRoute) => {
    setActiveRoute(route);
  }, []);

  const handleClose = useCallback(() => {
    // TODO: Bridge command to exit Setup mode (SETUP:EXIT)
  }, []);

  const handleBackToMain = useCallback(() => {
    setActiveRoute('main');
  }, []);

  const renderContent = () => {
    switch (activeRoute) {
      case 'main':
        return <SettingsMainDialog onNavigate={handleNavigate} />;
      case 'basic':
        return <BasicSettingsDialog onClose={handleBackToMain} />;
      case 'companyInfo':
        return <CompanyInfoDialog onClose={handleBackToMain} />;
      case 'storeInfo':
        return <StoreInfoDialog onClose={handleBackToMain} />;
      case 'device':
        return <DeviceSettingsDialog onClose={handleBackToMain} />;
      case 'employee':
        return <EmployeeInputDialog onClose={handleBackToMain} />;
      case 'itemInput':
        return (
          <ItemInputDialog
            onClose={handleBackToMain}
            onDetailOpen={() => handleNavigate('itemDetail')}
            onSetOpen={() => handleNavigate('itemSettings')}
          />
        );
      case 'itemDetail':
        return <ItemInputDetailDialog onClose={() => handleNavigate('itemInput')} />;
      case 'itemSettings':
        return <ItemSettingsDialog onClose={() => handleNavigate('itemInput')} />;
      case 'itemGroupPos':
        return <ItemGroupPosDialog onClose={handleBackToMain} />;
      case 'event':
        return <EventSettingsDialog onClose={handleBackToMain} />;
      case 'favorites':
        return <FavoritesDialog onClose={handleBackToMain} />;
      case 'saleDiscount':
        return <SaleDiscountDialog onClose={handleBackToMain} />;
      case 'orderMessage':
        return <OrderMessageDialog onClose={handleBackToMain} />;
      case 'tableMessage':
        return <TableMessageSettingsDialog onClose={handleBackToMain} />;
      default:
        return <SettingsMainDialog onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-pos-surface text-pos-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-pos-border px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">설정</h1>
          {/* TODO: POS number display from setupApi.getBasicConfig */}
          <span className="text-sm text-pos-text-muted">POS번호: --</span>
        </div>
        <div className="flex items-center gap-2">
          {/* TODO: Language toggle buttons (KR/EN/VN) via SETUP:BASIC:SAVE */}
          <Button size="sm" variant="ghost" onClick={() => { /* TODO: lang=ko */ }}>KR</Button>
          <Button size="sm" variant="ghost" onClick={() => { /* TODO: lang=en */ }}>EN</Button>
          <Button size="sm" variant="ghost" onClick={() => { /* TODO: lang=vi */ }}>VN</Button>
          <Button size="sm" variant="primary" onClick={handleClose}>완료</Button>
        </div>
      </div>

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-40 shrink-0 overflow-y-auto border-r border-pos-border bg-pos-surface-alt">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.route}
              type="button"
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                activeRoute === item.route
                  ? 'bg-pos-primary text-white font-semibold'
                  : 'hover:bg-pos-surface-hover'
              }`}
              onClick={() => handleNavigate(item.route)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
