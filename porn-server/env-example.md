# 环境变量配置示例 (Environment Variables Example)

创建 `.env` 文件并配置以下变量：

## 基础配置 (Basic Configuration)
```bash
# 服务器端口
PORT=3000

# 环境设置
NODE_ENV=development

# 客户端URL (CORS)
CLIENT_URL=http://localhost:8080
```

## 数据库配置 (Database Configuration)
```bash
# MariaDB/MySQL 连接配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=porn_db
```

## 默认用户配置 (Default Users Configuration)

### 方式1: 单个管理员用户
```bash
# 默认管理员用户
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123456
DEFAULT_ADMIN_NICKNAME=系统管理员
DEFAULT_ADMIN_EMAIL=admin@example.com
```

### 方式2: 单个普通用户
```bash
# 默认普通用户
DEFAULT_USER_USERNAME=testuser
DEFAULT_USER_PASSWORD=user123456
DEFAULT_USER_NICKNAME=测试用户
DEFAULT_USER_EMAIL=user@example.com
```

### 方式3: 多个用户 (JSON格式)
```bash
# 多个默认用户 (JSON数组格式)
DEFAULT_USERS_JSON='[
  {
    "username": "admin",
    "password": "admin123456",
    "nickname": "管理员",
    "email": "admin@example.com"
  },
  {
    "username": "editor",
    "password": "editor123456", 
    "nickname": "编辑员",
    "email": "editor@example.com"
  },
  {
    "username": "user1",
    "password": "user123456",
    "nickname": "用户1",
    "email": "user1@example.com"
  }
]'
```

## 完整配置示例 (.env)
```bash
# 服务器配置
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:8080

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
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

## 注意事项 (Notes)

1. **密码安全**: 生产环境请使用强密码
2. **首次启动**: 服务器首次启动时会自动检查用户表，如为空则创建默认用户
3. **密码加密**: 密码会自动使用 bcrypt 进行加密存储
4. **灵活配置**: 可以只配置管理员用户，或只配置普通用户，或使用JSON配置多个用户
5. **默认行为**: 如果没有配置任何用户，系统会自动创建一个默认管理员账户 (admin/admin123)

## 开发环境数据库重置 (Development Reset)

如果需要重置数据库数据 (仅开发环境)，可以添加控制器端点或使用以下服务方法：

```typescript
// 在控制器中调用
await databaseSeedService.resetDatabase();
```
