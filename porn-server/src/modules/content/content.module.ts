import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Content } from '../../entities/content.entity';
import { Category } from '../../entities/category.entity';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';

@Module({
  imports: [SequelizeModule.forFeature([Content, Category])],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
