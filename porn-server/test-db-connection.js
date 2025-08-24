// 数据库连接测试脚本
require('dotenv').config();
const mariadb = require('mariadb');

async function testConnection() {
  console.log('🔧 开始测试数据库连接...');
  console.log('配置信息:');
  console.log('- Host:', process.env.DB_HOST || 'localhost');
  console.log('- Port:', process.env.DB_PORT || '3306');
  console.log('- Username:', process.env.DB_USERNAME || 'root');
  console.log('- Database:', process.env.DB_DATABASE || 'porn_db');
  console.log('---');

  let conn;
  try {
    // 首先测试连接到 MariaDB 服务器（不连接特定数据库）
    console.log('🔍 步骤1: 测试 MariaDB 服务器连接...');
    conn = await mariadb.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      connectTimeout: 5000,
    });
    console.log('✅ MariaDB 服务器连接成功!');

    // 检查数据库是否存在
    const dbName = process.env.DB_DATABASE || 'porn_db';
    console.log(`🔍 步骤2: 检查数据库 '${dbName}' 是否存在...`);
    
    const databases = await conn.query('SHOW DATABASES');
    const dbExists = databases.some(db => Object.values(db)[0] === dbName);
    
    if (!dbExists) {
      console.log(`⚠️  数据库 '${dbName}' 不存在，正在创建...`);
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ 数据库 '${dbName}' 创建成功!`);
    } else {
      console.log(`✅ 数据库 '${dbName}' 已存在!`);
    }

    // 测试连接到具体数据库
    await conn.end();
    console.log('🔍 步骤3: 测试连接到目标数据库...');
    
    conn = await mariadb.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      connectTimeout: 5000,
    });
    
    console.log('✅ 目标数据库连接成功!');
    console.log('🎉 所有数据库连接测试通过!');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 建议: MariaDB/MySQL 服务未启动，请启动数据库服务');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 建议: 用户名或密码错误，请检查 .env 文件配置');
    } else if (error.code === 'ENOTFOUND') {
      console.error('💡 建议: 数据库主机地址错误，请检查 DB_HOST 配置');
    }
    
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
      console.log('🔒 数据库连接已关闭');
    }
  }
}

testConnection();
