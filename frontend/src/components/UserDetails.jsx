import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCircle, Shield, ShieldAlert, Calendar, ArrowLeft, Crown, X, Clock, Infinity } from 'lucide-react';
import api from '../api';

// ─── Duration options for premium grant ───────────────────────────────────────
const DURATION_OPTIONS = [
  { label: '7 дней',    days: 7,   icon: '📅' },
  { label: '1 месяц',   days: 30,  icon: '🗓️' },
  { label: '3 месяца',  days: 90,  icon: '📆' },
  { label: '6 месяцев', days: 180, icon: '🗂️' },
  { label: '1 год',     days: 365, icon: '🎯' },
  { label: 'Навсегда',  days: null, icon: '♾️' },
];

// ─── Premium Grant Modal ───────────────────────────────────────────────────────
const PremiumModal = ({ userId, onClose, onSuccess }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGrant = async () => {
    if (selected === undefined) return;
    setLoading(true);
    try {
      await api.post(`/users/${userId}/premium/grant`, { days: selected });
      onSuccess();
      onClose();
    } catch {
      alert('Ошибка при выдаче премиума');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()} className="fade-in">
        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crown size={22} color="#fbbf24" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Выдать Премиум</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Выберите срок действия подписки:
        </p>

        {/* Duration grid */}
        <div style={styles.durationGrid}>
          {DURATION_OPTIONS.map(opt => {
            const isSelected = selected === opt.days;
            return (
              <button
                key={opt.label}
                onClick={() => setSelected(opt.days)}
                style={{
                  ...styles.durationBtn,
                  ...(isSelected ? styles.durationBtnSelected : {}),
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{opt.icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Confirm */}
        <button
          onClick={handleGrant}
          disabled={selected === undefined || loading}
          style={{
            ...styles.confirmBtn,
            opacity: (selected === undefined || loading) ? 0.5 : 1,
            cursor: (selected === undefined || loading) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Выдаём...' : selected === null ? '♾️ Выдать Навсегда' : `👑 Выдать на ${DURATION_OPTIONS.find(o => o.days === selected)?.label}`}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchUser(); }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokePremium = async () => {
    if (!window.confirm('Отменить Premium у пользователя?')) return;
    setActionLoading(true);
    try {
      await api.post(`/users/${id}/premium/revoke`);
      await fetchUser();
    } catch {
      alert('Ошибка при отмене премиума');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBan = async () => {
    setActionLoading(true);
    try {
      await api.post(`/users/${id}/ban`);
      await fetchUser();
    } catch {
      alert('Ошибка при блокировке');
    } finally {
      setActionLoading(false);
    }
  };

  const formatExpiry = (dateStr) => {
    if (!dateStr) return 'Навсегда ♾️';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Загрузка...</div>;
  if (!user)   return <div className="flex-center" style={{ height: '100vh' }}>Пользователь не найден</div>;

  return (
    <div className="fade-in">
      {/* Premium grant modal */}
      {showPremiumModal && (
        <PremiumModal
          userId={id}
          onClose={() => setShowPremiumModal(false)}
          onSuccess={fetchUser}
        />
      )}

      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <button
          className="nav-item"
          onClick={() => navigate(-1)}
          style={{ flexDirection: 'row', gap: '5px', color: 'var(--primary)' }}
        >
          <ArrowLeft size={18} /> Назад
        </button>
        <h2 style={{ fontSize: '1.2rem' }}>Профиль</h2>
        <div style={{ width: '50px' }} />
      </div>

      {/* User card */}
      <div className="glass" style={{ padding: '25px', textAlign: 'center' }}>
        <div style={styles.avatarWrap}>
          <UserCircle size={64} color="var(--primary)" />
        </div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
          {user.first_name} {user.last_name || ''}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          @{user.username || 'n/a'}
        </p>

        {/* Info grid */}
        <div className="grid" style={{ textAlign: 'left', gap: '15px' }}>
          {/* Premium status */}
          <div className="flex" style={{ gap: '10px' }}>
            <div style={{ color: user.is_premium ? '#fbbf24' : 'var(--primary)' }}>
              <Crown size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Подписка</div>
              <div style={{ color: user.is_premium ? '#fbbf24' : 'white', fontWeight: 600 }}>
                {user.is_premium ? 'Premium ✓' : 'Обычный'}
              </div>
              {user.is_premium && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                  До: {formatExpiry(user.premium_expires_at)}
                </div>
              )}
            </div>
          </div>

          {/* Ban status */}
          <div className="flex" style={{ gap: '10px' }}>
            <div style={{ color: user.is_banned ? 'var(--danger)' : 'var(--success)' }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Аккаунт</div>
              <div style={{ color: user.is_banned ? 'var(--danger)' : 'white' }}>
                {user.is_banned ? 'ЗАБЛОКИРОВАН' : 'Активен'}
              </div>
            </div>
          </div>

          {/* Registration date */}
          <div className="flex" style={{ gap: '10px' }}>
            <div style={{ color: 'var(--primary)' }}><Calendar size={20} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Регистрация</div>
              <div>{new Date(user.created_at).toLocaleDateString('ru-RU')}</div>
            </div>
          </div>

          {/* User ID */}
          <div className="flex" style={{ gap: '10px' }}>
            <div style={{ color: 'var(--primary)' }}><Shield size={20} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{user.id}</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {user.is_premium ? (
            /* Premium is ACTIVE → show revoke + extend buttons */
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, borderColor: '#fbbf24', color: '#fbbf24' }}
                onClick={() => setShowPremiumModal(true)}
                disabled={actionLoading}
              >
                ⏳ Продлить
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={handleRevokePremium}
                disabled={actionLoading}
              >
                👑 Отозвать
              </button>
            </div>
          ) : (
            /* Premium is NOT active → show grant button */
            <button
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#000' }}
              onClick={() => setShowPremiumModal(true)}
              disabled={actionLoading}
            >
              👑 Дать Премиум
            </button>
          )}

          {/* Ban toggle */}
          <button
            className={`btn ${user.is_banned ? 'btn-primary' : 'btn-danger'}`}
            onClick={handleToggleBan}
            disabled={actionLoading}
          >
            {user.is_banned ? '✅ Разблокировать' : '🚫 Заблокировать'}
          </button>
        </div>
      </div>

      {/* Activity history */}
      <div className="glass" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>История активности</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {user.history && user.history.map((item, idx) => (
            <div
              key={idx}
              style={{ padding: '10px', borderLeft: '2px solid var(--primary)', background: 'rgba(255,255,255,0.03)' }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.event}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {new Date(item.date).toLocaleString('ru-RU')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Inline styles ─────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0 12px 12px',
  },
  modal: {
    background: '#1e293b',
    border: '1px solid rgba(251,191,36,0.25)',
    borderRadius: '20px',
    padding: '24px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 -8px 40px rgba(251,191,36,0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: 'none',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
  },
  durationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '18px',
  },
  durationBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '14px 8px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  durationBtnSelected: {
    background: 'rgba(251,191,36,0.15)',
    border: '1px solid rgba(251,191,36,0.6)',
    boxShadow: '0 0 14px rgba(251,191,36,0.2)',
  },
  confirmBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    color: '#000',
    border: 'none',
    borderRadius: '14px',
    fontWeight: 700,
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  avatarWrap: {
    display: 'inline-block',
    padding: '10px',
    background: 'rgba(56, 189, 248, 0.1)',
    borderRadius: '50%',
    marginBottom: '15px',
  },
};

export default UserDetails;
