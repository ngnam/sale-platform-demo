// src/hooks/useFetch.ts
import type { AxiosRequestConfig } from "axios";
import { useRequest } from "vue-request";
import http, { get, post, put, del } from "@/utils/http";

/**
 * Simple typed fetch wrapper using vue-request useRequest + underlying axios utils.
 *
 * Usage examples:
 *  const { data, loading, error, run } = useFetch<MyDto>(() => get('/path'), { manual: true });
 *  const { data } = useFetch<MyDto>('/users', { method: 'GET' });
 */

export type UseFetchOptions<T> = {
  manual?: boolean;
  pollingInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (e: any) => void;
} & Partial<AxiosRequestConfig>;

type Method = "GET" | "POST" | "PUT" | "DELETE";

export function useFetch<T = any>(
  urlOrFn: string | (() => Promise<T>),
  options: UseFetchOptions<T> = {}
) {
  const {
    manual = false,
    pollingInterval,
    onSuccess,
    onError,
    ...axiosOpts
  } = options;

  // build request function when url string provided
  const requestFn =
    typeof urlOrFn === "string"
      ? async () => {
          const method = (axiosOpts.method as Method) || "GET";
          if (method === "GET")
            return await get<T>(urlOrFn, axiosOpts.params || {}, axiosOpts);
          if (method === "POST")
            return await post<T>(urlOrFn, axiosOpts.data || {}, axiosOpts);
          if (method === "PUT")
            return await put<T>(urlOrFn, axiosOpts.data || {}, axiosOpts);
          if (method === "DELETE")
            return await del<T>(urlOrFn, axiosOpts.params || {}, axiosOpts);
          return await get<T>(urlOrFn, axiosOpts.params || {}, axiosOpts);
        }
      : urlOrFn;

  const runner = useRequest<T>(requestFn as any, {
    manual,
    pollingInterval,
    onSuccess,
    onError,
  });

  // convenience helpers to call specific methods using http instance
  return {
    ...runner,
    // low-level access
    http,
    get: <R = any>(p: string, params?: any, cfg?: AxiosRequestConfig) =>
      get<R>(p, params, cfg),
    post: <R = any>(p: string, data?: any, cfg?: AxiosRequestConfig) =>
      post<R>(p, data, cfg),
    put: <R = any>(p: string, data?: any, cfg?: AxiosRequestConfig) =>
      put<R>(p, data, cfg),
    del: <R = any>(p: string, params?: any, cfg?: AxiosRequestConfig) =>
      del<R>(p, params, cfg),
  };
}
