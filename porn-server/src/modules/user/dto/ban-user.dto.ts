import { IsOptional, IsBoolean, IsString, MaxLength } from 'class-validator';

export class BanUserDto {
  @IsBoolean({ message: '封号状态必须是布尔값' })
  is_banned: boolean;

  @IsOptional()
  @IsString({ message: '封号原因必须是字符串' })
  @MaxLength(1000, { message: '封号原因不能超过1000个字符' })
  ban_reason?: string | null;
}

export class UnbanUserDto {
  @IsBoolean({ message: '解封状态必须是布尔값' })
  is_banned: false;

  ban_reason?: null;
}
