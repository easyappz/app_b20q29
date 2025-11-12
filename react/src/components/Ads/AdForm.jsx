import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAd, getAd, updateAd } from '../../api/ads';

export const AdForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'auto', phone: '', condition: 'new' });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;
      try {
        const ad = await getAd(id);
        setForm({
          title: ad.title,
          description: ad.description,
          price: ad.price,
          category: ad.category,
          phone: ad.phone,
          condition: ad.condition,
        });
      } catch (e) {
        setError('Не удалось загрузить объявление');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit && id) {
        const updated = await updateAd(id, { ...form, price: Number(form.price) });
        nav(`/ads/${updated.id}`);
      } else {
        const created = await createAd({ ...form, price: Number(form.price) });
        nav(`/ads/${created.id}`);
      }
    } catch (e) {
      setError('Ошибка при сохранении объявления');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container" data-easytag="id1-react/src/components/Ads/AdForm.jsx">Загрузка…</div>;

  return (
    <div className="container" data-easytag="id1-react/src/components/Ads/AdForm.jsx">
      <h2>{isEdit ? 'Редактировать объявление' : 'Новое объявление'}</h2>
      {!!error && <div className="error">{error}</div>}
      <form className="form" onSubmit={onSubmit}>
        <label>Название</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <label>Описание</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <div className="row">
          <div className="col">
            <label>Цена</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div className="col">
            <label>Телефон</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label>Категория</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="auto">Автомобили</option>
              <option value="realty">Недвижимость</option>
            </select>
          </div>
          <div className="col">
            <label>Состояние</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              <option value="new">Новый</option>
              <option value="used">Б/У</option>
            </select>
          </div>
        </div>
        <div className="actions">
          <button disabled={saving} type="submit">{saving ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </form>
    </div>
  );
};
