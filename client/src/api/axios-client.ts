import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export const AXIOS_INSTANCE = axios.create({ baseURL: 'http://localhost:3000' });

export const customInstance = <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return AXIOS_INSTANCE(config);
};
