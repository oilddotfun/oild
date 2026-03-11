import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export const sql = getDb();

// Auto-create tables on first query
let tablesCreated = false;

export async function ensureTables() {
  if (tablesCreated) return;
  const db = sql;

  await db`
    CREATE TABLE IF NOT EXISTS claims (
      code TEXT PRIMARY KEY,
      claimed_by TEXT NOT NULL,
      token_address TEXT NOT NULL,
      x_community TEXT DEFAULT '',
      claimed_at BIGINT NOT NULL,
      population INT DEFAULT 0,
      gdp NUMERIC DEFAULT 0,
      oil_stolen INT DEFAULT 0,
      verified BOOLEAN DEFAULT FALSE
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS wars (
      id TEXT PRIMARY KEY,
      attacker_code TEXT NOT NULL,
      defender_code TEXT NOT NULL,
      attacker_token TEXT NOT NULL,
      defender_token TEXT NOT NULL,
      declared_by TEXT NOT NULL,
      tx_signature TEXT NOT NULL,
      started_at BIGINT NOT NULL,
      ends_at BIGINT NOT NULL,
      status TEXT DEFAULT 'active',
      winner TEXT,
      oil_stolen INT DEFAULT 0,
      attacker_volume NUMERIC DEFAULT 0,
      defender_volume NUMERIC DEFAULT 0
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS cooldowns (
      code TEXT PRIMARY KEY,
      expires_at BIGINT NOT NULL
    )
  `;

  tablesCreated = true;
}
