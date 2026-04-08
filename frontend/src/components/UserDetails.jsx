import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCircle, Shield, ShieldAlert, Calendar, Mail, ArrowLeft } from 'lucide-react';
import api from '../api';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

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

  const togglePremium = async () => {
    try {
      await api.post(`/users/${id}/premium`);
      fetchUser();
    } catch (error) {
      alert('Ошибка при изменении статуса');
    }
  };

  const toggleBan = async () => {
    try {
      await api.post(`/users/${id}/ban`);
      fetchUser();
    } catch (error) {
      alert('Ошибка при блокировке');
    }
  };

  if (loading) return <div className="flex-center" style={{height: '100vh'}}>Загрузка...</div>;
  if (!user) return <div className="flex-center" style={{height: '100vh'}}>Пользователь не найден</div>;

  return (
    <div className="fade-in">
      <div className="flex-between" style={{ marginBottom: '20px' }}>
        <button className="nav-item" onClick={() => navigate(-1)} style={{ flexDirection: 'row', gap: '5px', color: 'var(--primary)' }}>
          <ArrowLeft size={18} /> Назад
        </button>
        <h2 style={{ fontSize: '1.2rem' }}>Профиль</h2>
        <div style={{ width: '50px' }}></div>
      </div>

      <div className="glass" style={{ padding: '25px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '10px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', marginBottom: '15px' }}>
          <UserCircle size={64} color="var(--primary)" />
        </div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{user.first_name} {user.last_name || ''}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>@{user.username || 'n/a'}</p>

        <div className="grid" style={{ textAlign: 'left', gap: '15px' }}>
          <div className="flex" style={{ gap: '10px' }}>
            <div style={{ color: 'var(--primary)' }}><Shield size={20} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Статус подписки</div>
              <div style={{ color: user.is_premium ? 'var(--success)' : 'white' }}>
                {user.is_premium ? 'Premium Active' : 'Regular User'}
              </div>
            </div>
          </div>

          <div className="flex" style={{ gap: '10px' }}>
            <div style={{ color: user.is_banned ? 'var(--danger)' : 'var(--success)' }}><ShieldAlert size={20} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Состояние аккаунта</div>
              <div style={{ color: user.is_banned ? 'var(--danger)' : 'white' }}>
                {user.is_banned ? 'ЗАБЛОКИРОВАН' : 'Активен'}
              </div>
            </div>
          </div>

          <div className="flex" style={{ gap: '10px' }}>
            <div style={{ color: 'var(--primary)' }}><Calendar size={20} /></div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Дата регистрации</div>
              <div>{new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className={`btn ${user.is_premium ? 'btn-secondary' : 'btn-primary'}`}
            onClick={togglePremium}
          >
            {user.is_premium ? '👑 Отменить Премиум' : '👑 Дать Премиум'}
          </button>
          
          <button 
            className={`btn ${user.is_banned ? 'btn-primary' : 'btn-danger'}`}
            onClick={toggleBan}
          >
            {user.is_banned ? '✅ Разблокировать' : '🚫 Заблокировать'}
          </button>
        </div>
      </div>

      <div className="glass" style={{ padding: '20px', marginTop: '20px' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>История активности</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {user.history && user.history.map((item, idx) => (
            <div key={idx} style={{ padding: '10px', borderLeft: '2px solid var(--primary)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.event}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {new Date(item.date).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
