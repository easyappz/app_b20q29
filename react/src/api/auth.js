import instance from './axios';

export const register = (data) => instance.post('/api/auth/register/', data).then((r) => r.data);
export const login = (data) => instance.post('/api/auth/login/', data).then((r) => r.data);
