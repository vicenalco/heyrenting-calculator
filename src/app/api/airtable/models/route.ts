import { NextResponse } from 'next/server';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_MODELS } = process.env as Record<string, string>;

export async function GET(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_MODELS) {
    return NextResponse.json({ error: 'Missing Airtable env vars' }, { status: 500 });
  }
  const { searchParams } = new URL(request.url);
  const brandId = (searchParams.get('brandId') || '').trim();
  if (!brandId) return NextResponse.json([]);

  // Primero probamos sin filtro para ver qué campos hay
  const params = new URLSearchParams({ maxRecords: '5' });
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_MODELS}?${params.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, cache: 'no-store' });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return NextResponse.json({ error: 'Airtable error', detail: errText }, { status: 500 });
  }
  const data: { records: Array<{ id: string; fields: Record<string, unknown> }> } = await res.json();
  
  // Devolvemos la estructura para debug
  return NextResponse.json({ 
    debug: true,
    brandId,
    sampleRecord: data.records[0] || null,
    allFields: data.records[0]?.fields || {},
    totalRecords: data.records.length
  });
}


