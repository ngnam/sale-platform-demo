import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { message } from 'ant-design-vue';
import { getApiBaseUrl } from '@/utils/runtimeConfig';
import type { ResponseData } from '@/apis/types/common';

const BASE_URL = localStorage.getItem('DEV_BASE_URL') || getApiBaseUrl();

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 1000 * 60 * 5,
  headers: { 'Content-Type': 'application/json' }
});

// request interceptor remains, but avoid relying solely on store inside interceptor
instance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error) => {
    console.log(error)
    const status = error?.response?.status;
    if (status === 401) message.error('Unauthorized. Please login again.');
    else message.error(error?.response?.data?.message || error.message || 'Network error');
    return Promise.reject(error);
  }
);

// helper to set/clear Authorization header at runtime
export function setAuthToken(token?: string | null) {
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete instance.defaults.headers.common['Authorization'];
  }
}

async function unwrapResponse<T>(response: AxiosResponse<ResponseData<T>>): Promise<T> {
  const payload = response.data as any;
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data as T;
  return response.data as unknown as T;
}

export async function request<T = any>(config: AxiosRequestConfig, unWrap: boolean = true): Promise<T | any> {
  const resp = await instance.request<ResponseData<T>>(config);
  return unWrap ? unwrapResponse<T>(resp) : resp;
}

export async function get<T = any>(url: string, params?: object, config?: AxiosRequestConfig, unWrap: boolean = true): Promise<T|any> {
  return request<T>({ url, method: 'GET', params, ...config }, unWrap);
}

export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ url, method: 'POST', data, ...config });
}

export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ url, method: 'PUT', data, ...config });
}

export async function del<T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
  return request<T>({ url, method: 'DELETE', params, ...config });
}

export default instance;
