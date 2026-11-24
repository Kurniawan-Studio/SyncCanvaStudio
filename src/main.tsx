// Shim for libraries (yjs/y-webrtc) that expect a Node.js-like `global`.
// Must run before any other import.
(window as unknown as { global: Window }).global ||= window;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element "#root" was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
