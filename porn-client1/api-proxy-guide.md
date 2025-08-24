# API 代理中间件配置指南

## 🎉 功能完成

已成功创建了一个完整的 API 代理系统，将前端的 `/api` 请求代理到后端 `localhost:8080`。

### 📁 创建的文件

1. **`middleware.ts`** - Next.js 中间件，拦截 `/api` 请求
2. **`app/api-proxy/[...path]/route.ts`** - API 路由处理器，使用 axios 实现代理
3. **`lib/api.ts`** - API 客户端工具类，封装常用 API 调用
4. **`components/ApiExample.tsx`** - API 测试组件

### 🔧 工作原理

```
前端请求: /api/auth/login
    ↓ (middleware.ts 拦截)
重写为: /api-proxy/auth/login  
    ↓ (route.ts 处理)
代理到: http://localhost:8080/auth/login
```

### 🚀 使用方法

#### 1. 安装依赖
```bash
npm install axios
```

#### 2. 环境变量设置
创建 `.env.local` 文件：
```bash
BACKEND_URL=http://localhost:8080
```

#### 3. 使用 API 客户端
```typescript
import { authAPI, userAPI, apiClient } from '@/lib/api';

// 登录
const login = async () => {
  try {
    const response = await authAPI.login('admin', 'admin123456');
    console.log('登录成功:', response.data);
  } catch (error) {
    console.error('登录失败:', error);
  }
};

// 获取用户列表
const getUsers = async () => {
  try {
    const response = await userAPI.getUsers();
    console.log('用户列表:', response.data);
  } catch (error) {
    console.error('获取失败:', error);
  }
};

// 自定义请求
const customRequest = async () => {
  try {
    const response = await apiClient.get('/custom-endpoint');
    console.log('响应:', response.data);
  } catch (error) {
    console.error('请求失败:', error);
  }
};
```

#### 4. 在组件中使用
```typescript
'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api';

export default function LoginComponent() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await authAPI.login('username', 'password');
      // 登录成功处理
    } catch (error) {
      // 错误处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? '登录中...' : '登录'}
    </button>
  );
}
```

### 🛠️ 特性

- ✅ **自动路径处理**: `/api` 前缀自动去掉
- ✅ **完整 HTTP 方法支持**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- ✅ **Cookie 支持**: 自动处理 session cookies
- ✅ **CORS 处理**: 自动设置 CORS 头
- ✅ **错误处理**: 完善的错误处理和日志
- ✅ **TypeScript 支持**: 完整的类型定义
- ✅ **请求拦截**: 自动日志记录
- ✅ **超时处理**: 30秒请求超时

### 📊 API 映射示例

| 前端请求 | 代理到后端 |
|---------|-----------|
| `/api/auth/login` | `http://localhost:8080/auth/login` |
| `/api/users` | `http://localhost:8080/users` |
| `/api/users/123` | `http://localhost:8080/users/123` |
| `/api/admin/reset-database` | `http://localhost:8080/admin/reset-database` |

### 🧪 测试代理

1. **使用测试组件**:
   - 导入 `ApiExample` 组件到你的页面
   - 测试各种 API 调用

2. **浏览器控制台**:
   - 查看请求日志
   - 检查响应数据

3. **网络选项卡**:
   - 验证请求被正确代理
   - 检查 cookies 传递

### ⚙️ 配置选项

在 `lib/api.ts` 中可以自定义：

```typescript
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,        // 修改超时时间
  withCredentials: true, // Cookie 支持
  headers: {
    'Content-Type': 'application/json',
    // 添加自定义头
  },
});
```

### 🔍 调试

1. **查看控制台日志**:
   - 请求发送日志: `🚀 发送请求`
   - 响应成功日志: `✅ 响应成功`
   - 错误日志: `❌ 响应错误`

2. **后端日志**:
   - 代理处理日志: `🔄 代理请求`
   - 错误日志: `❌ 代理请求失败`

### 🚨 注意事项

1. **确保后端运行**: 后端服务器必须在 `localhost:8080` 运行
2. **CORS 配置**: 后端需要允许来自前端的请求
3. **Session 支持**: 后端需要配置正确的 session 设置
4. **环境变量**: 生产环境需要配置正确的 `BACKEND_URL`

## 🎯 完成！

API 代理中间件已完全配置完成，可以开始使用了！🚀
