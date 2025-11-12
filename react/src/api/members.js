import instance from './axios';

export const getMe = () => instance.get('/api/members/me/').then((r) => r.data);
export const updateMe = (data) => instance.put('/api/members/me/', data).then((r) => r.data);
export const getMember = (id) => instance.get(`/api/members/${id}/`).then((r) => r.data);
