// test-db.js
import mysql from 'mysql2/promise';

async function test(host, db, pass, label) {
  console.log(`\n--- Testing ${label} (${host}/${db}) ---`);
  try {
    const conn = await mysql.createConnection({
      host,
      port: 3306,
      user: 'admin',
      password: pass,
      database: db,
      connectTimeout: 5000,
    });
    const [rows] = await conn.query('SELECT VERSION() AS v, USER() AS u');
    console.log(`OK - MySQL ${rows[0].v}, user ${rows[0].u}`);
    await conn.end();
  } catch (e) {
    console.log(`FAILED - code: ${e.code}`);
    console.log(`message: ${e.message}`);
  }
}

const run = async () => {
  await test('192.168.88.200', 'asteriskcdrdb', 'passak@1400', 'Issabel');
  await test('192.168.88.202', 'passak9697', '115599', 'Passak');
};

run();