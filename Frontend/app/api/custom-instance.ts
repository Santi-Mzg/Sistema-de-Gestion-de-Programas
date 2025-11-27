import Axios, { AxiosRequestConfig } from 'axios';

// ⚠️ Asegúrate de que esta URL base coincida con tu backend
export const BASE_URL = 'http://localhost:8080';

export const customInstance = <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  
  // Aquí puedes inyectar el token de autenticación (JWT/Bearer)
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   config.headers = {
  //     ...config.headers,
  //     Authorization: `Bearer ${token}`,
  //   };
  // }
  
  const promise = Axios.request<T>({ ...config, baseURL: BASE_URL, cancelToken: source.token }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise as Promise<T>;
};