import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import DailyPage from './pages/DailyPage';
import MonthlyPage from './pages/MonthlyPage';
import EssentialsPage from './pages/EssentialsPage';
import TransactionsPage from './pages/TransactionsPage';
import './styles/global.css';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DailyPage />} />
            <Route path="/monthly" element={<MonthlyPage />} />
            <Route path="/essentials" element={<EssentialsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
