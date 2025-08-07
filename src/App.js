import React, { useState } from 'react';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('send');

  return (
    <div className="App">
      <header className="App-header">
        <h1>📨 Демка</h1>
        <p className="App-subtitle">Отправляйте и просматривайте сообщения через Apache Kafka</p>
      </header>
      
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            ✉️ Отправить сообщение
          </button>
          <button 
            className={`tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 Список сообщений
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'send' ? (
            <MessageForm onMessageSent={() => {
              // Можно добавить уведомление или автоматический переход на список
              setTimeout(() => {
                const shouldSwitch = window.confirm('Сообщение отправлено! Перейти к списку сообщений?');
                if (shouldSwitch) {
                  setActiveTab('list');
                }
              }, 500);
            }} />
          ) : (
            <MessageList />
          )}
        </div>
      </div>
      
      <footer className="App-footer">
        <div className="status-bar">
          <span className="status-item">
            🟢 Backend: <a href="http://192.168.0.112:8089/api/messages/health" target="_blank" rel="noopener noreferrer">192.168.0.112:8089</a>
          </span>
          <span className="status-item">
            🔵 Kafka UI: <a href="http://192.168.0.112:8090" target="_blank" rel="noopener noreferrer">192.168.0.112:8090 (idk)</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;