import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add CSRF token from meta tag
api.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token.getAttribute('content');
    }
    return config;
});

export const fetchStatus = () => api.get('/status');
export const fetchHistory = (params = {}) => api.get('/history', { params });
export const arriveParty = (data) => api.post('/arrive', data);
export const serveTable = (data) => api.post('/serve', data);
export const assignParty = (data) => api.post('/assign', data);
export const transferTable = (data) => api.post('/transfer', data);

export default api;
