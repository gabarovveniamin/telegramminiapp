import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Star, Calendar, Package, Users as UsersIcon } from 'lucide-react';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [premiumDays, setPremiumDays] = useState(30);

  useEffect(() => {
    api.get(`/users/${id}`)
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const grantPremium = (days = null) => {
    api.post(`/users/${id}/premium`, { days })
      .then(() => {
        alert(`Premium granted!`);
        window.location.reload();
      })
      .catch(err => alert('Error: ' + err.message));
  };

  const revokePremium = () => {
    api.delete(`/users/${id}/premium`)
      .then(() => {
        alert('Premium revoked');
        window.location.reload();
      })
      .catch(err => alert('Error: ' + err.message));
  };

  if (loading) return <div className="fade-in">Loading user details...</div>;
  if (!user) return <div className="fade-in">User not found.</div>;

  return (
    <div className="fade-in">
      <button onClick={() => navigate('/users')} className="btn btn-secondary back-btn">
        <ChevronLeft size={18} /> Back to Users
      </button>

      <div className="glass profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.username ? user.username[0].toUpperCase() : '?'}
          </div>
          <div className="profile-meta">
            <h2>@{user.username || 'unknown'}</h2>
            <p>ID: {user.user_id}</p>
          </div>
          {user.is_active ? (
            <span className="badge badge-premium">Premium</span>
          ) : (
            <span className="badge badge-free">Free</span>
          )}
        </div>

        <div className="profile-stats">
          <div className="p-stat">
            <span className="p-label">Joined</span>
            <span className="p-value">{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="p-stat">
            <span className="p-label">Threshold</span>
            <span className="p-value">{user.discount_threshold}%</span>
          </div>
        </div>
      </div>

      <div className="glass section-card">
        <h3>Premium Management</h3>
        <p className="section-desc">Manage subscription status for this user.</p>
        
        {user.is_active && user.expires_at && (
          <div className="expiry-info">
            <Calendar size={16} />
            <span>Expires: {new Date(user.expires_at).toLocaleDateString()}</span>
          </div>
        )}

        <div className="action-grid">
          <div className="grant-action">
            <input 
              type="number" 
              className="input day-input" 
              value={premiumDays} 
              onChange={(e) => setPremiumDays(e.target.value)}
              placeholder="Days"
            />
            <button onClick={() => grantPremium(parseInt(premiumDays))} className="btn btn-primary">
              Grant Days
            </button>
          </div>
          <button onClick={() => grantPremium(null)} className="btn btn-primary">
            Grant Lifetime
          </button>
          {user.is_active && (
            <button onClick={revokePremium} className="btn btn-danger">
              Revoke Premium
            </button>
          )}
        </div>
      </div>

      <div className="glass section-card">
        <h3>Tracked Items ({user.tracked_items?.length || 0})</h3>
        <div className="item-list">
          {user.tracked_items?.map(item => (
            <div key={item.item_id} className="tracked-item">
              <span className="item-name">{item.name}</span>
              <span className="item-price">{item.current_price} KZT</span>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .back-btn {
          margin-bottom: 20px;
          padding: 8px 12px;
        }
        .profile-card {
          padding: 24px;
          margin-bottom: 20px;
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: var(--primary);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
        }
        .profile-meta h2 {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }
        .profile-meta p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0;
        }
        .profile-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }
        .p-stat {
          display: flex;
          flex-direction: column;
        }
        .p-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .p-value {
          font-weight: 600;
        }
        .section-card {
          padding: 20px;
          margin-bottom: 20px;
        }
        .section-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        .expiry-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: rgba(56, 189, 248, 0.1);
          border-radius: 8px;
          color: var(--primary);
          font-size: 0.9rem;
          margin-bottom: 16px;
        }
        .action-grid {
          display: grid;
          gap: 12px;
        }
        .grant-action {
          display: flex;
          gap: 10px;
        }
        .day-input {
          width: 100px;
        }
        .item-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tracked-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }
        .item-name {
          font-size: 0.9rem;
        }
        .item-price {
          font-weight: 600;
          color: var(--success);
        }
      `}} />
    </div>
  );
};

export default UserDetails;
