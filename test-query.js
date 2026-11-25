import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: '192.168.88.200',
  user: 'admin',
  password: 'passak@1400',
  database: 'asteriskcdrdb',
});

try {
  console.log('1. تست ساخت جدول...');
  await conn.query('DROP TABLE IF EXISTS _cdr_test');
  await conn.query('CREATE TABLE _cdr_test (id INT)');
  console.log('✅ ساخت جدول اوکیه!');
  
  console.log('2. تست تابع isMobile...');
  await conn.query('SELECT isMobile("09121111111", 1)');
  console.log('✅ تابع isMobile وجود داره!');
  
  console.log('3. تست تابع CorrectNum...');
  await conn.query('SELECT CorrectNum("09121111111")');
  console.log('✅ تابع CorrectNum وجود داره!');
} catch (e) {
  console.log('❌ خطا:', e.message);
}
await conn.end();