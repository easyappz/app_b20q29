import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';

export const Login = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login({ email, password });
      localStorage.setItem('token', data.token);
      nav('/profile');
    } catch (e) {
      setError(e?.response?.data?.detail || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-easytag="id1-react/src/components/Auth/Login.jsx" className="auth-container">
      <h2>Вход</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Пароль</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {!!error && <div className="error">{error}</div>}
        <button disabled={loading} type="submit">{loading ? 'Входим…' : 'Войти'}</button>
      </form>
      <div className="muted">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></div>
    </div>
  );
};
