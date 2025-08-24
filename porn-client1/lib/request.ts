import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { headers } from "next/headers";

// 创建 axios 实例
const api = axios.create({
  baseURL: "http://localhost:8080", // 使用相对路径，会被中间件代理
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    console.log(`🚀 发送请求: ${config.method?.toUpperCase()} ${config.url}`);
    const headersList = await headers();
    const cookie = headersList.get("cookie");
    if (cookie) {
      config.headers["Cookie"] = cookie;
    }
    return config;
  },
  (error) => {
    console.error("❌ 请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ 响应成功: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ 响应错误:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// API 方法封装
export const apiClient = {
  // GET 请求
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return api.get(url, config);
  },

  // POST 请求
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return api.post(url, data, config);
  },

  // PUT 请求
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return api.put(url, data, config);
  },

  // DELETE 请求
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return api.delete(url, config);
  },

  // PATCH 请求
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return api.patch(url, data, config);
  },
};

// 认证相关 API
export const authAPI = {
  // 登录
  login: (username: string, password: string) => {
    return apiClient.post("/auth/login", { username, password });
  },

  // 登出
  logout: () => {
    return apiClient.post("/auth/logout");
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return apiClient.get("/auth/me");
  },

  // 检查认证状态
  checkStatus: () => {
    return apiClient.get("/auth/status");
  },
};
