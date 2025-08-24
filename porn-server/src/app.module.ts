import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { ContentModule } from './modules/content/content.module';
import { AdvertisementModule } from './modules/advertisement/advertisement.module';

@Module({
  imports: [
    SequelizeModule.forRoot(databaseConfig),
    DatabaseModule,
    UserModule,
    AuthModule,
    AdminModule,
    CategoryModule,
    ContentModule,
    AdvertisementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
