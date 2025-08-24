import { RoleType } from './user.types';

// Session 데이터 타입 정의
export interface UserSessionData {
  userId: number;
  username: string;
  nickname: string;
  email: string;
  role: RoleType;
  isAuthenticated: boolean;
}

// Express Request 확장
declare module 'express-session' {
  interface SessionData {
    user?: UserSessionData;
  }
}
