import '@styles/globals.css';
import StoreProvider from '@providers/StoreProvider';
import PosRealTimeReceiver from '@providers/PosRealTimeReceiver';

export const metadata = {
  title: 'HyojungPOS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <StoreProvider>
          <PosRealTimeReceiver>
            <div id="pos-root" style={{ width: 1024, height: 768, position: 'relative', overflow: 'hidden' }}>
              {children}
            </div>
          </PosRealTimeReceiver>
        </StoreProvider>
      </body>
    </html>
  );
}
