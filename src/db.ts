import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'database.sqlite');

export async function getDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
  await db.run('PRAGMA foreign_keys = ON');
  return db;
}

export async function initDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = await getDb();

  await db.exec(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT (datetime('now'))
  )`);

  await db.close();
}
