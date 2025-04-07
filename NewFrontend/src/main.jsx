import { StrictMode } from 'react'
import React from 'react';  // ✅ Import React
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { StudentContextProvider } from './components/Student/StudentContextProvider.jsx';


createRoot(document.getElementById('root')).render(

  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <StudentContextProvider>
        <App />
        </StudentContextProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)
