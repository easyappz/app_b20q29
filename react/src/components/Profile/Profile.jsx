import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, updateMe } from '../../api/members';

export const Profile = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMe();
      setMe(data);
    } catch (e) {
      if (e?.response?.status === 401) {
        nav('/login');
        return;
      }
      setError('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSave = async (e) => {
    e.preventDefault();
    if (!me) return;
    setSaving(true);
    setError('');
    try {
      const upd = await updateMe({ name: me.name, avatar_url: me.avatar_url, phone: me.phone, about: me.about });
      setMe(upd);
    } catch (e) {
      setError('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    nav('/');
  };

  if (loading) return <div className="container" data-easytag="id1-react/src/components/Profile/Profile.jsx">Загрузка…</div>;

  return (
    <div className="container" data-easytag="id1-react/src/components/Profile/Profile.jsx">
      <h2>Профиль</h2>
      {!!error && <div className="error">{error}</div>}
      {me && (
        <form className="form" onSubmit={onSave}>
          <div className="row">
            <div className="col">
              <label>Имя</label>
              <input value={me.name || ''} onChange={(e) => setMe({ ...me, name: e.target.value })} />
            </div>
            <div className="col">
              <label>Телефон</label>
              <input value={me.phone || ''} onChange={(e) => setMe({ ...me, phone: e.target.value })} />
            </div>
          </div>
          <label>Аватар (URL)</label>
          <input value={me.avatar_url || ''} onChange={(e) => setMe({ ...me, avatar_url: e.target.value })} />
          <label>О себе</label>
          <textarea value={me.about || ''} onChange={(e) => setMe({ ...me, about: e.target.value })} />
          <div className="actions">
            <button type="submit" disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</button>
            <button type="button" className="btn-danger" onClick={logout}>Выйти</button>
          </div>
          <div className="muted">Дата регистрации: {new Date(me.date_joined).toLocaleDateString('ru-RU')}</div>
        </form>
      )}
    </div>
  );
};
