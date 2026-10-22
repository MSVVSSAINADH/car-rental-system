import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Request interceptor — attach JWT token to all requests
api.interceptors.request.use(config => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                config.headers['Authorization'] = `Bearer ${user.token}`;
            }
        } catch {
            // ignore parse error
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Response interceptor: on 401, clear the session and redirect to login.
// Sign-in and sign-up requests are excluded so a wrong password shows its error
// instead of reloading the page.
api.interceptors.response.use(
    response => response,
    error => {
        const url = error.config?.url || '';
        const isAuthRequest = url.startsWith('/auth/');
        if (error.response && error.response.status === 401 && !isAuthRequest) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
