import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';

import { log } from '@/utils';
import { getConfig } from '@/core/config';

let instance: AxiosInstance;

const createAxiosInstance = async (): Promise<AxiosInstance> => {
  const baseURL = (await getConfig('OLLAMA_HOST')) as string;
  instance = axios.create({
    baseURL: baseURL,
    timeout: 60 * 1000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use(requestHandler);
  instance.interceptors.response.use(responseHandler, errorHandler);

  return instance;
};
const requestHandler = async (
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> => {
  return config;
};

const responseHandler = (response: AxiosResponse) => {
  return response.data;
};

const errorHandler = (error: AxiosError): Promise<any> => {
  if (error.response) {
    const { status, statusText } = error.response;

    switch (status) {
      case 401:
        log.error('[Error] Unauthorized error: ' + statusText);
        break;
      case 403:
        log.warning('[Warn] Forbidden error: ' + statusText);
        break;
      case 500:
        log.bgerror('[Error] Internal server error: ' + statusText);
        break;
      default:
        log.error('[Error]: ' + statusText);
        break;
    }
  } else {
    log.error('[Error] Network or other error: ' + error.message);
  }
  return Promise.reject(error);
};

const instancePromise = async <R = any>(options: AxiosRequestConfig): Promise<R> => {
  if (!instance) {
    await createAxiosInstance();
  }

  return new Promise((resolve, reject) => {
    instance
      .request(options)
      .then((res) => {
        resolve(res as unknown as Promise<R>);
      })
      .catch((e: Error | AxiosError) => {
        reject(e);
      });
  });
};

export const axiosGet = <R = any, T = any>(
  url: string,
  params?: T,
  config?: AxiosRequestConfig,
): Promise<R> => {
  const options: AxiosRequestConfig = {
    url,
    params,
    method: 'GET',
    ...config,
  };
  return instancePromise<R>(options);
};

export const axiosPost = <R = any, T = any>(
  url: string,
  data?: T,
  config?: AxiosRequestConfig,
): Promise<R> => {
  const options: AxiosRequestConfig = {
    url,
    data,
    method: 'POST',
    ...config,
  };
  return instancePromise<R>(options);
};
