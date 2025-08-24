import {
  Controller,
  Post,
  Body,
  Session,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Session() session: Record<string, any>) {
    return this.authService.login(loginDto, session);
  }

  // 로그아웃
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Session() session: Record<string, any>) {
    await this.authService.logout(session);
    return { message: '로그아웃되었습니다' };
  }

  // 현재 사용자 정보 조회 (인증 필요)
  @Get('me')
  @UseGuards(AuthGuard)
  getCurrentUser(@Session() session: Record<string, any>) {
    const user = this.authService.getCurrentUser(session);
    return {
      message: '현재 사용자 정보',
      user,
    };
  }

  // 인증 상태 확인
  @Get('status')
  checkAuthStatus(@Session() session: Record<string, any>) {
    const user = this.authService.getCurrentUser(session);
    return {
      isAuthenticated: !!user,
      user,
      message: user ? '인증된 사용자' : '인증되지 않은 사용자',
    };
  }

  // 세션 정보 확인 (디버깅용)
  @Get('session-debug')
  getSessionInfo(@Session() session: Record<string, any>) {
    if (process.env.NODE_ENV === 'production') {
      return { message: '프로덕션 환경에서는 사용할 수 없습니다' };
    }
    
    return {
      sessionId: session.id,
      user: session.user || null,
      cookie: session.cookie,
    };
  }
}
