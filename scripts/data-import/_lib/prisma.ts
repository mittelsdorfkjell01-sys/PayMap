import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from repo root, then .env.local from apps/nextjs (where DATABASE_URL lives)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../apps/nextjs/.env.local') });
dotenv.config();

export const prisma = new PrismaClient();
