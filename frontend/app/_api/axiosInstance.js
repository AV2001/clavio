import axios from 'axios';
// import { cookies } from 'next/headers';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add a request interceptor to include tokens
// axiosInstance.interceptors.request.use((config) => {
//   const cookieStore = cookies();
//   const accessToken = cookieStore.get('access')?.value;
//   const csrfToken = cookieStore.get('csrftoken')?.value;
//   if (accessToken) {
//     config.headers['Authorization'] = `Bearer ${accessToken}`;
//   }
//   if (csrfToken) {
//     config.headers['X-CSRFToken'] = csrfToken;
//   }
//   return config;
// });

export default axiosInstance;
