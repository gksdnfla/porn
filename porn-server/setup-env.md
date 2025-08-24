# .env 文件设置指南

## 🚀 问题已修复
- ✅ 已安装 `dotenv` 包
- ✅ 已在 `main.ts` 中配置环境变量加载
- ✅ 添加了调试信息来验证环境变量

## 📝 下一步操作

### 1. 创建 .env 文件
在 `porn-server` 目录下创建 `.env` 文件（与 package.json 同级）：

```bash
# 在 porn-server 目录下
touch .env
```

### 2. 配置 .env 文件内容
编辑 `.env` 文件，添加以下内容（根据你的实际情况修改）：

```bash
# 服务器配置
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8080

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_database_password
DB_DATABASE=porn_db

# 默认用户配置
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123456
DEFAULT_ADMIN_NICKNAME=系统管理员
DEFAULT_ADMIN_EMAIL=admin@localhost.com

DEFAULT_USER_USERNAME=testuser
DEFAULT_USER_PASSWORD=user123456
DEFAULT_USER_NICKNAME=测试用户
DEFAULT_USER_EMAIL=test@localhost.com
```

### 3. 启动服务器验证
```bash
npm run start:dev
```

启动时你会看到调试信息：
```
🔧 环境变量调试信息:
NODE_ENV: development
DB_HOST: localhost
DB_PORT: 3306
DB_DATABASE: porn_db
DEFAULT_ADMIN_USERNAME: admin
---
📊 数据库配置调试信息:
DB_HOST: localhost
DB_PORT: 3306
DB_USERNAME: root
DB_DATABASE: porn_db
---
```

### 4. 确认环境变量正确加载
如果看到：
- ✅ **正确**: 显示你设置的值
- ❌ **错误**: 显示 "undefined" 或默认值

### 5. 常见问题解决

**问题1: 仍然显示默认值**
- 确保 `.env` 文件在正确位置（porn-server/ 目录下）
- 确保文件名正确（`.env` 不是 `env.txt`）
- 重启服务器

**问题2: 文件权限问题**
```bash
chmod 644 .env
```

**问题3: 语法错误**
- 确保没有空格：`KEY=value` ✅
- 不要用引号包围简单值：`PORT=3000` ✅
- 特殊字符需要引号：`PASSWORD="pass@123"` ✅

### 6. 清理调试信息
环境变量正常工作后，可以删除调试代码：
- 从 `main.ts` 删除调试 console.log
- 从 `database.config.ts` 删除调试 console.log

## 🎯 测试结果期望
正确配置后，你应该看到：
1. 🔧 环境变量正确显示
2. 📊 数据库连接成功
3. 🌱 用户表自动创建默认用户
4. 🚀 服务器成功启动
