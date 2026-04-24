import Database from 'better-sqlite3';
import { env } from '@/lib/env';

export const db = new Database(env.CONTENTOPS_DB_PATH, {
  readonly: env.CONTENTOPS_DEMO_MODE,
});
