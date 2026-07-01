import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const navItems = [
  { path: '/', label: 'Bugun', icon: '📅', shortLabel: 'Bugun' },
  { path: '/oylik', label: 'Oylik', icon: '📊', shortLabel: 'Oylik' },
  { path: '/muhim', label: 'Muhim', icon: '⭐', shortLabel: 'Muhim' },
  { path: '/tarix', label: 'Tarix', icon: '📋', shortLabel: 'Tarix' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          Xarajat<span>Pro</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          {user ? (
            <>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name || user.email}</div>
                <div className="sidebar-user-email">{user.email}</div>
              </div>
              <button className="btn-logout" onClick={logout}>Chiqish</button>
            </>
          ) : (
            <div className="sidebar-guest">
              <span>Mehmon rejimi</span>
              <button className="btn-logout" onClick={() => setShowLogin(true)}>Kirish</button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="mobile-header">
        <span className="mobile-logo">Xarajat<span>Pro</span></span>
        {user ? (
          <button className="mobile-user-btn" onClick={logout}>
            {user.name || user.email.split('@')[0]} · Chiqish
          </button>
        ) : (
          <button className="mobile-user-btn active" onClick={() => setShowLogin(true)}>
            Kirish
          </button>
        )}
      </header>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.shortLabel}</span>
          </NavLink>
        ))}
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
