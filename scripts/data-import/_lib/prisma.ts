import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load DATABASE_URL from packages/db/.env (the canonical env), then repo root.
dotenv.config({ path: path.resolve(__dirname, '../../../packages/db/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const prisma = new PrismaClient();
