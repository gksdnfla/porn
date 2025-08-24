import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResult } from './dto/pagination.dto';
import { BanUserDto } from './dto/ban-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  // 사용자 생성
  async create(createUserDto: CreateUserDto): Promise<User> {
    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    return this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    } as any);
  }

  // 모든 사용자 조회
  async findAll(): Promise<User[]> {
    return this.userModel.findAll({
      attributes: { exclude: ['password'] }, // 비밀번호 제외
    });
  }

  // 분페이징 사용자 조회
  async findAllWithPagination(paginationDto: PaginationDto): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, search, sortBy = 'id', sortOrder = 'DESC' } = paginationDto;
    const offset = (page - 1) * limit;

    // 검색 조건 구성
    const whereCondition: any = {};
    if (search) {
      whereCondition[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { nickname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // 정렬 조건 구성
    const allowedSortFields = ['id', 'username', 'nickname', 'email', 'role', 'is_banned', 'created_at', 'updated_at'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // 데이터 조회
    const { count, rows } = await this.userModel.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password'] }, // 비밀번호 제외
      order: [[orderField, orderDirection]],
      limit,
      offset,
    });

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(count / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  // ID로 사용자 조회
  async findOne(id: number): Promise<User | null> {
    return this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] }, // 비밀번호 제외
    });
  }

  // 사용자명으로 사용자 조회 (로그인용)
  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { username },
    });
  }

  // 이메일로 사용자 조회
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email },
    });
  }

  // 사용자 정보 업데이트
  async update(id: number, updateUserDto: UpdateUserDto): Promise<[number, User[]]> {
    const updateData = { ...updateUserDto };
    
    // 비밀번호가 포함된 경우 암호화
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    return this.userModel.update(updateData, {
      where: { id },
      returning: true,
    });
  }

  // 사용자 삭제
  async remove(id: number): Promise<number> {
    return this.userModel.destroy({
      where: { id },
    });
  }

  // 사용자 封号
  async banUser(id: number, banUserDto: BanUserDto): Promise<User | null> {
    const { is_banned, ban_reason } = banUserDto;
    
    const [affectedCount] = await this.userModel.update(
      {
        is_banned,
        ban_reason,
      },
      {
        where: { id },
        returning: true,
      }
    );

    if (affectedCount === 0) {
      return null;
    }

    // 返回更新后的用户信息
    return this.findOne(id);
  }

  // 사용자 解封
  async unbanUser(id: number): Promise<User | null> {
    const [affectedCount] = await this.userModel.update(
      {
        is_banned: false,
        ban_reason: null,
      },
      {
        where: { id },
        returning: true,
      }
    );

    if (affectedCount === 0) {
      return null;
    }

    // 返回更新后的用户信息
    return this.findOne(id);
  }

  // 검查用户是否被封号
  async isUserBanned(id: number): Promise<{ isBanned: boolean; reason?: string }> {
    const user = await this.userModel.findByPk(id, {
      attributes: ['is_banned', 'ban_reason'],
    });

    if (!user) {
      return { isBanned: false };
    }

    return {
      isBanned: user.is_banned,
      reason: user.ban_reason || undefined,
    };
  }

  // 비밀번호 검증 (로그인용)
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // 사용자 인증 (로그인용)
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (user && await this.validatePassword(password, user.password)) {
      // 비밀번호를 제외한 사용자 정보 반환
      const { password: _, ...result } = user.toJSON();
      return result as User;
    }
    return null;
  }
}
