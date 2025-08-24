'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

// 用户信息类型
interface User {
  userId: number;
  username: string;
  nickname: string;
  email: string;
  role: 'admin' | 'user';
  isAuthenticated: boolean;
}

// 认证上下文类型
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const response = await authAPI.checkStatus();
      const authData = response.data;
      
      if (authData.isAuthenticated && authData.user) {
        setUser(authData.user);
      } else {
        setUser(null);
        // 如果没有登录，尝试自动登录
        await attemptAutoLogin();
      }
    } catch (error) {
      console.log('认证检查失败:', error);
      setUser(null);
      // 认证检查失败也尝试自动登录
      await attemptAutoLogin();
    } finally {
      setLoading(false);
    }
  };

  // 尝试自动登录
  const attemptAutoLogin = async () => {
    try {
      const rememberLogin = localStorage.getItem('rememberLogin');
      const savedUsername = localStorage.getItem('username');
      const savedPassword = localStorage.getItem('password');

      if (rememberLogin === 'true' && savedUsername && savedPassword) {
        console.log('尝试自动登录:', savedUsername);
        const userData = await login(savedUsername, savedPassword);
        console.log('自动登录成功:', userData);
      }
    } catch (error) {
      console.log('自动登录失败:', error);
      // 自动登录失败，清除存储的信息
      localStorage.removeItem('rememberLogin');
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    }
  };

  // 登录
  const login = async (username: string, password: string): Promise<User> => {
    try {
      const response = await authAPI.login(username, password);
      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  // 登出
  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      setUser(null);
      // 清除本地存储
      localStorage.removeItem('rememberLogin');
      localStorage.removeItem('username');
      localStorage.removeItem('password');
    }
  };

  // 页面加载时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  // 计算派生状态
  const isAuthenticated = !!user?.isAuthenticated;
  const isAdmin = user?.role === 'admin';

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    checkAuth,
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook 使用认证上下文
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 认证保护组件
interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, fallback, requireAdmin = false }: AuthGuardProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">认证检查中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">请先登录</div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return fallback || (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">需要管理员权限</div>
      </div>
    );
  }

  return <>{children}</>;
}
