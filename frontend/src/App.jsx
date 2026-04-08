import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, UserCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import UserDetails from './components/UserDetails';
import System from './components/System';

function App() {
  const [tg, setTg] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tgApp = window.Telegram.WebApp;
      tgApp.ready();
      tgApp.expand();
      setTg(tgApp);
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/system" element={<System />} />
        </Routes>

        <nav className="bottom-nav">
          <Link to="/" className="nav-item">
            <LayoutDashboard size={20} />
            <span>Обзор</span>
          </Link>
          <Link to="/users" className="nav-item">
            <Users size={20} />
            <span>Юзеры</span>
          </Link>
          <Link to="/system" className="nav-item">
            <Settings size={20} />
            <span>Система</span>
          </Link>
        </nav>
      </div>
    </Router>
  );
}

export default App;
