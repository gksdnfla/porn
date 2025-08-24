import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';
import { UserRole } from '../../../types/user.types';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: '사용자명은 필수입니다' })
  @MinLength(3, { message: '사용자명은 최소 3자 이상이어야 합니다' })
  @MaxLength(50, { message: '사용자명은 최대 50자까지 입니다' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임은 필수입니다' })
  @MaxLength(100, { message: '닉네임은 최대 100자까지 입니다' })
  nickname: string;

  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다' })
  @IsNotEmpty({ message: '이메일은 필수입니다' })
  email: string;

  @IsOptional()
  @IsString()
  @IsIn([UserRole.ADMIN, UserRole.USER], { message: '권한은 admin 또는 user만 가능합니다' })
  role?: 'admin' | 'user';
}
