// src/config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const issabelPool = mysql.createPool({
  host: process.env.ISSABEL_HOST,
  port: Number(process.env.ISSABEL_PORT) || 3306,
  user: process.env.ISSABEL_USER,
  password: process.env.ISSABEL_PASS,
  database: process.env.ISSABEL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+03:30',
  dateStrings: true,
});

export const passakPool = mysql.createPool({
  host: process.env.PASSAK_HOST,
  port: Number(process.env.PASSAK_PORT) || 3306,
  user: process.env.PASSAK_USER,
  password: process.env.PASSAK_PASS,
  database: process.env.PASSAK_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+03:30',
  dateStrings: true,
});