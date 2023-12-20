import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AppTheme } from './theme/AppTheme'
import './index.css'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppTheme>
      <App />
    </AppTheme>
  </React.StrictMode>,
)
