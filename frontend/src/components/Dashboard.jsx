import React, { useState, useEffect } from 'react';
import api from '../api';
import { Users, Star, Package, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass stat-card">
    <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
      <Icon size={24} />
    </div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
    <style dangerouslySetInnerHTML={{ __html: `
      .stat-card {
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stat-info h3 {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 2px;
      }
      .stat-info p {
        color: var(--text-secondary);
        font-size: 0.85rem;
        margin: 0;
      }
    `}} />
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="fade-in">Loading stats...</div>;

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <StatCard 
          title="Total Users" 
          value={stats?.total_users || 0} 
          icon={Users} 
          color="#38bdf8" 
        />
        <StatCard 
          title="Active Premium" 
          value={stats?.active_premium || 0} 
          icon={Star} 
          color="#fcd34d" 
        />
        <StatCard 
          title="Items Tracked" 
          value={stats?.items_tracked || 0} 
          icon={Package} 
          color="#818cf8" 
        />
        <StatCard 
          title="Stars Collected" 
          value={stats?.stars_collected || 0} 
          icon={TrendingUp} 
          color="#22c55e" 
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (min-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
        }
      `}} />
    </div>
  );
};

export default Dashboard;
