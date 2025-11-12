import instance from './axios';

export const getThreads = () => instance.get('/api/chat/threads/').then((r) => r.data);
export const createThread = (recipient_id, ad_id = null) => instance.post('/api/chat/threads/', { recipient_id, ad_id }).then((r) => r.data);
export const getMessages = (threadId) => instance.get(`/api/chat/threads/${threadId}/messages/`).then((r) => r.data);
export const sendMessage = (threadId, text) => instance.post(`/api/chat/threads/${threadId}/messages/`, { text }).then((r) => r.data);
