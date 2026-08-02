import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ChallengeDataProvider } from './context/ChallengeDataContext.jsx'
import ErrorBoundary from './components/layout/ErrorBoundary.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            {/*
              ChallengeDataProvider sits INSIDE AuthProvider (needs the user)
              but OUTSIDE the router's <Routes> (so it never unmounts during
              navigation). Data is fetched once per login session and shared
              by every page via useChallengeData() without re-fetching.
            */}
            <ChallengeDataProvider>
              <App />
            </ChallengeDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
