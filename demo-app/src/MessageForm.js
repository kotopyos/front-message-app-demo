import React, { useState } from 'react';
import './MessageForm.css';

const MessageForm = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем, что поля заполнены
    if (!name.trim() || !message.trim()) {
      setResponseMessage('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    setResponseMessage('');

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          sender: name
        }),
      });

      if (response.ok) {
        setResponseMessage('Сообщение отправлено успешно! ✅');
        setName('');
        setMessage('');
      } else {
        setResponseMessage('Ошибка при отправке сообщения ❌');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setResponseMessage('Ошибка сети. Проверьте подключение ❌');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="message-form-container">
      <h2>Отправить сообщение</h2>
      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-group">
          <label htmlFor="name">Имя:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите ваше имя"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Сообщение:</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите ваше сообщение"
            rows="4"
            disabled={isLoading}
          />
        </div>

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Отправляется...' : 'Отправить сообщение'}
        </button>

        {responseMessage && (
          <div className={`response-message ${responseMessage.includes('успешно') ? 'success' : 'error'}`}>
            {responseMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageForm;