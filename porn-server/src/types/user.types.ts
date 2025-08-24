// 用户权限枚举
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// 权限检查辅助类型
export type RoleType = 'admin' | 'user';
