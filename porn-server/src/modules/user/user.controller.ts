import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { AdminGuard } from '../auth/guards/auth.guard';

@Controller('/admin/users')
@UseGuards(AdminGuard) // 整个 controller 需要管理员权限
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 사용자 생성 (관리자 전용)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // 모든 사용자 조회 (관리자 전용) - 분페이징 지원
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAllWithPagination(paginationDto);
  }

  // ID로 사용자 조회 (관리자 전용)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // 사용자 정보 업데이트 (관리자 전용)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // 사용자 삭제 (관리자 전용)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  // 사용자 封号 (관리자 전용)
  @Patch(':id/ban')
  async banUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() banUserDto: BanUserDto,
  ) {
    const user = await this.userService.banUser(id, banUserDto);
    if (!user) {
      return { message: '사용자를 찾을 수 없습니다' };
    }
    return {
      message: banUserDto.is_banned ? '사용자가 성공적으로 封号되었습니다' : '사용자 封号 상태가 업데이트되었습니다',
      user,
    };
  }

  // 사용자 解封 (관리자 전용)
  @Patch(':id/unban')
  async unbanUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.unbanUser(id);
    if (!user) {
      return { message: '사용자를 찾을 수 없습니다' };
    }
    return {
      message: '사용자가 성공적으로 解封되었습니다',
      user,
    };
  }

  // 사용자 封号 상태 확인 (관리자 전용)
  @Get(':id/ban-status')
  async getUserBanStatus(@Param('id', ParseIntPipe) id: number) {
    const banStatus = await this.userService.isUserBanned(id);
    return {
      userId: id,
      ...banStatus,
    };
  }
}
