import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '../../../types/user.types';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = (request as any).session;

    // 먼저 세션이 존재하는지 확인
    if (!session) {
      throw new UnauthorizedException('세션이 존재하지 않습니다');
    }

    // 세션에 사용자 정보가 있는지 확인
    if (!session.user) {
      throw new UnauthorizedException('사용자 정보가 없습니다');
    }

    // 사용자가 인증되었는지 확인
    if (!session.user.isAuthenticated) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다');
    }

    return true;
  }
}

// 관리자 권한 가드 (향후 확장용)
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = (request as any).session;

    // 먼저 세션이 존재하는지 확인
    if (!session) {
      throw new UnauthorizedException('세션이 존재하지 않습니다');
    }

    // 세션에 사용자 정보가 있는지 확인
    if (!session.user) {
      throw new UnauthorizedException('사용자 정보가 없습니다');
    }

    // 사용자가 인증되었는지 확인
    if (!session.user.isAuthenticated) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다');
    }

    // 관리자 권한 확인
    if (session.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('관리자 권한이 필요합니다');
    }

    return true;
  }
}
