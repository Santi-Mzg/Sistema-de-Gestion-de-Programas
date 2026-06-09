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