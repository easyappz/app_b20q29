import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAd, deleteAd } from '../../api/ads';
import { createThread } from '../../api/chat';

export const AdDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [ad, setAd] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAd(id);
      setAd(data);
    } catch (e) {
      setError('Не удалось загрузить объявление');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const onChat = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { nav('/login'); return; }
      const thread = await createThread(ad.author.id, Number(id));
      nav('/chat');
    } catch (e) {
      setError('Не удалось создать чат');
    }
  };

  const onDelete = async () => {
    try {
      await deleteAd(id);
      nav('/');
    } catch (e) {
      setError('Не удалось удалить объявление');
    }
  };

  if (loading) return <div className="container" data-easytag="id1-react/src/components/Ads/AdDetail.jsx">Загрузка…</div>;
  if (!ad) return <div className="container" data-easytag="id1-react/src/components/Ads/AdDetail.jsx">Объявление не найдено</div>;

  return (
    <div className="container" data-easytag="id1-react/src/components/Ads/AdDetail.jsx">
      <div className="ad-detail">
        <div className="ad-header">
          <h2>{ad.title}</h2>
          <div className="price">{Number(ad.price).toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="ad-meta">
          <span>Категория: {ad.category === 'auto' ? 'Автомобили' : 'Недвижимость'}</span>
          <span>Состояние: {ad.condition === 'new' ? 'Новый' : 'Б/У'}</span>
          <span>Опубликовано: {new Date(ad.created_at).toLocaleDateString('ru-RU')}</span>
        </div>
        <div className="ad-desc">{ad.description}</div>

        <div className="author-card" data-easytag="id2-react/src/components/Ads/AdDetail.jsx-author">
          <div className="author-title">Автор</div>
          <div className="author-name">{ad.author?.name}</div>
          <div className="author-phone">Телефон: {ad.phone}</div>
          <div className="actions">
            <button onClick={onChat}>Написать сообщение</button>
            <Link to={`/ads/${id}/edit`} className="btn-secondary">Редактировать</Link>
            <button className="btn-danger" onClick={onDelete}>Удалить</button>
          </div>
        </div>
        {error && <div className="error-text">{error}</div>}
      </div>
    </div>
  );
};
