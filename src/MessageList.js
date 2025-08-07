import React, { useState, useEffect } from 'react';
import './MessageList.css';

function MessageList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filter, setFilter] = useState('');

  // Функция для загрузки сообщений
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://192.168.0.112:8089/api/messages/list');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.messages) {
        setMessages(data.messages);
      } else {
        setError('Не удалось получить сообщения');
      }
    } catch (err) {
      console.error('Ошибка при загрузке сообщений:', err);
      setError('Ошибка при загрузке сообщений: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Функция для очистки всех сообщений
  const clearMessages = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить все сообщения?')) {
      return;
    }

    try {
      const response = await fetch('http://192.168.0.112:8089/api/messages/clear', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setMessages([]);
      alert('Все сообщения удалены');
    } catch (err) {
      console.error('Ошибка при очистке сообщений:', err);
      alert('Ошибка при очистке сообщений: ' + err.message);
    }
  };

  // Загрузка сообщений при монтировании компонента
  useEffect(() => {
    fetchMessages();
  }, []);

  // Автообновление каждые 5 секунд
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchMessages();
      }, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  // Фильтрация сообщений
  const filteredMessages = messages.filter(msg => 
    (msg.username && msg.username.toLowerCase().includes(filter.toLowerCase())) ||
    (msg.message && msg.message.toLowerCase().includes(filter.toLowerCase()))
  );

  // Форматирование даты
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Нет данных';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="message-list-container">
      <div className="message-list-header">
        <h2>Сообщения из Kafka</h2>
        <div className="message-list-controls">
          <input
            type="text"
            placeholder="Поиск по имени или тексту..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
          
          <label className="auto-refresh-label">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Автообновление (5 сек)
          </label>
          
          <button 
            onClick={fetchMessages} 
            disabled={loading}
            className="refresh-button"
          >
            {loading ? 'Загрузка...' : '🔄 Обновить'}
          </button>
          
          <button 
            onClick={clearMessages}
            className="clear-button"
            disabled={messages.length === 0}
          >
            🗑️ Очистить все
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="messages-stats">
        <span>Всего сообщений: {filteredMessages.length}</span>
        {filter && <span> (отфильтровано из {messages.length})</span>}
      </div>

      {loading && messages.length === 0 ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка сообщений...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="no-messages">
          {filter ? 
            `Нет сообщений, соответствующих фильтру "${filter}"` : 
            'Нет сообщений. Отправьте первое сообщение через вкладку "Отправить"!'
          }
        </div>
      ) : (
        <div className="messages-grid">
          {filteredMessages.map((message, index) => (
            <div key={message.id || index} className="message-card">
              <div className="message-header">
                <span className="message-sender">👤 {message.username || 'Аноним'}</span>
                <span className="message-id">#{message.id ? message.id.slice(-8) : index}</span>
              </div>
              <div className="message-content">
                {message.message || 'Пустое сообщение'}
              </div>
              <div className="message-footer">
                <span className="message-timestamp">
                  🕐 {formatDate(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageList;