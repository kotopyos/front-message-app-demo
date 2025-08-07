import React, { useState } from 'react';
import './MessageForm.css';

function MessageForm({ onMessageSent }) {
  const [formData, setFormData] = useState({
    content: '',
    sender: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim() || !formData.sender.trim()) {
      setMessage({ 
        text: 'Пожалуйста, заполните все поля', 
        type: 'error' 
      });
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch('http://192.168.0.112:8089/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setMessage({ 
          text: '✅ Сообщение успешно отправлено в Kafka!', 
          type: 'success' 
        });
        
        // Очищаем форму
        setFormData({ content: '', sender: '' });
        
        // Вызываем callback если он передан
        if (onMessageSent) {
          onMessageSent();
        }
      } else {
        setMessage({ 
          text: `❌ Ошибка: ${data.message || 'Не удалось отправить сообщение'}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      setMessage({ 
        text: `❌ Ошибка сети: ${error.message}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="message-form-container">
      <div className="form-header">
        <h2>Отправить сообщение в Kafka</h2>
        <p className="form-description">
          Заполните форму ниже, чтобы отправить сообщение в топик Kafka
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-group">
          <label htmlFor="sender" className="form-label">
            Ваше имя:
          </label>
          <input
            type="text"
            id="sender"
            name="sender"
            value={formData.sender}
            onChange={handleChange}
            placeholder="Введите ваше имя"
            className="form-input"
            disabled={isLoading}
            maxLength={50}
          />
          <span className="char-count">
            {formData.sender.length}/50
          </span>
        </div>
        
        <div className="form-group">
          <label htmlFor="content" className="form-label">
            Текст сообщения:
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Введите текст сообщения"
            rows="5"
            className="form-textarea"
            disabled={isLoading}
            maxLength={500}
          />
          <span className="char-count">
            {formData.content.length}/500
          </span>
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner-button"></span>
              Отправка...
            </>
          ) : (
            <>📤 Отправить сообщение</>
          )}
        </button>
      </form>
      
      {message.text && (
        <div className={`message-alert ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="form-info">
        <h3>ℹ️ Информация</h3>
        <ul>
          <li>Сообщения отправляются в топик <code>demo-topic</code></li>
          <li>Максимальная длина сообщения: 500 символов</li>
          <li>Все сообщения сохраняются и доступны во вкладке "Список сообщений"</li>
          <li>Backend API: <code>http://192.168.0.112:8089/api/messages</code></li>
        </ul>
      </div>
    </div>
  );
}

export default MessageForm;