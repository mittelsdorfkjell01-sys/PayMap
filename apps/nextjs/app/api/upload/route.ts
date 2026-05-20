import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

// Magic-byte signatures for the allowed MIME types
const MAGIC: Array<{ type: string; bytes: number[]; offset?: number }> = [
  { type: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { type: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { type: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF header
];

async function detectMimeType(file: File): Promise<string | null> {
  const buf = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buf);
  for (const sig of MAGIC) {
    const off = sig.offset ?? 0;
    if (sig.bytes.every((b, i) => bytes[off + i] === b)) return sig.type;
  }
  return null;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 });
    }

    // Verify actual file content, not just the client-supplied Content-Type
    const detectedType = await detectMimeType(file);
    if (!detectedType || !ALLOWED_TYPES.includes(detectedType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const safeName = sanitizeFilename(file.name);
    const blob = await put(`documents/${user.id}/${Date.now()}-${safeName}`, file, {
      access: 'public',
      contentType: detectedType,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
