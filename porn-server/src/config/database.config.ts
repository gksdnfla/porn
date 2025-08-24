import { SequelizeModuleOptions } from '@nestjs/sequelize';

export const databaseConfig: SequelizeModuleOptions = {
  dialect: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'porn_db',
  autoLoadModels: true,
  synchronize: process.env.NODE_ENV !== 'production', // 프로덕션에서는 false로 설정
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectModule: require('mariadb'), // 명시적으로 MariaDB 드라이버 지정
  dialectOptions: {
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    // MariaDB 특정 옵션
    timezone: '+09:00', // 한국 시간대
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true, // createdAt, updatedAt 자동 생성
    underscored: true, // snake_case 사용
    freezeTableName: true, // 테이블명 복수형 변환 방지
    charset: 'utf8mb4', // 이모지 지원
    collate: 'utf8mb4_unicode_ci',
  },
};
