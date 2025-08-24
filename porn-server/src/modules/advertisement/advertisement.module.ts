import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Advertisement } from '../../entities/advertisement.entity';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementController } from './advertisement.controller';

@Module({
  imports: [SequelizeModule.forFeature([Advertisement])],
  controllers: [AdvertisementController],
  providers: [AdvertisementService],
  exports: [AdvertisementService],
})
export class AdvertisementModule {}
