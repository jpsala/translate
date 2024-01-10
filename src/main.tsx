import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AppTheme } from './theme/AppTheme'
import { HashRouter } from 'react-router-dom';
import './index.css'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppTheme>
      <HashRouter>
          <App />
      </HashRouter>
    </AppTheme>
  </React.StrictMode>,
)
