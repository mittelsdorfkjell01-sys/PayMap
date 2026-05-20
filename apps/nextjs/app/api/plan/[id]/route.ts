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

const BudgetItemSchema = z.object({
  label: z.string(),
  amount: z.number(),
  isCustom: z.boolean(),
  isEditable: z.boolean(),
});

const DocumentSchema = z.object({
  name: z.string(),
  status: z.string(),
  uploadUrl: z.string().optional(),
  note: z.string().optional(),
});

const PatchSchema = z.object({
  completedStepIds: z.array(z.string()).optional(),
  skippedStepIds: z.array(z.string()).optional(),
  budgetItems: z.array(BudgetItemSchema).optional(),
  documents: z.array(DocumentSchema).optional(),
  targetDate: z.string().datetime().optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.movingPlan.findUnique({
    where: { id: params.id },
    include: {
      fromCity: { select: { id: true, slug: true, nameDE: true, nameEN: true, flag: true } },
      toCity: { select: { id: true, slug: true, nameDE: true, nameEN: true, flag: true } },
    },
  });
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (plan.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json(plan);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.movingPlan.findUnique({ where: { id: params.id } });
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (plan.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { targetDate, ...rest } = parsed.data;

  const updated = await prisma.movingPlan.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(targetDate ? { targetDate: new Date(targetDate) } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.movingPlan.findUnique({ where: { id: params.id } });
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (plan.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.movingPlan.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
