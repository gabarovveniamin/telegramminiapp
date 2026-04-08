import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Bell, ChevronLeft } from 'lucide-react';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import UserDetails from './components/UserDetails';
import System from './components/System';

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

function App() {
  const [tg, setTg] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let attempts = 0;
    const initTg = () => {
      api.interceptors.request.use((config) => {
        const tg = window.Telegram?.WebApp;
        if (tg?.initData) {
          config.headers['X-Telegram-Init-Data'] = tg.initData;
        } else {
          console.warn('API call without Telegram initData');
        }
        return config;
      });
      
      attempts++;
      const tgApp = window.Telegram?.WebApp;
      
      // If we have initData, we are definitely in Telegram
      if (tgApp && tgApp.initData) {
        tgApp.ready();
        tgApp.expand();
        setTg(tgApp);
        setIsLoading(false);
      } 
      // If we've tried for 3 seconds and no data, we are probably in a normal browser
      else if (attempts > 30) { 
        setIsLoading(false);
        setIsAuthorized(false); 
      }
      else {
        setTimeout(initTg, 100);
      }
    };
    initTg();

    const handleUnauthorized = () => {
      setIsAuthorized(false);
      setIsLoading(false);
    };
    window.addEventListener('unauthorized-access', handleUnauthorized);
    return () => window.removeEventListener('unauthorized-access', handleUnauthorized);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-center" style={{ height: '100vh', color: 'var(--text-secondary)' }}>
        Загрузка панели...
      </div>
    );
  }

  if (!isAuthorized) {
    const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'неизвестен';
    const initDataExists = !!window.Telegram?.WebApp?.initData;
    
    return (
      <div className="flex-center fade-in" style={{ height: '100vh', padding: '20px', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '30px' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '10px' }}>Доступ ограничен</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ваш ID: <b>{userId}</b><br/>
            Связь с Telegram: <b>{initDataExists ? 'ЕСТЬ' : 'НЕТ'}</b>
          </p>
          <p style={{ fontSize: '0.8em', marginTop: '10px', opacity: 0.7 }}>
            Если связи нет, попробуйте перезайти в бота.
          </p>
          <button onClick={() => window.Telegram?.WebApp?.close()} className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1>Bot Admin</h1>
            <div className="user-pill">
              {tg?.initDataUnsafe?.user?.username || 'Admin'}
            </div>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/:id" element={<UserDetails />} />
            <Route path="/system" element={<System />} />
          </Routes>
        </main>

        <nav className="bottom-nav glass">
          <NavItem to="/" icon={LayoutDashboard} label="Stats" />
          <NavItem to="/users" icon={Users} label="Users" />
          <NavItem to="/system" icon={Settings} label="System" />
        </nav>

        <style dangerouslySetInnerHTML={{ __html: `
          .app-container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            padding-bottom: 80px;
          }
          .app-header {
            padding: 20px;
            padding-top: max(20px, env(safe-area-inset-top));
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .user-pill {
            background: rgba(255, 255, 255, 0.1);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
          }
          .content {
            padding: 0 20px;
            flex: 1;
          }
          .bottom-nav {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-around;
            padding: 12px;
            z-index: 1000;
          }
          .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.75rem;
            font-weight: 500;
            transition: color 0.2s;
          }
          .nav-item.active {
            color: var(--primary);
          }
        `}} />
      </div>
    </Router>
  );
}

export default App;
