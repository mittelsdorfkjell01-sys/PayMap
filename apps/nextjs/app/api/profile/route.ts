import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

async function getAuthUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await prisma.userProfile.findUnique({ where: { id: user.id } });
  if (!profile) return NextResponse.json(null);

  return NextResponse.json(profile);
}

const UpdateSchema = z.object({
  grossAnnual: z.number().positive().optional(),
  employment: z.enum(['employed', 'freelancer', 'founder', 'passive']).optional(),
  familyStatus: z.enum(['single', 'married', 'divorced']).optional(),
  childrenCount: z.number().int().min(0).max(20).optional(),
  kvType: z.enum(['statutory', 'private']).optional(),
  taxResidency: z.string().optional(),
  onboardingDone: z.boolean().optional(),
});

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const data = parsed.data;

  const profile = await prisma.userProfile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email!,
      ...data,
    },
    update: data,
  });

  return NextResponse.json(profile);
}
