import Axios, { AxiosRequestConfig } from 'axios';

export const API_PROXY_URL = '/api-proxy';

export const customInstance = <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();

  const promise = Axios.request<T>({
    ...config,
    baseURL: API_PROXY_URL,
    headers: {
      ...config.headers,
      ...(typeof window !== 'undefined' ? {
        'X-Departamento-Activo': localStorage.getItem('activeDeptId') ?? '',
        'X-Rol-Activo': localStorage.getItem('activeRole') ?? '',
      } : {}),
    },
    cancelToken: source.token,
    withCredentials: true,
  }).then(({ data }) => data);

  return Object.assign(promise, {
    cancel: () => source.cancel('Query was cancelled'),
  });
};
