import React, { useState } from 'react';
import { Settings, Play, RefreshCw, Send, Power, ShieldAlert } from 'lucide-react';
import api from '../api';

const System = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleRestart = async () => {
    if (window.confirm('Вы уверены, что хотите перезагрузить бэкенд?')) {
      try {
        await api.post('/api/system/restart');
        alert('Запрос на перезагрузку отправлен. Страница обновится автоматически через 3 секунды.');
        setTimeout(() => window.location.reload(), 3000);
      } catch (error) {
        alert('Ошибка при перезагрузке.');
      }
    }
  };

  const handleRunParser = async () => {
    try {
      await api.post('/api/system/run-parser');
      alert('Парсер успешно запущен вручную.');
    } catch (error) {
      alert('Ошибка при запуске парсера.');
    }
  };

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/api/broadcast', { message });
      alert('Рассылка успешно запущена!');
      setMessage('');
    } catch (error) {
      alert('Ошибка при выполнении рассылки.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>Управление системой</h2>

      <div className="glass card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={20} color="var(--primary)" />
          Быстрые действия
        </h3>
        <div className="grid" style={{ gap: '10px' }}>
          <button className="btn btn-secondary flex-center" style={{ gap: '10px' }} onClick={handleRunParser}>
            <Play size={18} /> Запустить Парсер
          </button>
          <button className="btn btn-danger flex-center" style={{ gap: '10px' }} onClick={handleRestart}>
            <RefreshCw size={18} /> Перезагрузить Бот
          </button>
        </div>
      </div>

      <div className="glass card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Send size={20} color="var(--primary)" />
          Массовая рассылка
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
          Отправьте сообщение сразу всем пользователям бота (через базу данных).
        </p>
        <textarea 
          placeholder="Введите текст сообщения..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ 
            width: '100%', 
            height: '100px', 
            background: 'rgba(0,0,0,0.2)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '8px',
            color: 'white',
            padding: '10px',
            marginBottom: '15px',
            resize: 'none',
            outline: 'none'
          }}
        />
        <button 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          onClick={handleBroadcast}
          disabled={sending || !message.trim()}
        >
          {sending ? 'Отправляем...' : 'Начать рассылку'}
        </button>
      </div>

      <div className="glass card" style={{ padding: '20px', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)' }}>
          <ShieldAlert size={20} />
          Опасная зона
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '15px' }}>
          Эти действия могут временно остановить работу бота. Используйте только при необходимости.
        </p>
        <button className="btn btn-danger" style={{ width: '100%', opacity: 0.7 }} onClick={() => alert('Эта функция требует прямого доступа к Docker')}>
          <Power size={18} style={{ marginRight: '10px' }} /> Остановить Сервисы
        </button>
      </div>
    </div>
  );
};

export default System;
