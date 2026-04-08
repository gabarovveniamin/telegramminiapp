import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCircle, ChevronRight, UserMinus } from 'lucide-react';
import api from '../api';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.username?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.first_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    user.id.toString().includes(search)
  );

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>Управление пользователями</h2>
      
      <div className="search-bar glass" style={{ marginBottom: '20px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Поиск по имени, @username или ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }}
        />
      </div>

      <div className="user-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка списка...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Никого не нашли</div>
        ) : (
          filteredUsers.map(user => (
            <div 
              key={user.id} 
              className="glass card" 
              style={{ padding: '15px', marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => navigate(`/users/${user.id}`)}
            >
              <div style={{ marginRight: '15px' }}>
                <UserCircle size={40} color={user.is_premium ? 'var(--primary)' : 'var(--text-secondary)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{user.first_name} {user.last_name || ''}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  @{user.username || 'n/a'} • ID: {user.id}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user.is_banned && <div style={{ color: 'var(--danger)', fontSize: '0.7rem', fontWeight: 'bold' }}>BLOCK</div>}
                {user.is_premium && <div style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 'bold' }}>👑</div>}
                <ChevronRight size={20} color="var(--text-secondary)" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
