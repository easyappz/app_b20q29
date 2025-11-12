import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThreads, getMessages, sendMessage } from '../../api/chat';

export const Chat = () => {
  const nav = useNavigate();
  const [threads, setThreads] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const loadThreads = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { nav('/login'); return; }
      const t = await getThreads();
      setThreads(t);
      if (!currentId && t.length) setCurrentId(t[0].id);
    } catch (e) {
      setError('Не удалось загрузить чаты');
    }
  };

  const loadMessages = async (id) => {
    if (!id) return;
    try {
      const m = await getMessages(id);
      setMessages(m);
    } catch (e) {
      setError('Не удалось загрузить сообщения');
    }
  };

  useEffect(() => { loadThreads(); }, []);
  useEffect(() => { loadMessages(currentId); }, [currentId]);

  useEffect(() => {
    const i = setInterval(() => { if (currentId) loadMessages(currentId); }, 5000);
    return () => clearInterval(i);
  }, [currentId]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !currentId) return;
    try {
      await sendMessage(currentId, text.trim());
      setText('');
      loadMessages(currentId);
    } catch (e) {
      setError('Не удалось отправить сообщение');
    }
  };

  return (
    <div className="container chat" data-easytag="id1-react/src/components/Chat/Chat.jsx">
      <div className="chat-sidebar">
        <div className="chat-title">Диалоги</div>
        <div className="chat-threads">
          {threads.map(t => {
            const meId = null; // not shown; keep simple
            return (
              <div key={t.id} className={"thread " + (t.id === currentId ? 'active' : '')} onClick={() => setCurrentId(t.id)}>
                <div className="thread-line">Чат #{t.id}</div>
                {t.ad && <div className="muted">Объявление: {t.ad}</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="chat-main">
        {!currentId ? (
          <div className="muted">Выберите диалог</div>
        ) : (
          <>
            <div className="messages">
              {messages.map(m => (
                <div key={m.id} className="message">
                  <div className="author">{m.sender?.name}</div>
                  <div className="text">{m.text}</div>
                  <div className="time">{new Date(m.created_at).toLocaleString('ru-RU')}</div>
                </div>
              ))}
            </div>
            <form className="send" onSubmit={onSend}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ваше сообщение" />
              <button type="submit">Отправить</button>
            </form>
          </>
        )}
        {!!error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};
