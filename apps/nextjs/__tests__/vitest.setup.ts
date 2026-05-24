import { config } from 'dotenv';
import path from 'path';

// process.cwd() is apps/nextjs when running via npm workspace script
// Go up 2 levels to reach the monorepo root where .env.local lives
const result = config({ path: path.resolve(process.cwd(), '../../.env.local') });
if (result.error) {
  // Fallback: try the current directory
  config({ path: path.resolve(process.cwd(), '.env.local') });
}
