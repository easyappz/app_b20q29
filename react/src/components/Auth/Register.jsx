import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../../api/auth';

export const Register = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiRegister({ email, password, name });
      nav('/login');
    } catch (e) {
      const data = e?.response?.data;
      setError(data?.detail || data?.email?.[0] || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-easytag="id1-react/src/components/Auth/Register.jsx" className="auth-container">
      <h2>Регистрация</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Имя</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Пароль</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {!!error && <div className="error">{error}</div>}
        <button disabled={loading} type="submit">{loading ? 'Отправляем…' : 'Зарегистрироваться'}</button>
      </form>
      <div className="muted">Уже есть аккаунт? <Link to="/login">Войти</Link></div>
    </div>
  );
};
