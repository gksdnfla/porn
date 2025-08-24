-- MariaDB 데이터베이스 초기화 스크립트
-- Database initialization script for MariaDB

CREATE DATABASE IF NOT EXISTS porn_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 (선택사항)
-- CREATE USER IF NOT EXISTS 'porn_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON porn_db.* TO 'porn_user'@'localhost';
-- FLUSH PRIVILEGES;

USE porn_db;

-- 사용자 테이블은 Sequelize가 자동으로 생성합니다
-- 이 파일은 데이터베이스 생성 참고용입니다
