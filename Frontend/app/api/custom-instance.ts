import Axios, { AxiosRequestConfig } from 'axios';

export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sistema-de-gestion-de-programas-backend.onrender.com';

export const customInstance = <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  
  const promise = Axios.request<T>({
    ...config,
    baseURL: BASE_URL,
    cancelToken: source.token,
    withCredentials: true,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise as Promise<T>;
};