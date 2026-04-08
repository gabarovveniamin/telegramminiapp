import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Search, ChevronRight, Star } from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = (search = '') => {
    setLoading(true);
    api.get(`/users?query=${search}`)
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(query);
  };

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>User Management</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by username or ID..." 
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="user-list">
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map(user => (
            <Link key={user.user_id} to={`/users/${user.user_id}`} className="glass user-item">
              <div className="user-avatar">
                {user.username ? user.username[0].toUpperCase() : '?'}
              </div>
              <div className="user-info">
                <div className="user-header">
                  <span className="username">@{user.username || 'unknown'}</span>
                  {user.is_active && <Star size={14} className="star-icon" />}
                </div>
                <span className="user-id">ID: {user.user_id}</span>
              </div>
              <ChevronRight size={20} className="chevron" />
            </Link>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .search-form {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
        }
        .input-wrapper {
          position: relative;
          flex: 1;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }
        .input-wrapper .input {
          padding-left: 40px;
        }
        .user-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .user-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          text-decoration: none;
          color: inherit;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin-right: 12px;
        }
        .user-info {
          flex: 1;
        }
        .user-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .username {
          font-weight: 600;
          font-size: 1rem;
        }
        .star-icon {
          color: #fcd34d;
          fill: #fcd34d;
        }
        .user-id {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .chevron {
          color: var(--text-secondary);
        }
      `}} />
    </div>
  );
};

export default UserList;
