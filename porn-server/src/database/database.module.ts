import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Content } from '../entities/content.entity';
import { Advertisement } from '../entities/advertisement.entity';
import { DatabaseSeedService } from './database-seed.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Category, Content, Advertisement])],
  providers: [DatabaseSeedService],
  exports: [DatabaseSeedService],
})
export class DatabaseModule {}
