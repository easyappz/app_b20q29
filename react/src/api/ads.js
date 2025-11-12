import instance from './axios';

export const getAds = (params = {}) => instance.get('/api/ads/', { params }).then((r) => r.data);
export const getAd = (id) => instance.get(`/api/ads/${id}/`).then((r) => r.data);
export const createAd = (data) => instance.post('/api/ads/', data).then((r) => r.data);
export const updateAd = (id, data) => instance.put(`/api/ads/${id}/`, data).then((r) => r.data);
export const deleteAd = (id) => instance.delete(`/api/ads/${id}/`).then((r) => r.data);
