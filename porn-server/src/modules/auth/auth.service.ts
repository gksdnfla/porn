import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { UserSessionData } from '../../types/session.types';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  // 사용자 인증
  async validateUser(loginDto: LoginDto): Promise<UserSessionData> {
    const { username, password } = loginDto;
    
    // 사용자 조회
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 잘못되었습니다');
    }

    // 비밀번호 검증
    const isPasswordValid = await this.userService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 잘못되었습니다');
    }

    // 封号 상태 확인
    const banStatus = await this.userService.isUserBanned(user.id);
    if (banStatus.isBanned) {
      let banMessage = '계정이 封号되었습니다';
      if (banStatus.reason) {
        banMessage += `. 사유: ${banStatus.reason}`;
      }
      throw new UnauthorizedException(banMessage);
    }

    // 세션 데이터 반환 (비밀번호 제외)
    return {
      userId: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      isAuthenticated: true,
    };
  }

  // 로그인
  async login(loginDto: LoginDto, session: any): Promise<{ message: string; user: UserSessionData }> {
    const userData = await this.validateUser(loginDto);
    
    // 세션에 사용자 정보 저장
    session.user = userData;
    
    return {
      message: '로그인 성공',
      user: userData,
    };
  }

  // 로그아웃
  logout(session: any): Promise<void> {
    return new Promise((resolve, reject) => {
      session.destroy((err: any) => {
        if (err) {
          reject(new Error('로그아웃 중 오류가 발생했습니다'));
        } else {
          resolve();
        }
      });
    });
  }

  // 현재 사용자 정보 조회
  getCurrentUser(session: any): UserSessionData | null {
    // 세션이 존재하지 않는 경우
    if (!session) {
      console.log('세션이 존재하지 않습니다');
      return null;
    }

    // 세션에 사용자 정보가 없는 경우
    if (!session.user) {
      console.log('세션에 사용자 정보가 없습니다');
      return null;
    }

    // 사용자 인증 상태 확인
    if (!session.user.isAuthenticated) {
      console.log('사용자가 인증되지 않았습니다');
      return null;
    }

    return session.user;
  }
}
