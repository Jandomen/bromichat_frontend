import { Buffer } from 'buffer';
import * as process from 'process';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { UIProvider } from './context/UIContext';
import { CallProvider } from './context/CallContext';

// Polyfills para compatibilidad con simple-peer (WebRTC)
// Se colocan inmediatamente después de los imports para cumplir con ESLint
window.Buffer = Buffer;
window.process = process;
window.global = window;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UIProvider>
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  </UIProvider>
);
