import ComponentPreviewClient from '../ComponentPreviewClient';

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    // Atoms
    { slug: 'button' },
    { slug: 'icon' },
    { slug: 'text-input' },
    { slug: 'number-input' },
    { slug: 'label' },
    { slug: 'badge' },
    { slug: 'checkbox' },
    { slug: 'radio' },
    { slug: 'toggle' },
    { slug: 'spinner' },
    { slug: 'skeleton' },
    { slug: 'divider' },
    // Molecules
    { slug: 'numpad' },
    { slug: 'amount-input' },
    { slug: 'stepper' },
    { slug: 'search-bar' },
    { slug: 'form-field' },
    { slug: 'toast' },
    { slug: 'alert' },
    { slug: 'tabs' },
    { slug: 'dropdown' },
    { slug: 'chip' },
    { slug: 'date-picker' },
    { slug: 'progress-bar' },
    // Organisms
    { slug: 'table-card' },
    { slug: 'menu-card' },
    { slug: 'order-sidebar' },
    { slug: 'takeout-bar' },
    { slug: 'header' },
    { slug: 'navigation-bar' },
    { slug: 'category-bar' },
    { slug: 'menu-grid' },
    { slug: 'order-item-list' },
    { slug: 'table-grid' },
    { slug: 'floor-selector' },
    { slug: 'payment-method-selector' },
    { slug: 'keypad-panel' },
    { slug: 'summary-panel' },
    { slug: 'modal' },
    { slug: 'confirm-dialog' },
    { slug: 'drawer' },
    { slug: 'receipt-preview' },
    { slug: 'customer-info-panel' },
    { slug: 'employee-selector' },
    { slug: 'device-status' },
    { slug: 'kitchen-display' },
    // POS Specialized
    { slug: 'option-selector' },
    { slug: 'payment-status' },
    { slug: 'change-calculator' },
    { slug: 'discount-calculator' },
    { slug: 'qr-code-display' },
    { slug: 'signature-pad' },
    { slug: 'error-recovery' },
    { slug: 'void-receipt' },
    // Templates
    { slug: 'pos-main-layout' },
    { slug: 'split-panel-layout' },
    { slug: 'fullscreen-modal' },
  ];
}

export default async function ComponentPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ComponentPreviewClient slug={slug} />;
}
