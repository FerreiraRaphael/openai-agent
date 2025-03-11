import axios from 'axios';

export const AXIOS_INSTANCE = axios.create({ baseURL: 'http://localhost:3000' });

export const customInstance = <T>({ url, method, params, data, headers }: any) => {
  return AXIOS_INSTANCE({
    url,
    method,
    params,
    data,
    headers,
  }) as Promise<T>;
};
