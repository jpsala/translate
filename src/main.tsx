import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AppTheme } from './theme/AppTheme'
import { BrowserRouter } from 'react-router-dom'
import './index.css'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppTheme>
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </AppTheme>
  </React.StrictMode>,
)
