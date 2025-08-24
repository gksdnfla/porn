import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// 创建 axios 实例
const api = axios.create({
  baseURL: "/api", // 使用相对路径，会被中间件代理
  timeout: 30000,
  withCredentials: true, // 包含 cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 发送请求: ${config.method?.toUpperCase()} ${config.url}`);
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
  async (error) => {
    const originalRequest = error.config;
    
    // 如果是401错误且还没有重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // 检查localStorage中的自动登录设置
      const rememberLogin = localStorage.getItem('rememberLogin');
      const savedUsername = localStorage.getItem('username');
      const savedPassword = localStorage.getItem('password');
      
      if (rememberLogin === 'true' && savedUsername && savedPassword) {
        try {
          console.log('🔄 检测到401错误，尝试自动登录...');
          
          // 尝试重新登录
          const loginResponse = await api.post('/auth/login', {
            username: savedUsername,
            password: savedPassword
          });
          
          if (loginResponse.status === 200) {
            console.log('✅ 自动登录成功，重试原请求');
            // 重新发送原始请求
            return api.request(originalRequest);
          }
        } catch (loginError) {
          console.error('❌ 自动登录失败:', loginError);
          // 清除无效的登录信息
          localStorage.removeItem('autoLogin');
          localStorage.removeItem('username');
          localStorage.removeItem('password');
          
          // 重定向到登录页面
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        // 没有自动登录设置，重定向到登录页面
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
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
    // 清除localStorage中的登录信息
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    console.log('🗑️ 已清除localStorage中的登录信息');
    
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

  // 检查是否有自动登录信息
  hasAutoLoginInfo: () => {
    const rememberLogin = localStorage.getItem('rememberLogin');
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    
    return rememberLogin === 'true' && !!username && !!password;
  },

  // 获取保存的登录信息
  getSavedLoginInfo: () => {
    return {
      username: localStorage.getItem('username') || '',
      password: localStorage.getItem('password') || '',
      autoLogin: localStorage.getItem('rememberLogin') === 'true'
    };
  },
};

// 관리자 API
export const adminAPI = {
  // 分页获取用户列表 (관리자 전용)
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }) => {
    return apiClient.get("/admin/users", { params });
  },

  // 创建用户 (관리자 전용)
  createUser: (userData: any) => {
    return apiClient.post("/admin/users", userData);
  },

  // 更新用户 (관리자 전용)
  updateUser: (id: number, userData: any) => {
    return apiClient.patch(`/admin/users/${id}`, userData);
  },

  // 删除用户 (관리자 전용)
  deleteUser: (id: number) => {
    return apiClient.delete(`/admin/users/${id}`);
  },

  // 封号用户 (관리자 전용)
  banUser: (
    id: number,
    banData: { is_banned: boolean; ban_reason?: string }
  ) => {
    return apiClient.patch(`/admin/users/${id}/ban`, banData);
  },

  // 解封用户 (관리자 전용)
  unbanUser: (id: number) => {
    return apiClient.patch(`/admin/users/${id}/unban`);
  },

  // 获取用户封号状态 (관리자 전용)
  getUserBanStatus: (id: number) => {
    return apiClient.get(`/admin/users/${id}/ban-status`);
  },
};

// 카테고리 API
export const categoryAPI = {
  // 모든 카테고리 조회 (계층 구조 포함)
  getAllCategories: () => {
    return apiClient.get("/categories");
  },

  // 최상위 카테고리만 조회
  getRootCategories: () => {
    return apiClient.get("/categories/root");
  },

  // 특정 카테고리 조회
  getCategory: (id: number) => {
    return apiClient.get(`/categories/${id}`);
  },

  // 하위 카테고리 조회
  getChildCategories: (parentId: number) => {
    return apiClient.get(`/categories/${parentId}/children`);
  },

  // 카테고리 경로 조회
  getCategoryPath: (id: number) => {
    return apiClient.get(`/categories/${id}/path`);
  },

  // 카테고리 생성 (관리자 전용)
  createCategory: (categoryData: {
    name: string;
    parent_id?: number | null;
  }) => {
    return apiClient.post("/categories", categoryData);
  },

  // 카테고리 수정 (관리자 전용)
  updateCategory: (
    id: number,
    categoryData: {
      name?: string;
      parent_id?: number | null;
    }
  ) => {
    return apiClient.patch(`/categories/${id}`, categoryData);
  },

  // 카테고리 삭제 (관리자 전용)
  deleteCategory: (id: number) => {
    return apiClient.delete(`/categories/${id}`);
  },
};

// 콘텐츠 API
export const contentAPI = {
  // 분페이징 콘텐츠 조회 (관리자 전용)
  getContents: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    category?: string;
    sub_category?: string | null;
    status?: string;
    is_visible?: boolean;
    is_popular?: boolean;
  }) => {
    return apiClient.get('/admin/contents', { params });
  },

  // 특정 콘텐츠 조회 (관리자 전용)
  getContent: (id: number) => {
    return apiClient.get(`/admin/contents/${id}`);
  },

  // 콘텐츠 생성 (관리자 전용)
  createContent: (contentData: {
    title: string;
    image_url: string;
    category: string;
    sub_category?: string;
    service_link?: string;
    description?: string;
    tags?: string;
    duration?: number;
    file_size?: number;
    resolution?: string;
    video_guid: string;
    status?: 'active' | 'inactive' | 'pending' | 'deleted';
  }) => {
    return apiClient.post('/admin/contents', contentData);
  },

  // 콘텐츠 수정 (관리자 전용)
  updateContent: (id: number, contentData: any) => {
    return apiClient.patch(`/admin/contents/${id}`, contentData);
  },

  // 콘텐츠 삭제 (관리자 전용)
  deleteContent: (id: number) => {
    return apiClient.delete(`/admin/contents/${id}`);
  },

  // 썸네일 업로드 (관리자 전용)
  uploadThumbnail: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/admin/contents/upload/thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 비디오 업로드 (관리자 전용)
  uploadVideo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/admin/contents/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Bunny Storage에서 파일 삭제 (관리자 전용)
  deleteFile: (filename: string) => {
    // 파일명을 URL 인코딩
    const encodedFilename = encodeURIComponent(filename);
    return apiClient.delete(`/admin/contents/files/${encodedFilename}`);
  },

  // Bunny Stream에서 파일 삭제 (관리자 전용)
  deleteVideo: (guid: string) => {
    const encodedGuid = encodeURIComponent(guid);
    return apiClient.delete(`/admin/contents/video/${encodedGuid}`);
  },

  // 콘텐츠 통계 조회 (관리자 전용)
  getStats: () => {
    return apiClient.get('/admin/contents/stats');
  },

  // 인기 콘텐츠 토글 (관리자 전용)
  togglePopular: (id: number) => {
    return apiClient.patch(`/admin/contents/${id}/toggle-popular`);
  },

  // 콘텐츠 노출 토글 (관리자 전용)
  toggleVisibility: (id: number) => {
    return apiClient.patch(`/admin/contents/${id}/toggle-visibility`);
  },
};

