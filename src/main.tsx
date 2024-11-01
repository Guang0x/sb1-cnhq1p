import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App';
import WalletProvider from './components/WalletProvider';
import './index.css';
import '@solana/wallet-adapter-react-ui/styles.css';

// Polyfills
window.Buffer = Buffer;
window.global = window;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </StrictMode>
);