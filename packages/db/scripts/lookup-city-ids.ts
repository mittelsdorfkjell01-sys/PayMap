import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../apps/nextjs/.env.local') });
const prisma = new PrismaClient();
prisma.city.findMany({
  where: { slug: { in: ['amsterdam', 'wien', 'dubai', 'porto', 'barcelona', 'rom', 'paris', 'prag', 'budapest', 'zuerich', 'bangkok'] } },
  select: { id: true, slug: true, nameEN: true },
  orderBy: { slug: 'asc' },
}).then(r => {
  r.forEach(c => console.log(`${c.slug}: ${c.id}  (${c.nameEN})`));
  prisma.$disconnect();
});
