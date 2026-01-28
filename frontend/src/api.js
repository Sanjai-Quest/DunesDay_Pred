import axios from 'axios';

// Backend API endpoint URL (not a secret - this is just the server address)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getMetrics = async () => {
    const response = await api.get('/metrics');
    return response.data;
};

export const predict = async (movie1, movie2) => {
    const payload = { movie1, movie2 };
    const response = await api.post('/predict', payload);
    return response.data;
};

export const fetchMedia = async (title) => {
    try {
        const response = await api.get('/media', { params: { title } });
        return response.data;
    } catch (error) {
        console.error("Media fetch error:", error);
        return null;
    }
};
