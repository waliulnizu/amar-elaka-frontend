import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true // Required for sending HTTP-only cookies
});

// Response interceptor for handling 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Redirect to login or show toast if unauthorized
            console.error("Unauthorized: Please log in again.");
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
