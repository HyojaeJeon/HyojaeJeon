import '@styles/globals.css';
import StoreProvider from '@providers/StoreProvider';
import PosRealTimeReceiver from '@providers/PosRealTimeReceiver';
import { PosI18nProvider } from '@i18n/PosI18nProvider';

export const metadata = {};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <StoreProvider>
          <PosI18nProvider locale="ko">
            <PosRealTimeReceiver>
              <div id="pos-root" style={{ width: 1024, height: 768, position: 'relative', overflow: 'hidden' }}>
                {children}
              </div>
            </PosRealTimeReceiver>
          </PosI18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
