import React from 'react';

import ReactDOM from 'react-dom/client';
// import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/js/bootstrap.bundle.min.js";


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // Removed StrictMode to prevent double rendering in development
  // Note: This eliminates helpful development warnings but prevents double rendering
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
