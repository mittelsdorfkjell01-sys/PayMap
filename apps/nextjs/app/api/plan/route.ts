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

  const plan = await prisma.movingPlan.findFirst({
    where: { userId: user.id, isActive: true },
    include: {
      fromCity: { select: { id: true, slug: true, nameDE: true, nameEN: true, flag: true } },
      toCity: { select: { id: true, slug: true, nameDE: true, nameEN: true, flag: true } },
    },
  });

  if (!plan) return NextResponse.json(null);

  const steps = await prisma.movingGuide.findMany({
    where: { cityId: plan.toCityId, isActive: true },
    orderBy: [{ stepOrder: 'asc' }],
  });

  return NextResponse.json({ plan, steps });
}

const CreatePlanSchema = z.object({
  toCitySlug: z.string().min(1),
  fromCitySlug: z.string().min(1),
  nationality: z.enum(['eu', 'non-eu']),
  situation: z.string().min(1),
  employment: z.string().min(1),
  assets: z.array(z.string()),
  targetDate: z.string().datetime(),
  locale: z.enum(['de', 'en']).default('de'),
});

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = CreatePlanSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { toCitySlug, fromCitySlug, nationality, situation, employment, assets, targetDate, locale } = parsed.data;

  const [fromCity, toCity] = await Promise.all([
    prisma.city.findUnique({ where: { slug: fromCitySlug }, include: { col: true } }),
    prisma.city.findUnique({ where: { slug: toCitySlug }, include: { col: true } }),
  ]);

  if (!fromCity || !toCity) return NextResponse.json({ error: 'City not found' }, { status: 404 });

  const depositRent = toCity.col?.rent ?? 1200;
  const isEN = locale === 'en';
  const budgetItems = [
    { label: isEN ? 'Security Deposit' : 'Kaution', amount: depositRent * 3, isCustom: false, isEditable: true },
    { label: isEN ? 'Moving / Shipping' : 'Spedition / Gepäckversand', amount: 1500, isCustom: false, isEditable: true },
    { label: isEN ? 'Tax Advisor' : 'Steuerberater', amount: 2000, isCustom: false, isEditable: true },
    { label: isEN ? 'Official Fees' : 'Behördengebühren', amount: 500, isCustom: false, isEditable: true },
    { label: isEN ? 'Temporary Health Insurance' : 'Überbrückungs-KV', amount: 600, isCustom: false, isEditable: true },
    { label: isEN ? 'Temporary Accommodation' : 'Übergangswohnung', amount: 1800, isCustom: false, isEditable: true },
    { label: isEN ? 'Initial Supplies / Misc' : 'Erstausstattung / Diverses', amount: 1000, isCustom: false, isEditable: true },
  ];

  const documents = [
    { name: isEN ? 'Passport' : 'Reisepass', status: 'pending' },
    { name: isEN ? 'National ID Card' : 'Personalausweis', status: 'pending' },
    { name: isEN ? 'Deregistration Certificate (DE)' : 'Meldebescheinigung (Abmeldung DE)', status: 'pending' },
    { name: isEN ? 'Birth Certificate' : 'Geburtsurkunde', status: 'pending' },
    { name: isEN ? 'Criminal Record Check' : 'Führungszeugnis', status: 'pending' },
    { name: isEN ? 'Health Insurance Proof' : 'Krankenversicherungsnachweis', status: 'pending' },
  ];

  const plan = await prisma.movingPlan.upsert({
    where: { userId_fromCityId_toCityId: { userId: user.id, fromCityId: fromCity.id, toCityId: toCity.id } },
    update: { isActive: true, nationality, situation, employment, assets, targetDate: new Date(targetDate), locale, updatedAt: new Date() },
    create: {
      userId: user.id,
      fromCityId: fromCity.id,
      toCityId: toCity.id,
      nationality, situation, employment, assets,
      targetDate: new Date(targetDate),
      locale,
      completedStepIds: [],
      skippedStepIds: [],
      budgetItems,
      documents,
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
