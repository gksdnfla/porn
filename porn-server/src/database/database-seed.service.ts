import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { UserRole } from '../types/user.types';

@Injectable()
export class DatabaseSeedService {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  async seedDatabase(): Promise<void> {
    try {
      // 체크用户表是否为空
      const userCount = await this.userModel.count();
      
      if (userCount === 0) {
        this.logger.log('🌱 用户表为空，开始创建默认用户数据...');
        await this.createDefaultUsers();
        this.logger.log('✅ 默认用户数据创建完成');
      } else {
        this.logger.log(`📊 用户表已有 ${userCount} 条数据，跳过初始化`);
      }

      // 체크카테고리表是否为空
      const categoryCount = await this.categoryModel.count();
      
      if (categoryCount === 0) {
        this.logger.log('🌱 카테고리表为空，开始创建默认카테고리数据...');
        await this.createDefaultCategories();
        this.logger.log('✅ 默认카테고리数据创建完成');
      } else {
        this.logger.log(`📊 카테고리表已有 ${categoryCount} 条数据，跳过初始化`);
      }
    } catch (error) {
      this.logger.error('❌ 数据库종자数据创建失败:', error);
      throw error;
    }
  }

  private async createDefaultUsers(): Promise<void> {
    const defaultUsers = this.getDefaultUsersFromEnv();
    
    for (const userData of defaultUsers) {
      try {
        // 密码加密
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        await this.userModel.create({
          username: userData.username,
          password: hashedPassword,
          nickname: userData.nickname,
          email: userData.email,
          role: userData.role || UserRole.ADMIN,
        } as any);
        
        this.logger.log(`👤 创建用户: ${userData.username} (${userData.nickname})`);
      } catch (error) {
        this.logger.error(`❌ 创建用户失败 ${userData.username}:`, error.message);
      }
    }
  }

  private getDefaultUsersFromEnv(): Array<{
    username: string;
    password: string;
    nickname: string;
    email: string;
    role?: 'admin' | 'user';
  }> {
    const users: Array<{
      username: string;
      password: string;
      nickname: string;
      email: string;
      role?: 'admin' | 'user';
    }> = [];

    // 管리자 사용자
    if (process.env.DEFAULT_ADMIN_USERNAME) {
      users.push({
        username: process.env.DEFAULT_ADMIN_USERNAME,
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        nickname: process.env.DEFAULT_ADMIN_NICKNAME || '管理员',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
        role: UserRole.ADMIN,
      });
    }

    // 일반 테스트 사용자
    if (process.env.DEFAULT_USER_USERNAME) {
      users.push({
        username: process.env.DEFAULT_USER_USERNAME,
        password: process.env.DEFAULT_USER_PASSWORD || 'user123',
        nickname: process.env.DEFAULT_USER_NICKNAME || '测试用户',
        email: process.env.DEFAULT_USER_EMAIL || 'user@example.com',
        role: UserRole.USER,
      });
    }

    // 多个用户 (JSON 형식)
    if (process.env.DEFAULT_USERS_JSON) {
      try {
        const additionalUsers = JSON.parse(process.env.DEFAULT_USERS_JSON);
        if (Array.isArray(additionalUsers)) {
          users.push(...additionalUsers);
        }
      } catch (error) {
        this.logger.error('❌ DEFAULT_USERS_JSON 格式错误:', error.message);
      }
    }

    // 如果没有配置任何用户，创建默认管理员
    if (users.length === 0) {
      this.logger.warn('⚠️  未找到环境变量配置，使用默认管理员账户');
      users.push({
        username: 'admin',
        password: 'admin123',
        nickname: '系统管理员',
        email: 'admin@localhost.com',
        role: UserRole.ADMIN,
      });
    }

    return users;
  }

  // 手동重置数据库 (개발용)
  async resetDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ 생산 환경에서는 데이터베이스 리셋이 허용되지 않습니다');
    }

    this.logger.warn('🔄 데이터베이스 리셋 시작...');
    
    // 모든 사용자 삭제
    await this.userModel.destroy({ where: {}, truncate: true });
    
    // 모든 카테고리 삭제
    await this.categoryModel.destroy({ where: {}, truncate: true });
    
    // 기본 데이터 재생성
    await this.createDefaultUsers();
    await this.createDefaultCategories();
    
    this.logger.log('✅ 데이터베이스 리셋 완료');
  }

  private async createDefaultCategories(): Promise<void> {
    const defaultCategories = [
      // 최상위 카테고리
      { name: '한국야동', parent_id: null },
      { name: '일본야동', parent_id: null },
      { name: '서양야동', parent_id: null },
      { name: '동양야동', parent_id: null },
      { name: '애니야동', parent_id: null },
      { name: 'KBJ', parent_id: 1 },
      { name: '미공개', parent_id: 1 },
      { name: '19영화', parent_id: 1 },
      { name: 'JAV LEAKED', parent_id: 2 },
      { name: 'JAV 유모', parent_id: 2 },
      { name: 'JAV 노모 ', parent_id: 2 },
    ];

    for (const categoryData of defaultCategories) {
      try {
        await this.categoryModel.create({
          name: categoryData.name,
          parent_id: categoryData.parent_id,
        } as any);
        
        this.logger.log(`📁 카테고리 생성: ${categoryData.name}`);
      } catch (error) {
        this.logger.error(`❌ 카테고리 생성 실패 ${categoryData.name}:`, error.message);
      }
    }
  }
}
