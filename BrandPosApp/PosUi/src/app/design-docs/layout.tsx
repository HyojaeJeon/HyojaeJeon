'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DesignDocsI18nProvider, useDesignDocsT, Locale } from './i18n/DesignDocsI18nProvider';

interface NavItem {
  href: string;
  labelKey: string;
  status?: 'done' | 'wip' | 'todo';
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
  collapsible?: boolean;
}

const P = '/design-docs';

function buildNavSections(): NavSection[] {
  return [
    /* --- 개요 --- */
    {
      titleKey: 'nav.section_integrated_design',
      items: [
        { href: P, labelKey: 'nav.overview' },
      ],
    },

    /* --- 1. 사업기획서 --- */
    {
      titleKey: 'nav.section_business',
      collapsible: true,
      items: [
        { href: `${P}/docs/business-overview`, labelKey: 'nav.business_overview', status: 'todo' },
        { href: `${P}/docs/business-model`, labelKey: 'nav.business_model', status: 'todo' },
        { href: `${P}/docs/target-market`, labelKey: 'nav.target_market', status: 'todo' },
        { href: `${P}/docs/roadmap`, labelKey: 'nav.roadmap', status: 'todo' },
      ],
    },

    /* --- 2. 차별화, 혁신 --- */
    {
      titleKey: 'nav.section_innovation',
      collapsible: true,
      items: [
        { href: `${P}/docs/innovation-framework`, labelKey: 'nav.innovation_framework', status: 'todo' },
      ],
    },

    /* --- 3. 프로젝트 통합설계 --- */
    {
      titleKey: 'nav.section_project_design',
      collapsible: true,
      items: [
        { href: `${P}/docs/platform-architecture`, labelKey: 'nav.platform_architecture', status: 'todo' },
        { href: `${P}/docs/superadmin-design`, labelKey: 'nav.superadmin_design', status: 'todo' },
        { href: `${P}/docs/distributor-design`, labelKey: 'nav.distributor_design', status: 'todo' },
        { href: `${P}/docs/brandhq-design`, labelKey: 'nav.brandhq_design', status: 'todo' },
        { href: `${P}/docs/edgepos-architecture`, labelKey: 'nav.edgepos_architecture', status: 'todo' },
        { href: `${P}/docs/edgepos-az-guide`, labelKey: 'nav.edgepos_az_guide', status: 'todo' },
        { href: `${P}/docs/edgepos-checklist`, labelKey: 'nav.edgepos_checklist', status: 'todo' },
        { href: `${P}/docs/mealticket-overview`, labelKey: 'nav.mealticket_overview', status: 'wip' },
        { href: `${P}/docs/mealticket-corporate`, labelKey: 'nav.mealticket_corporate', status: 'wip' },
        { href: `${P}/docs/mealticket-merchant`, labelKey: 'nav.mealticket_merchant', status: 'wip' },
      ],
    },

    /* --- 4. 플랫폼 별 화면/기능리스트 --- */
    {
      titleKey: 'nav.section_feature_list',
      collapsible: true,
      items: [
        { href: `${P}/docs/feature-coverage-matrix`, labelKey: 'nav.feature_coverage_matrix', status: 'todo' },
        { href: `${P}/docs/superadmin-features`, labelKey: 'nav.superadmin_features', status: 'todo' },
        { href: `${P}/docs/distributor-features`, labelKey: 'nav.distributor_features', status: 'todo' },
        { href: `${P}/docs/brandhq-features`, labelKey: 'nav.brandhq_features', status: 'todo' },
        { href: `${P}/docs/edgepos-features`, labelKey: 'nav.edgepos_features', status: 'todo' },
        { href: `${P}/docs/screen-inventory`, labelKey: 'nav.screen_inventory', status: 'done' },
      ],
    },

    /* --- 5. DB 설계 --- */
    {
      titleKey: 'nav.section_db_design',
      collapsible: true,
      items: [
        { href: `${P}/docs/db-table-master`, labelKey: 'nav.db_table_master', status: 'done' },
        { href: `${P}/docs/db-shared-reference`, labelKey: 'nav.db_shared_reference', status: 'todo' },
        { href: `${P}/docs/db-superadmin-governance`, labelKey: 'nav.db_superadmin_governance', status: 'todo' },
        { href: `${P}/docs/db-distributor-channel`, labelKey: 'nav.db_distributor_channel', status: 'todo' },
        { href: `${P}/docs/db-brandhq-master`, labelKey: 'nav.db_brandhq_master', status: 'todo' },
        { href: `${P}/docs/db-edgepos-core`, labelKey: 'nav.db_edgepos_core', status: 'todo' },
      ],
    },

    /* ===============================================
     *  디자인 시스템
     * =============================================== */
    {
      titleKey: 'nav.section_design_tokens',
      collapsible: true,
      items: [
        { href: `${P}/tokens/colors`, labelKey: 'nav.colors', status: 'done' },
        { href: `${P}/tokens/spacing`, labelKey: 'nav.spacing', status: 'done' },
        { href: `${P}/tokens/typography`, labelKey: 'nav.typography', status: 'todo' },
        { href: `${P}/tokens/shadows`, labelKey: 'nav.shadows', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_atoms',
      collapsible: true,
      items: [
        { href: `${P}/components/button`, labelKey: 'nav.button', status: 'done' },
        { href: `${P}/components/icon`, labelKey: 'nav.icon', status: 'todo' },
        { href: `${P}/components/text-input`, labelKey: 'nav.text_input', status: 'todo' },
        { href: `${P}/components/number-input`, labelKey: 'nav.number_input', status: 'todo' },
        { href: `${P}/components/label`, labelKey: 'nav.label', status: 'todo' },
        { href: `${P}/components/badge`, labelKey: 'nav.badge', status: 'todo' },
        { href: `${P}/components/checkbox`, labelKey: 'nav.checkbox', status: 'todo' },
        { href: `${P}/components/radio`, labelKey: 'nav.radio', status: 'todo' },
        { href: `${P}/components/toggle`, labelKey: 'nav.toggle', status: 'todo' },
        { href: `${P}/components/spinner`, labelKey: 'nav.spinner', status: 'todo' },
        { href: `${P}/components/skeleton`, labelKey: 'nav.skeleton', status: 'todo' },
        { href: `${P}/components/divider`, labelKey: 'nav.divider', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_molecules',
      collapsible: true,
      items: [
        { href: `${P}/components/numpad`, labelKey: 'nav.numpad', status: 'todo' },
        { href: `${P}/components/amount-input`, labelKey: 'nav.amount_input', status: 'todo' },
        { href: `${P}/components/stepper`, labelKey: 'nav.stepper', status: 'todo' },
        { href: `${P}/components/search-bar`, labelKey: 'nav.search_bar', status: 'todo' },
        { href: `${P}/components/form-field`, labelKey: 'nav.form_field', status: 'todo' },
        { href: `${P}/components/toast`, labelKey: 'nav.toast', status: 'todo' },
        { href: `${P}/components/alert`, labelKey: 'nav.alert', status: 'todo' },
        { href: `${P}/components/tabs`, labelKey: 'nav.tabs', status: 'todo' },
        { href: `${P}/components/dropdown`, labelKey: 'nav.dropdown', status: 'todo' },
        { href: `${P}/components/chip`, labelKey: 'nav.chip', status: 'todo' },
        { href: `${P}/components/date-picker`, labelKey: 'nav.date_picker', status: 'todo' },
        { href: `${P}/components/progress-bar`, labelKey: 'nav.progress_bar', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_organisms',
      collapsible: true,
      items: [
        { href: `${P}/components/table-card`, labelKey: 'nav.table_card', status: 'done' },
        { href: `${P}/components/menu-card`, labelKey: 'nav.menu_card', status: 'done' },
        { href: `${P}/components/order-sidebar`, labelKey: 'nav.order_sidebar', status: 'done' },
        { href: `${P}/components/takeout-bar`, labelKey: 'nav.takeout_bar', status: 'done' },
        { href: `${P}/components/header`, labelKey: 'nav.header', status: 'todo' },
        { href: `${P}/components/navigation-bar`, labelKey: 'nav.navigation_bar', status: 'todo' },
        { href: `${P}/components/category-bar`, labelKey: 'nav.category_bar', status: 'todo' },
        { href: `${P}/components/menu-grid`, labelKey: 'nav.menu_grid', status: 'todo' },
        { href: `${P}/components/order-item-list`, labelKey: 'nav.order_item_list', status: 'todo' },
        { href: `${P}/components/table-grid`, labelKey: 'nav.table_grid', status: 'todo' },
        { href: `${P}/components/floor-selector`, labelKey: 'nav.floor_selector', status: 'todo' },
        { href: `${P}/components/payment-method-selector`, labelKey: 'nav.payment_method_selector', status: 'todo' },
        { href: `${P}/components/keypad-panel`, labelKey: 'nav.keypad_panel', status: 'todo' },
        { href: `${P}/components/summary-panel`, labelKey: 'nav.summary_panel', status: 'todo' },
        { href: `${P}/components/modal`, labelKey: 'nav.modal', status: 'todo' },
        { href: `${P}/components/confirm-dialog`, labelKey: 'nav.confirm_dialog', status: 'todo' },
        { href: `${P}/components/drawer`, labelKey: 'nav.drawer', status: 'todo' },
        { href: `${P}/components/receipt-preview`, labelKey: 'nav.receipt_preview', status: 'todo' },
        { href: `${P}/components/customer-info-panel`, labelKey: 'nav.customer_info_panel', status: 'todo' },
        { href: `${P}/components/employee-selector`, labelKey: 'nav.employee_selector', status: 'todo' },
        { href: `${P}/components/device-status`, labelKey: 'nav.device_status', status: 'todo' },
        { href: `${P}/components/kitchen-display`, labelKey: 'nav.kitchen_display', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_pos_specialized',
      collapsible: true,
      items: [
        { href: `${P}/components/option-selector`, labelKey: 'nav.option_selector', status: 'todo' },
        { href: `${P}/components/payment-status`, labelKey: 'nav.payment_status', status: 'todo' },
        { href: `${P}/components/change-calculator`, labelKey: 'nav.change_calculator', status: 'todo' },
        { href: `${P}/components/discount-calculator`, labelKey: 'nav.discount_calculator', status: 'todo' },
        { href: `${P}/components/qr-code-display`, labelKey: 'nav.qr_code_display', status: 'todo' },
        { href: `${P}/components/signature-pad`, labelKey: 'nav.signature_pad', status: 'todo' },
        { href: `${P}/components/error-recovery`, labelKey: 'nav.error_recovery', status: 'todo' },
        { href: `${P}/components/void-receipt`, labelKey: 'nav.void_receipt', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_templates',
      collapsible: true,
      items: [
        { href: `${P}/components/pos-main-layout`, labelKey: 'nav.pos_main_layout', status: 'todo' },
        { href: `${P}/components/split-panel-layout`, labelKey: 'nav.split_panel_layout', status: 'todo' },
        { href: `${P}/components/fullscreen-modal`, labelKey: 'nav.fullscreen_modal', status: 'todo' },
      ],
    },

    /* ===============================================
     *  화면 프리뷰
     * =============================================== */
    {
      titleKey: 'nav.section_screen_main',
      items: [
        { href: `${P}/screens/main-menu`, labelKey: 'nav.main_menu', status: 'todo' },
        { href: `${P}/screens/table`, labelKey: 'nav.table', status: 'done' },
        { href: `${P}/screens/order`, labelKey: 'nav.order', status: 'done' },
        { href: `${P}/screens/payment`, labelKey: 'nav.payment', status: 'done' },
      ],
    },
    {
      titleKey: 'nav.section_screen_flow',
      collapsible: true,
      items: [
        { href: `${P}/screens/connected-flow`, labelKey: 'nav.connected_flow', status: 'done' },
      ],
    },
    {
      titleKey: 'nav.section_screen_payment',
      collapsible: true,
      items: [
        { href: `${P}/screens/payment-vn`, labelKey: 'nav.payment_vn', status: 'todo' },
        { href: `${P}/screens/payment-quick-select`, labelKey: 'nav.payment_quick_select', status: 'todo' },
        { href: `${P}/screens/payment-quick-select-vn`, labelKey: 'nav.payment_quick_select_vn', status: 'todo' },
        { href: `${P}/screens/order-payment`, labelKey: 'nav.order_payment', status: 'todo' },
        { href: `${P}/screens/order-payment-quick`, labelKey: 'nav.order_payment_quick', status: 'todo' },
        { href: `${P}/screens/dutch-pay`, labelKey: 'nav.dutch_pay', status: 'todo' },
        { href: `${P}/screens/dutch-pay-people`, labelKey: 'nav.dutch_pay_people', status: 'todo' },
        { href: `${P}/screens/dutch-pay-item`, labelKey: 'nav.dutch_pay_item', status: 'todo' },
        { href: `${P}/screens/payment-etc`, labelKey: 'nav.payment_etc', status: 'todo' },
        { href: `${P}/screens/payment-memo`, labelKey: 'nav.payment_memo', status: 'todo' },
        { href: `${P}/screens/async-payment-noti`, labelKey: 'nav.async_payment_noti', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_order',
      collapsible: true,
      items: [
        { href: `${P}/screens/order-quick-select`, labelKey: 'nav.order_quick_select', status: 'todo' },
        { href: `${P}/screens/order-item-detail`, labelKey: 'nav.order_item_detail', status: 'todo' },
        { href: `${P}/screens/order-item-info`, labelKey: 'nav.order_item_info', status: 'todo' },
        { href: `${P}/screens/order-item-list`, labelKey: 'nav.order_item_list_screen', status: 'todo' },
        { href: `${P}/screens/order-message`, labelKey: 'nav.order_message', status: 'todo' },
        { href: `${P}/screens/plu-set`, labelKey: 'nav.plu_set', status: 'todo' },
        { href: `${P}/screens/set-menu`, labelKey: 'nav.set_menu', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_table',
      collapsible: true,
      items: [
        { href: `${P}/screens/table-quick-select`, labelKey: 'nav.table_quick_select', status: 'todo' },
        { href: `${P}/screens/table-select`, labelKey: 'nav.table_select', status: 'todo' },
        { href: `${P}/screens/table-message`, labelKey: 'nav.table_message', status: 'todo' },
        { href: `${P}/screens/table-group-checkout`, labelKey: 'nav.table_group_checkout', status: 'todo' },
        { href: `${P}/screens/appointment`, labelKey: 'nav.appointment', status: 'todo' },
        { href: `${P}/screens/appointment-table-view`, labelKey: 'nav.appointment_table_view', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_delivery',
      collapsible: true,
      items: [
        { href: `${P}/screens/delivery`, labelKey: 'nav.delivery', status: 'todo' },
        { href: `${P}/screens/delivery-address`, labelKey: 'nav.delivery_address', status: 'todo' },
        { href: `${P}/screens/delivery-print`, labelKey: 'nav.delivery_print', status: 'todo' },
        { href: `${P}/screens/delivery-agency`, labelKey: 'nav.delivery_agency', status: 'todo' },
        { href: `${P}/screens/delivery-address-input`, labelKey: 'nav.delivery_address_input', status: 'todo' },
        { href: `${P}/screens/delivery-cid`, labelKey: 'nav.delivery_cid', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_customer',
      collapsible: true,
      items: [
        { href: `${P}/screens/customer-register`, labelKey: 'nav.customer_register', status: 'todo' },
        { href: `${P}/screens/customer-search`, labelKey: 'nav.customer_search', status: 'todo' },
        { href: `${P}/screens/customer-input`, labelKey: 'nav.customer_input', status: 'todo' },
        { href: `${P}/screens/customer-info`, labelKey: 'nav.customer_info', status: 'todo' },
        { href: `${P}/screens/customer-detail`, labelKey: 'nav.customer_detail', status: 'todo' },
        { href: `${P}/screens/customer-all-register`, labelKey: 'nav.customer_all_register', status: 'todo' },
        { href: `${P}/screens/customer-item-in`, labelKey: 'nav.customer_item_in', status: 'todo' },
        { href: `${P}/screens/customer-item-sell`, labelKey: 'nav.customer_item_sell', status: 'todo' },
        { href: `${P}/screens/customer-item-use`, labelKey: 'nav.customer_item_use', status: 'todo' },
        { href: `${P}/screens/customer-keep`, labelKey: 'nav.customer_keep', status: 'todo' },
        { href: `${P}/screens/chain-customer-list`, labelKey: 'nav.chain_customer_list', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_employee',
      collapsible: true,
      items: [
        { href: `${P}/screens/employee-select`, labelKey: 'nav.employee_select', status: 'todo' },
        { href: `${P}/screens/employee-call`, labelKey: 'nav.employee_call', status: 'todo' },
        { href: `${P}/screens/employee-alert`, labelKey: 'nav.employee_alert', status: 'todo' },
        { href: `${P}/screens/attendance`, labelKey: 'nav.attendance', status: 'todo' },
        { href: `${P}/screens/attendance-pay`, labelKey: 'nav.attendance_pay', status: 'todo' },
        { href: `${P}/screens/attendance-modify`, labelKey: 'nav.attendance_modify', status: 'todo' },
        { href: `${P}/screens/attendance-settings`, labelKey: 'nav.attendance_settings', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_stock',
      collapsible: true,
      items: [
        { href: `${P}/screens/stock`, labelKey: 'nav.stock', status: 'todo' },
        { href: `${P}/screens/stock-input`, labelKey: 'nav.stock_input', status: 'todo' },
        { href: `${P}/screens/stock-view`, labelKey: 'nav.stock_view', status: 'todo' },
        { href: `${P}/screens/stock-date-view`, labelKey: 'nav.stock_date_view', status: 'todo' },
        { href: `${P}/screens/stock-account`, labelKey: 'nav.stock_account', status: 'todo' },
        { href: `${P}/screens/stock-supply`, labelKey: 'nav.stock_supply', status: 'todo' },
        { href: `${P}/screens/purchase`, labelKey: 'nav.purchase', status: 'todo' },
        { href: `${P}/screens/purchase-modify`, labelKey: 'nav.purchase_modify', status: 'todo' },
        { href: `${P}/screens/purchase-view`, labelKey: 'nav.purchase_view', status: 'todo' },
        { href: `${P}/screens/cash-inout`, labelKey: 'nav.cash_inout', status: 'todo' },
        { href: `${P}/screens/cash-inout-input`, labelKey: 'nav.cash_inout_input', status: 'todo' },
        { href: `${P}/screens/ledger-register`, labelKey: 'nav.ledger_register', status: 'todo' },
        { href: `${P}/screens/ledger-input`, labelKey: 'nav.ledger_input', status: 'todo' },
        { href: `${P}/screens/ledger-view`, labelKey: 'nav.ledger_view', status: 'todo' },
        { href: `${P}/screens/item-register`, labelKey: 'nav.item_register', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_gift',
      collapsible: true,
      items: [
        { href: `${P}/screens/gift-manage`, labelKey: 'nav.gift_manage', status: 'todo' },
        { href: `${P}/screens/gift-register`, labelKey: 'nav.gift_register', status: 'todo' },
        { href: `${P}/screens/gift-use`, labelKey: 'nav.gift_use', status: 'todo' },
        { href: `${P}/screens/coupon-use`, labelKey: 'nav.coupon_use', status: 'todo' },
        { href: `${P}/screens/point-save`, labelKey: 'nav.point_save', status: 'todo' },
        { href: `${P}/screens/card-list`, labelKey: 'nav.card_list', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_payment_method',
      collapsible: true,
      items: [
        { href: `${P}/screens/kakaopay`, labelKey: 'nav.kakaopay', status: 'todo' },
        { href: `${P}/screens/zalopay`, labelKey: 'nav.zalopay', status: 'todo' },
        { href: `${P}/screens/hjvietpay`, labelKey: 'nav.hjvietpay', status: 'todo' },
        { href: `${P}/screens/infoplus-bidv`, labelKey: 'nav.infoplus_bidv', status: 'todo' },
        { href: `${P}/screens/infoplus-shinhan`, labelKey: 'nav.infoplus_shinhan', status: 'todo' },
        { href: `${P}/screens/infoplus-woori`, labelKey: 'nav.infoplus_woori', status: 'todo' },
        { href: `${P}/screens/napas`, labelKey: 'nav.napas', status: 'todo' },
        { href: `${P}/screens/kakaotalk-alert`, labelKey: 'nav.kakaotalk_alert', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_receipt',
      collapsible: true,
      items: [
        { href: `${P}/screens/receipt-choice`, labelKey: 'nav.receipt_choice', status: 'todo' },
        { href: `${P}/screens/simple-receipt`, labelKey: 'nav.simple_receipt', status: 'todo' },
        { href: `${P}/screens/barcode-print`, labelKey: 'nav.barcode_print', status: 'todo' },
        { href: `${P}/screens/barcode-settings`, labelKey: 'nav.barcode_settings', status: 'todo' },
        { href: `${P}/screens/kdr-receipt`, labelKey: 'nav.kdr_receipt', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_table_order',
      collapsible: true,
      items: [
        { href: `${P}/screens/table-order-control`, labelKey: 'nav.table_order_control', status: 'todo' },
        { href: `${P}/screens/table-order-manager`, labelKey: 'nav.table_order_manager', status: 'todo' },
        { href: `${P}/screens/table-order-receive`, labelKey: 'nav.table_order_receive', status: 'todo' },
        { href: `${P}/screens/table-order-state`, labelKey: 'nav.table_order_state', status: 'todo' },
        { href: `${P}/screens/table-order-soldout`, labelKey: 'nav.table_order_soldout', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_kitchen',
      collapsible: true,
      items: [
        { href: `${P}/screens/kitchen`, labelKey: 'nav.kitchen', status: 'todo' },
        { href: `${P}/screens/kitchen-v2`, labelKey: 'nav.kitchen_v2', status: 'todo' },
        { href: `${P}/screens/kitchen-settings`, labelKey: 'nav.kitchen_settings', status: 'todo' },
        { href: `${P}/screens/call-number-display`, labelKey: 'nav.call_number_display', status: 'todo' },
        { href: `${P}/screens/call-number-settings`, labelKey: 'nav.call_number_settings', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_screen_utility',
      collapsible: true,
      items: [
        { href: `${P}/screens/login`, labelKey: 'nav.login', status: 'todo' },
        { href: `${P}/screens/auth`, labelKey: 'nav.auth', status: 'todo' },
        { href: `${P}/screens/no-permission`, labelKey: 'nav.no_permission', status: 'todo' },
        { href: `${P}/screens/numpad`, labelKey: 'nav.numpad_screen', status: 'todo' },
        { href: `${P}/screens/phone-numpad`, labelKey: 'nav.phone_numpad', status: 'todo' },
        { href: `${P}/screens/keyboard`, labelKey: 'nav.keyboard', status: 'todo' },
        { href: `${P}/screens/message-box`, labelKey: 'nav.message_box', status: 'todo' },
        { href: `${P}/screens/message-view`, labelKey: 'nav.message_view', status: 'todo' },
        { href: `${P}/screens/text-search`, labelKey: 'nav.text_search', status: 'todo' },
        { href: `${P}/screens/checkout`, labelKey: 'nav.checkout', status: 'todo' },
        { href: `${P}/screens/resell`, labelKey: 'nav.resell', status: 'todo' },
        { href: `${P}/screens/sell-void`, labelKey: 'nav.sell_void', status: 'todo' },
        { href: `${P}/screens/sell-view-select`, labelKey: 'nav.sell_view_select', status: 'todo' },
        { href: `${P}/screens/sell-list-view`, labelKey: 'nav.sell_list_view', status: 'todo' },
        { href: `${P}/screens/auto-end-work`, labelKey: 'nav.auto_end_work', status: 'todo' },
        { href: `${P}/screens/sign-touch`, labelKey: 'nav.sign_touch', status: 'todo' },
      ],
    },

    /* ===============================================
     *  레거시 RC 추출 화면
     * =============================================== */
    {
      titleKey: 'nav.section_rc_main',
      collapsible: true,
      items: [
        { href: `${P}/screens/rc-restaurant-dialog`, labelKey: 'nav.rc_restaurant_dialog', status: 'todo' },
        { href: `${P}/screens/rc-login`, labelKey: 'nav.rc_login', status: 'todo' },
        { href: `${P}/screens/rc-table-dialog`, labelKey: 'nav.rc_table_dialog', status: 'todo' },
        { href: `${P}/screens/rc-order-dialog`, labelKey: 'nav.rc_order_dialog', status: 'todo' },
        { href: `${P}/screens/rc-oracc-dialog`, labelKey: 'nav.rc_oracc_dialog', status: 'todo' },
        { href: `${P}/screens/rc-account-dialog`, labelKey: 'nav.rc_account_dialog', status: 'todo' },
        { href: `${P}/screens/rc-account-dialog-vn`, labelKey: 'nav.rc_account_dialog_vn', status: 'todo' },
        { href: `${P}/screens/rc-empsel`, labelKey: 'nav.rc_empsel', status: 'todo' },
        { href: `${P}/screens/rc-custsel`, labelKey: 'nav.rc_custsel', status: 'todo' },
        { href: `${P}/screens/rc-custinput`, labelKey: 'nav.rc_custinput', status: 'todo' },
        { href: `${P}/screens/rc-custregi`, labelKey: 'nav.rc_custregi', status: 'todo' },
        { href: `${P}/screens/rc-cust-detail`, labelKey: 'nav.rc_cust_detail', status: 'todo' },
        { href: `${P}/screens/rc-cust-keep`, labelKey: 'nav.rc_cust_keep', status: 'todo' },
        { href: `${P}/screens/rc-custdeli`, labelKey: 'nav.rc_custdeli', status: 'todo' },
        { href: `${P}/screens/rc-custdeli2`, labelKey: 'nav.rc_custdeli2', status: 'todo' },
        { href: `${P}/screens/rc-custdeli-addr`, labelKey: 'nav.rc_custdeli_addr', status: 'todo' },
        { href: `${P}/screens/rc-custdeli-prn`, labelKey: 'nav.rc_custdeli_prn', status: 'todo' },
        { href: `${P}/screens/rc-emp-diligence`, labelKey: 'nav.rc_emp_diligence', status: 'todo' },
        { href: `${P}/screens/rc-stock-input`, labelKey: 'nav.rc_stock_input', status: 'todo' },
        { href: `${P}/screens/rc-stock-view`, labelKey: 'nav.rc_stock_view', status: 'todo' },
        { href: `${P}/screens/rc-inout-dialog`, labelKey: 'nav.rc_inout_dialog', status: 'todo' },
        { href: `${P}/screens/rc-sellview`, labelKey: 'nav.rc_sellview', status: 'todo' },
        { href: `${P}/screens/rc-sellview-select`, labelKey: 'nav.rc_sellview_select', status: 'todo' },
        { href: `${P}/screens/rc-selllistview`, labelKey: 'nav.rc_selllistview', status: 'todo' },
        { href: `${P}/screens/rc-saledc`, labelKey: 'nav.rc_saledc', status: 'todo' },
        { href: `${P}/screens/rc-autowork`, labelKey: 'nav.rc_autowork', status: 'todo' },
        { href: `${P}/screens/rc-iniset`, labelKey: 'nav.rc_iniset', status: 'todo' },
        { href: `${P}/screens/rc-numpad`, labelKey: 'nav.rc_numpad', status: 'todo' },
        { href: `${P}/screens/rc-phone-numpad`, labelKey: 'nav.rc_phone_numpad', status: 'todo' },
        { href: `${P}/screens/rc-phone-numpad2`, labelKey: 'nav.rc_phone_numpad2', status: 'todo' },
        { href: `${P}/screens/rc-message-dialog`, labelKey: 'nav.rc_message_dialog', status: 'todo' },
        { href: `${P}/screens/rc-unpermission`, labelKey: 'nav.rc_unpermission', status: 'todo' },
        { href: `${P}/screens/rc-tickserch`, labelKey: 'nav.rc_tickserch', status: 'todo' },
        { href: `${P}/screens/rc-gettick-dialog`, labelKey: 'nav.rc_gettick_dialog', status: 'todo' },
        { href: `${P}/screens/rc-groupsel-dlg`, labelKey: 'nav.rc_groupsel_dlg', status: 'todo' },
        { href: `${P}/screens/rc-table-bselect`, labelKey: 'nav.rc_table_bselect', status: 'todo' },
        { href: `${P}/screens/rc-oracc-bselect`, labelKey: 'nav.rc_oracc_bselect', status: 'todo' },
        { href: `${P}/screens/rc-account-bselect`, labelKey: 'nav.rc_account_bselect', status: 'todo' },
        { href: `${P}/screens/rc-account-bselect-vn`, labelKey: 'nav.rc_account_bselect_vn', status: 'todo' },
        { href: `${P}/screens/rc-contentview`, labelKey: 'nav.rc_contentview', status: 'todo' },
        { href: `${P}/screens/rc-contentview2`, labelKey: 'nav.rc_contentview2', status: 'todo' },
        { href: `${P}/screens/rc-pointsavesell`, labelKey: 'nav.rc_pointsavesell', status: 'todo' },
        { href: `${P}/screens/rc-gethold-dlg`, labelKey: 'nav.rc_gethold_dlg', status: 'todo' },
        { href: `${P}/screens/rc-getitemserver`, labelKey: 'nav.rc_getitemserver', status: 'todo' },
        { href: `${P}/screens/rc-menumove`, labelKey: 'nav.rc_menumove', status: 'todo' },
        { href: `${P}/screens/rc-moveimg-dlg`, labelKey: 'nav.rc_moveimg_dlg', status: 'todo' },
        { href: `${P}/screens/rc-order-pluset`, labelKey: 'nav.rc_order_pluset', status: 'todo' },
        { href: `${P}/screens/rc-martsell-dlg`, labelKey: 'nav.rc_martsell_dlg', status: 'todo' },
        { href: `${P}/screens/rc-purchasemgr-dlg`, labelKey: 'nav.rc_purchasemgr_dlg', status: 'todo' },
        { href: `${P}/screens/rc-pur-stomodify`, labelKey: 'nav.rc_pur_stomodify', status: 'todo' },
        { href: `${P}/screens/rc-itemregi`, labelKey: 'nav.rc_itemregi', status: 'todo' },
        { href: `${P}/screens/rc-item-search`, labelKey: 'nav.rc_item_search', status: 'todo' },
        { href: `${P}/screens/rc-catcashmgr-dlg`, labelKey: 'nav.rc_catcashmgr_dlg', status: 'todo' },
        { href: `${P}/screens/rc-cid-numview`, labelKey: 'nav.rc_cid_numview', status: 'todo' },
        { href: `${P}/screens/rc-inputandcust`, labelKey: 'nav.rc_inputandcust', status: 'todo' },
        { href: `${P}/screens/rc-tablemsg-dlg`, labelKey: 'nav.rc_tablemsg_dlg', status: 'todo' },
        { href: `${P}/screens/rc-zalopay-qr`, labelKey: 'nav.rc_zalopay_qr', status: 'todo' },
        { href: `${P}/screens/rc-napas-qr`, labelKey: 'nav.rc_napas_qr', status: 'todo' },
        { href: `${P}/screens/rc-hjvietpay-dlg`, labelKey: 'nav.rc_hjvietpay_dlg', status: 'todo' },
        { href: `${P}/screens/rc-infoplus-shinhan-qr`, labelKey: 'nav.rc_infoplus_shinhan_qr', status: 'todo' },
        { href: `${P}/screens/rc-infoplus-bidv-qr`, labelKey: 'nav.rc_infoplus_bidv_qr', status: 'todo' },
        { href: `${P}/screens/rc-infoplus-woori-qr`, labelKey: 'nav.rc_infoplus_woori_qr', status: 'todo' },
        { href: `${P}/screens/rc-async-paynoti-dlg`, labelKey: 'nav.rc_async_paynoti_dlg', status: 'todo' },
        { href: `${P}/screens/rc-kakaotalk-alim`, labelKey: 'nav.rc_kakaotalk_alim', status: 'todo' },
        { href: `${P}/screens/rc-kiosk-dlg`, labelKey: 'nav.rc_kiosk_dlg', status: 'todo' },
        { href: `${P}/screens/rc-kio-optitem`, labelKey: 'nav.rc_kio_optitem', status: 'todo' },
        { href: `${P}/screens/rc-viettel-issuance`, labelKey: 'nav.rc_viettel_issuance', status: 'todo' },
      ],
    },
    {
      titleKey: 'nav.section_rc_set',
      collapsible: true,
      items: [
        { href: `${P}/screens/rc-set-restaurantset-dialog`, labelKey: 'nav.rc_set_restaurantset_dialog', status: 'todo' },
        { href: `${P}/screens/rc-set-basicset`, labelKey: 'nav.rc_set_basicset', status: 'todo' },
        { href: `${P}/screens/rc-set-companyinfo`, labelKey: 'nav.rc_set_companyinfo', status: 'todo' },
        { href: `${P}/screens/rc-set-deviceset`, labelKey: 'nav.rc_set_deviceset', status: 'todo' },
        { href: `${P}/screens/rc-set-empinput`, labelKey: 'nav.rc_set_empinput', status: 'todo' },
        { href: `${P}/screens/rc-set-custinfoset`, labelKey: 'nav.rc_set_custinfoset', status: 'todo' },
        { href: `${P}/screens/rc-set-iteminput`, labelKey: 'nav.rc_set_iteminput', status: 'todo' },
        { href: `${P}/screens/rc-set-iteminput-detail`, labelKey: 'nav.rc_set_iteminput_detail', status: 'todo' },
        { href: `${P}/screens/rc-set-itemset`, labelKey: 'nav.rc_set_itemset', status: 'todo' },
        { href: `${P}/screens/rc-set-item-grpos`, labelKey: 'nav.rc_set_item_grpos', status: 'todo' },
        { href: `${P}/screens/rc-set-pay-mgr`, labelKey: 'nav.rc_set_pay_mgr', status: 'todo' },
        { href: `${P}/screens/rc-set-print-mgr`, labelKey: 'nav.rc_set_print_mgr', status: 'todo' },
        { href: `${P}/screens/rc-set-kio-mgr`, labelKey: 'nav.rc_set_kio_mgr', status: 'todo' },
        { href: `${P}/screens/rc-set-qrpay-mgr`, labelKey: 'nav.rc_set_qrpay_mgr', status: 'todo' },
        { href: `${P}/screens/rc-set-cardreader-mgr`, labelKey: 'nav.rc_set_cardreader_mgr', status: 'todo' },
        { href: `${P}/screens/rc-set-zalooa-mgr`, labelKey: 'nav.rc_set_zalooa_mgr', status: 'todo' },
        { href: `${P}/screens/rc-set-zalooa-payment-dlg`, labelKey: 'nav.rc_set_zalooa_payment_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-zalooa-appointment-dlg`, labelKey: 'nav.rc_set_zalooa_appointment_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-zalopay-qr`, labelKey: 'nav.rc_set_zalopay_qr', status: 'todo' },
        { href: `${P}/screens/rc-set-saledc`, labelKey: 'nav.rc_set_saledc', status: 'todo' },
        { href: `${P}/screens/rc-set-eventset`, labelKey: 'nav.rc_set_eventset', status: 'todo' },
        { href: `${P}/screens/rc-set-favorites`, labelKey: 'nav.rc_set_favorites', status: 'todo' },
        { href: `${P}/screens/rc-set-grpappdlg`, labelKey: 'nav.rc_set_grpappdlg', status: 'todo' },
        { href: `${P}/screens/rc-set-inoutset`, labelKey: 'nav.rc_set_inoutset', status: 'todo' },
        { href: `${P}/screens/rc-set-ordermsg`, labelKey: 'nav.rc_set_ordermsg', status: 'todo' },
        { href: `${P}/screens/rc-set-numpad`, labelKey: 'nav.rc_set_numpad', status: 'todo' },
        { href: `${P}/screens/rc-set-tablemsg`, labelKey: 'nav.rc_set_tablemsg', status: 'todo' },
        { href: `${P}/screens/rc-set-storeinfo`, labelKey: 'nav.rc_set_storeinfo', status: 'todo' },
        { href: `${P}/screens/rc-set-supply-dlg`, labelKey: 'nav.rc_set_supply_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-basic-code`, labelKey: 'nav.rc_set_basic_code', status: 'todo' },
        { href: `${P}/screens/rc-set-datadel`, labelKey: 'nav.rc_set_datadel', status: 'todo' },
        { href: `${P}/screens/rc-set-iniset`, labelKey: 'nav.rc_set_iniset', status: 'todo' },
        { href: `${P}/screens/rc-set-simplereceipt`, labelKey: 'nav.rc_set_simplereceipt', status: 'todo' },
        { href: `${P}/screens/rc-set-selectselldel-dlg`, labelKey: 'nav.rc_set_selectselldel_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-printset-dlg`, labelKey: 'nav.rc_set_printset_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-printbill-dlg`, labelKey: 'nav.rc_set_printbill_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-printrece-dlg`, labelKey: 'nav.rc_set_printrece_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-printreg-dlg`, labelKey: 'nav.rc_set_printreg_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-printmsg-dlg`, labelKey: 'nav.rc_set_printmsg_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-printqr-dlg`, labelKey: 'nav.rc_set_printqr_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-pay-taxref`, labelKey: 'nav.rc_set_pay_taxref', status: 'todo' },
        { href: `${P}/screens/rc-set-pay-taxseller-dlg`, labelKey: 'nav.rc_set_pay_taxseller_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-paycoset-dlg`, labelKey: 'nav.rc_set_paycoset_dlg', status: 'todo' },
        { href: `${P}/screens/rc-set-etcsetv2-dlg`, labelKey: 'nav.rc_set_etcsetv2_dlg', status: 'todo' },
      ],
    },
  ];
}

const statusDot: Record<string, string> = {
  done: 'bg-emerald-400',
  wip: 'bg-amber-400',
  todo: 'bg-gray-300',
};

export default function DesignDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DesignDocsI18nProvider>
      <DesignDocsLayoutInner>{children}</DesignDocsLayoutInner>
    </DesignDocsI18nProvider>
  );
}

function DesignDocsLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { locale, setLocale, t, localeLabels } = useDesignDocsT();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navSections = useMemo(() => buildNavSections(), []);

  const isActive = (href: string) => {
    const clean = (p: string) => (p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p);
    return clean(pathname) === clean(href);
  };

  const activeSectionKey = useMemo(() => {
    for (const section of navSections) {
      if (section.items.some((item) => isActive(item.href))) {
        return section.titleKey;
      }
    }
    return null;
  }, [navSections, pathname]);

  const toggle = (titleKey: string) => {
    setCollapsed((prev) => ({ ...prev, [titleKey]: !prev[titleKey] }));
  };

  const isScreenPage = pathname.includes('/screens/');

  const locales: Locale[] = ['ko', 'en', 'vi'];
  const isConnectedFlowPage = pathname.startsWith(`${P}/screens/connected-flow`);

  useEffect(() => {
    if (!activeSectionKey) return;
    setCollapsed((prev) => {
      if (!prev[activeSectionKey]) return prev;
      return { ...prev, [activeSectionKey]: false };
    });
  }, [activeSectionKey]);

  useEffect(() => {
    const root = sidebarRef.current;
    if (!root) return;

    const raf = window.requestAnimationFrame(() => {
      const active = root.querySelector<HTMLElement>('[data-nav-active="true"]');
      if (!active) return;
      active.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: 'smooth',
      });
    });

    return () => window.cancelAnimationFrame(raf);
  }, [pathname, locale, collapsed, activeSectionKey]);

  if (isConnectedFlowPage) {
    return (
      <div className="h-screen w-full overflow-hidden bg-[#F1F5F9]" style={{ userSelect: 'text', WebkitUserSelect: 'text', cursor: 'auto' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex" style={{ background: '#F1F5F9', userSelect: 'text', WebkitUserSelect: 'text', cursor: 'auto' }}>
      {/* Sidebar */}
      <aside
        className="w-[280px] shrink-0 bg-white border-r border-gray-100 flex flex-col"
        style={{ boxShadow: '2px 0 20px rgba(0,0,0,0.03)' }}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-pos-soft">
              <span className="text-white text-sm font-black tracking-tight">H</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 leading-tight">{t('brand.title')}</div>
              <div className="text-[10px] text-gray-400 font-semibold tracking-[0.1em]">{t('brand.subtitle')}</div>
            </div>
            {/* Language Switcher */}
            <div className="flex items-center gap-0.5">
              {locales.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={`
                    px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase transition-colors duration-150
                    ${locale === l
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}
                  `}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav ref={sidebarRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {navSections.map((section) => {
            const isCollapsed = section.collapsible && collapsed[section.titleKey];
            const doneCount = section.items.filter((i) => i.status === 'done').length;
            const totalCount = section.items.length;

            return (
              <div key={section.titleKey}>
                <button
                  type="button"
                  onClick={() => section.collapsible && toggle(section.titleKey)}
                  className={`
                    w-full flex items-center justify-between px-3 mb-1.5
                    ${section.collapsible ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.08em]">
                    {t(section.titleKey)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {section.items.some((i) => i.status) && (
                      <span className="text-[9px] text-gray-300 tabular-nums">
                        {doneCount}/{totalCount}
                      </span>
                    )}
                    {section.collapsible && (
                      <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none"
                        className={`text-gray-300 transition-transform duration-150 ${isCollapsed ? '-rotate-90' : ''}`}
                      >
                        <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-nav-active={isActive(item.href) ? 'true' : 'false'}
                        className={`
                          flex items-center h-8 px-3 rounded-lg text-[12px] font-medium transition-colors duration-150 gap-2
                          ${isActive(item.href)
                            ? 'bg-primary-50 text-primary-500 font-semibold'
                            : 'text-gray-500'}
                        `}
                      >
                        {item.status && (
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[item.status]}`} />
                        )}
                        <span className="truncate">{t(item.labelKey)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-50 shrink-0">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {t('status.done')}
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-2" /> {t('status.wip')}
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-2" /> {t('status.todo')}
            </div>
            <span>{isScreenPage ? t('preview.fixed_size') : t('preview.free_size')}</span>
          </div>
        </div>
      </aside>

      {/* Preview Area */}
      {isScreenPage ? (
        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
          <div className="absolute top-5 left-8 flex items-center gap-3">
            <span className="text-[11px] font-medium text-gray-400 tracking-wide">{t('preview.screen_preview')}</span>
            <span className="text-[11px] text-gray-300">1024 × 768</span>
          </div>
          <main
            className="bg-white overflow-hidden relative shrink-0"
            style={{
              width: 1024,
              height: 768,
              boxShadow: '0 4px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
            }}
          >
            {children}
          </main>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <main className="min-h-full p-8">
            {children}
          </main>
        </div>
      )}
    </div>
  );
}
