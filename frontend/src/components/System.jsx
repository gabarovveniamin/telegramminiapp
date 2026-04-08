import React, { useState } from 'react';
import { Settings, Play, RefreshCw, Send, Power, ShieldAlert } from 'lucide-react';
import api from '../api';

const System = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleRestart = async () => {
    if (window.confirm('Вы уверены, что хотите перезагрузить бэкенд?')) {
      try {
        await api.post('/system/restart');
        alert('Запрос на перезагрузку отправлен. Страница обновится автоматически через 3 секунды.');
        setTimeout(() => window.location.reload(), 3000);
      } catch (error) {
        alert('Ошибка при перезагрузке.');
      }
    }
  };

  const handleRunParser = async () => {
    try {
      await api.post('/system/run-parser');
      alert('Парсер успешно запущен вручную.');
    } catch (error) {
      alert('Ошибка при запуске парсера.');
    }
  };

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/broadcast', { message });
      alert('Рассылка успешно запущена!');
      setMessage('');
    } catch (error) {
      alert('Ошибка при выполнении рассылки.');
    } finally {
      setSending(false);
    }
  };

  const [logs, setLogs] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await api.get('/system/logs');
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '20px' }}>Управление системой</h2>

      <div className="glass card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={20} color="var(--primary)" />
          Параметры бота
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.9rem' }}>Цена (1 звезда):</span>
            <span style={{ fontWeight: 'bold' }}>50 ₽</span>
          </div>
          <div className="flex-between">
            <span style={{ fontSize: '0.9rem' }}>Цена (3 звезды):</span>
            <span style={{ fontWeight: 'bold' }}>120 ₽</span>
          </div>
          <div className="flex-between">
            <span style={{ fontSize: '0.9rem' }}>Тех-обслуживание:</span>
            <span style={{ color: 'var(--success)' }}>ВЫКЛ</span>
          </div>
        </div>
      </div>

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

      <div className="glass card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div className="flex-between" style={{ marginBottom: '15px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Power size={20} color="var(--primary)" />
            Консоль логов
          </h3>
          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={fetchLogs}>
            Обновить
          </button>
        </div>
        <pre style={{ 
          background: '#000', 
          color: '#0f0', 
          padding: '10px', 
          borderRadius: '8px', 
          fontSize: '0.75rem', 
          height: '250px', 
          overflowY: 'auto',
          margin: 0,
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace'
        }}>
          {loadingLogs && !logs ? 'Загрузка...' : logs || 'Логов пока нет'}
        </pre>
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
