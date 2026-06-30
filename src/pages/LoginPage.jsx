import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://xarajat-backend.vercel.app/api';

export default function LoginPage() {
  const { login, continueAsGuest } = useAuth();
  const [tab, setTab] = useState('welcome'); // 'welcome' | 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload = tab === 'login'
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name };

      const res = await axios.post(`${API}${endpoint}`, payload);
      login(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Xatolik yuz berdi');
    }
    setLoading(false);
  };

  if (tab === 'welcome') {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo-icon">💰</span>
            <span className="auth-logo-text">Xarajat<span>Pro</span></span>
          </div>
          <p className="auth-tagline">Daromad va xarajatlaringizni oson kuzating</p>

          <div className="auth-buttons">
            <button className="btn btn-primary auth-btn" onClick={() => setTab('login')}>
              Kirish
            </button>
            <button className="btn btn-outline auth-btn" onClick={() => setTab('register')}>
              Ro'yxatdan o'tish
            </button>
          </div>

          <div className="auth-divider">
            <span>yoki</span>
          </div>

          <button className="btn btn-ghost auth-btn" onClick={continueAsGuest}>
            Mehmon sifatida davom etish
          </button>
          <p className="auth-guest-note">
            Mehmon rejimida ma'lumotlar faqat bu qurilmada saqlanadi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <button className="auth-back" onClick={() => { setTab('welcome'); setError(''); }}>
          ← Orqaga
        </button>

        <div className="auth-logo">
          <span className="auth-logo-text">Xarajat<span>Pro</span></span>
        </div>
        <h2 className="auth-title">
          {tab === 'login' ? 'Akkauntga kirish' : 'Yangi akkount ochish'}
        </h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleAuth}>
          {tab === 'register' && (
            <div className="form-group">
              <label>Ismingiz (ixtiyoriy)</label>
              <input
                className="form-control"
                type="text"
                placeholder="Ismingiz"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              placeholder="email@misol.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Parol</label>
            <input
              className="form-control"
              type="password"
              placeholder={tab === 'register' ? 'Kamida 6 ta belgi' : 'Parolingiz'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? 'Yuklanmoqda...' : (tab === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish')}
          </button>
        </form>

        <button
          className="auth-switch-link"
          onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
        >
          {tab === 'login' ? 'Akkountingiz yo\'qmi? Ro\'yxatdan o\'ting' : 'Akkauntingiz bormi? Kiring'}
        </button>
      </div>
    </div>
  );
}
