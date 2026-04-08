import React, { useState } from 'react';
import api from '../api';
import { RefreshCw, Megaphone, Zap, AlertTriangle } from 'lucide-react';

const System = () => {
  const [broadcast, setBroadcast] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = (endpoint, message, body = {}) => {
    if (!confirm(message)) return;
    setLoading(true);
    api.post(endpoint, body)
      .then(res => {
        alert(res.data.status || 'Success');
        setLoading(false);
      })
      .catch(err => {
        alert('Error: ' + err.message);
        setLoading(false);
      });
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcast.trim()) return;
    handleAction('/broadcast', 'Send this message to all users?', { message: broadcast });
    setBroadcast('');
  };

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>System Controls</h2>

      <div className="glass section-card">
        <div className="section-header">
          <Zap size={20} color="#fcd34d" />
          <h3>Quick Actions</h3>
        </div>
        <div className="action-buttons">
          <button 
            onClick={() => handleAction('/system/trigger-parser', 'Trigger manual parsing cycle?')}
            className="btn btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
            Run Parser
          </button>
          
          <button 
            onClick={() => handleAction('/system/restart', 'Restart the Telegram Bot service?')}
            className="btn btn-danger"
            disabled={loading}
          >
            <RefreshCw size={18} />
            Restart Bot
          </button>
        </div>
      </div>

      <div className="glass section-card">
        <div className="section-header">
          <Megaphone size={20} color="#38bdf8" />
          <h3>Broadcast Message</h3>
        </div>
        <p className="section-desc">Send a notification to all bot users.</p>
        <form onSubmit={handleBroadcast}>
          <textarea 
            className="input textarea" 
            placeholder="Type your message here..."
            value={broadcast}
            onChange={(e) => setBroadcast(e.target.value)}
            rows={4}
          />
          <button type="submit" className="btn btn-primary broadcast-btn" disabled={loading || !broadcast.trim()}>
            Send Broadcast
          </button>
        </form>
      </div>

      <div className="glass danger-zone">
        <div className="section-header">
          <AlertTriangle size={20} color="#ef4444" />
          <h3>Danger Zone</h3>
        </div>
        <p className="section-desc">Critical operations that might affect bot availability.</p>
        <button className="btn btn-danger w-full">Shutdown Services</button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
        }
        .textarea {
          resize: none;
          margin-bottom: 12px;
          font-family: inherit;
        }
        .broadcast-btn {
          width: 100%;
        }
        .danger-zone {
          padding: 20px;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }
        .w-full { width: 100%; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default System;
