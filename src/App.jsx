import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RefreshProvider } from './context/RefreshContext';
import Sidebar from './components/Sidebar';
import TopStatsBar from './components/TopStatsBar';
import DailyPage from './pages/DailyPage';
import MonthlyPage from './pages/MonthlyPage';
import EssentialsPage from './pages/EssentialsPage';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/LoginPage';
import './styles/global.css';

function AppContent() {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <LoginPage />;
  }

  return (
    <RefreshProvider>
      <BrowserRouter>
        <div className="layout">
          <Sidebar />
          <main className="main-content">
            <TopStatsBar />
            <Routes>
              <Route path="/" element={<DailyPage />} />
              <Route path="/monthly" element={<MonthlyPage />} />
              <Route path="/essentials" element={<EssentialsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </RefreshProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
