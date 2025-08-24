import { config } from 'dotenv';

// 在所有其他导入之前加载环境变量
config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
const session = require('express-session');
import { AppModule } from './app.module';
import { DatabaseSeedService } from './database/database-seed.service';

async function bootstrap() {
  // 调试：显示环境变量加载状态
  console.log('🔧 环境变量调试信息:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_DATABASE:', process.env.DB_DATABASE);
  console.log('DEFAULT_ADMIN_USERNAME:', process.env.DEFAULT_ADMIN_USERNAME);
  console.log('---');

  const app = await NestFactory.create(AppModule);
  
  // Session 설정
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'porn-app-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24시간
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송
      },
    }),
  );
  
  // 전역 validation pipe 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO에 정의되지 않은 속성 제거
    forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러
    transform: true, // 자동 타입 변환
  }));

  // CORS 설정
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:8080',
    credentials: true,
  });

  // 数据库种子数据初始화
  try {
    const databaseSeedService = app.get(DatabaseSeedService);
    await databaseSeedService.seedDatabase();
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    // 개발 환경에서는 에러가 있어도 계속 진행
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  await app.listen(process.env.PORT ?? 8080);
  console.log(`🚀 服务器在端口 ${process.env.PORT ?? 8080} 上运行中`);
}
bootstrap();
