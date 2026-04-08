import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Zap, Bell, AlertTriangle } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    active_premium: 0,
    daily_new_users: 0,
    total_broadcasts: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>Обзор системы</h2>
      
      <div className="grid">
        <div className="glass card">
          <div className="flex" style={{ gap: '10px', marginBottom: '10px' }}>
            <div style={{ color: 'var(--primary)' }}><Users size={20} /></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Всего пользователей</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.total_users}</div>
        </div>

        <div className="glass card">
          <div className="flex" style={{ gap: '10px', marginBottom: '10px' }}>
            <div style={{ color: 'var(--success)' }}><Zap size={20} /></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Premium подписки</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.active_premium}</div>
        </div>

        <div className="glass card">
          <div className="flex" style={{ gap: '10px', marginBottom: '10px' }}>
            <div style={{ color: 'var(--primary)' }}><Users size={20} /></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Новых за сегодня</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.daily_new_users}</div>
        </div>

        <div className="glass card">
          <div className="flex" style={{ gap: '10px', marginBottom: '10px' }}>
            <div style={{ color: 'var(--warning)' }}><Bell size={20} /></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Рассылок сделано</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.total_broadcasts}</div>
        </div>
      </div>

      <div className="glass card" style={{ marginTop: '20px', padding: '20px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} color="var(--primary)" />
          Последние события
        </h3>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Бот работает стабильно. Все системы в норме.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
