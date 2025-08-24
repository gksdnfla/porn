import { Controller, Post } from '@nestjs/common';
import { DatabaseSeedService } from '../../database/database-seed.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly databaseSeedService: DatabaseSeedService) {}

  // 개발 환경에서만 사용 가능한 데이터베이스 리셋
  @Post('reset-database')
  async resetDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ 生产环境不允许重置数据库');
    }
    
    await this.databaseSeedService.resetDatabase();
    return {
      message: '✅ 数据库重置完成',
      timestamp: new Date().toISOString(),
    };
  }

  // 手동执行种子数据
  @Post('seed-database')
  async seedDatabase() {
    await this.databaseSeedService.seedDatabase();
    return {
      message: '✅ 数据库种子数据执行完成',
      timestamp: new Date().toISOString(),
    };
  }
}
