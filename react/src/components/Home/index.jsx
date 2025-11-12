import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getAds } from '../../api/ads';

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({ count: 0, page: 1, page_size: 20, results: [] });

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    q: searchParams.get('q') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const applyParams = (next) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params.set(k, String(v));
    });
    setSearchParams(params);
  };

  const fetchAds = async (f) => {
    setLoading(true);
    setError('');
    try {
      const resp = await getAds({ ...f, page_size: 20 });
      setData(resp);
    } catch (e) {
      setError('Не удалось загрузить объявления');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onSubmit = (e) => {
    e.preventDefault();
    applyParams({ ...filters, page: 1 });
  };

  const onPage = (nextPage) => {
    const p = Math.max(1, nextPage);
    const next = { ...filters, page: p };
    setFilters(next);
    applyParams(next);
  };

  return (
    <div data-easytag="id1-react/src/components/Home/index.jsx" className="container">
      <h1>Доска объявлений</h1>

      <form className="filters" onSubmit={onSubmit}>
        <div className="row">
          <div className="col">
            <label>Категория</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Все</option>
              <option value="auto">Автомобили</option>
              <option value="realty">Недвижимость</option>
            </select>
          </div>
          <div className="col">
            <label>Название</label>
            <input
              type="text"
              placeholder="Поиск по названию"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label>Цена от</label>
            <input
              type="number"
              value={filters.price_min}
              onChange={(e) => setFilters({ ...filters, price_min: e.target.value })}
            />
          </div>
          <div className="col">
            <label>Цена до</label>
            <input
              type="number"
              value={filters.price_max}
              onChange={(e) => setFilters({ ...filters, price_max: e.target.value })}
            />
          </div>
          <div className="col">
            <label>Дата с</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
          <div className="col">
            <label>Дата по</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
        </div>
        <div className="actions">
          <button type="submit">Применить</button>
          <Link to="/ads/new" className="btn-primary">+ Разместить объявление</Link>
        </div>
      </form>

      {loading && <div>Загрузка...</div>}
      {!!error && <div className="error">{error}</div>}

      <div className="cards-grid">
        {data.results.map((ad) => (
          <Link key={ad.id} to={`/ads/${ad.id}`} className="card" data-easytag={`id2-react/src/components/Home/index.jsx-ad-${ad.id}`}>
            <div className="card-header">
              <div className="title">{ad.title}</div>
              <div className="price">{Number(ad.price).toLocaleString('ru-RU')} ₽</div>
            </div>
            <div className="card-body">
              <div className="muted">Категория: {ad.category === 'auto' ? 'Автомобили' : 'Недвижимость'}</div>
              <div className="muted">Состояние: {ad.condition === 'new' ? 'Новый' : 'Б/У'}</div>
              <div className="desc">{ad.description.slice(0, 120)}{ad.description.length > 120 ? '…' : ''}</div>
            </div>
            <div className="card-footer">
              <div className="author">Автор: {ad.author?.name}</div>
              <div className="muted">Опубликовано: {new Date(ad.created_at).toLocaleDateString('ru-RU')}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="pagination">
        <button disabled={data.page <= 1} onClick={() => onPage(data.page - 1)}>Назад</button>
        <span>{data.page} / {Math.max(1, Math.ceil(data.count / data.page_size))}</span>
        <button disabled={data.page >= Math.ceil(data.count / data.page_size)} onClick={() => onPage(data.page + 1)}>Вперед</button>
      </div>
    </div>
  );
};
