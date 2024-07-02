import axios from 'axios';

console.log('Creating axios instance with base URL:', process.env.REACT_APP_API_URL);

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Interceptor: Preparing request', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log("Token being sent:", token);
    }
    return config;
  },
  (error) => {
    console.error('Interceptor: Request error', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Interceptor: Response received', response.status);
    return response;
  },
  (error) => {
    console.error('Interceptor: Response error', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;