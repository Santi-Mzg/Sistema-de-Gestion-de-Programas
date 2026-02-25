// import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

// export const API_PROXY_URL = '/api-proxy';


// const axiosInstance = Axios.create({
//   baseURL: API_PROXY_URL,
//   withCredentials: true,
//   timeout: 10000, // 10 segundos máximo de espera
// });

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/reset-password')) {
        
//         console.log('Sesión expirada. Redirigiendo...');
//         try {
//           await fetch('/api/auth/logout', { method: 'POST' });
//           window.location.href = '/login'; 

//         } catch (e) {
//           console.error("Error al limpiar cookie", e);
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export const customInstance = <T>(
//   config: AxiosRequestConfig,
// ): Promise<T> => {
//   const source = Axios.CancelToken.source();

//   const promise = axiosInstance({
//     ...config,
//     cancelToken: source.token,
//   }).then(({ data }) => data);

//   // @ts-ignore
//   promise.cancel = () => {
//     source.cancel('Query was cancelled');
//   };

//   return promise as Promise<T>;
// };





import Axios, { AxiosRequestConfig } from 'axios';

export const API_PROXY_URL = '/api-proxy';

export const customInstance = <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  
  const promise = Axios.request<T>({
    ...config,
    baseURL: API_PROXY_URL,
    cancelToken: source.token,
    withCredentials: true,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise as Promise<T>;
};