// 광고 API
export const advertisementAPI = {
  // 모든 광고 조회 (관리자 전용)
  getAllAdvertisements: () => {
    return apiClient.get('/advertisements');
  },

  // 활성 광고만 조회 (공개 API)
  getActiveAdvertisements: () => {
    return apiClient.get('/advertisements/active');
  },

  // 특정 광고 조회 (공개 API)
  getAdvertisement: (id: number) => {
    return apiClient.get(`/advertisements/${id}`);
  },

  // 광고 생성 (관리자 전용)
  createAdvertisement: (advertisementData: {
    title: string;
    image_url: string;
    link_url: string;
    priority?: number;
    is_active?: boolean;
    description?: string;
    start_date?: Date;
    end_date?: Date;
  }) => {
    return apiClient.post('/advertisements', advertisementData);
  },

  // 광고 수정 (관리자 전용)
  updateAdvertisement: (id: number, advertisementData: {
    title?: string;
    image_url?: string;
    link_url?: string;
    priority?: number;
    is_active?: boolean;
    description?: string;
    start_date?: Date;
    end_date?: Date;
  }) => {
    return apiClient.patch(`/advertisements/${id}`, advertisementData);
  },

  // 광고 삭제 (관리자 전용)
  deleteAdvertisement: (id: number) => {
    return apiClient.delete(`/advertisements/${id}`);
  },

  // 클릭 수 증가 (공개 API)
  recordClick: (id: number) => {
    return apiClient.post(`/advertisements/${id}/click`);
  },

  // 노출 수 증가 (공개 API)
  recordImpression: (id: number) => {
    return apiClient.post(`/advertisements/${id}/impression`);
  },

  // 광고 활성/비활성 토글 (관리자 전용)
  toggleActive: (id: number) => {
    return apiClient.patch(`/advertisements/${id}/toggle-active`);
  },

  // 광고 통계 조회 (관리자 전용)
  getStats: () => {
    return apiClient.get('/advertisements/admin/stats');
  },

  // 광고 이미지 삭제 (관리자 전용)
  deleteImageFromBunny: (filename: string) => {
    return apiClient.delete(`/advertisements/files/${filename}`);
  },
};

export default api;
