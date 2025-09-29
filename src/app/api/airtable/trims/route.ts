import { NextResponse } from 'next/server';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_TRIMS } = process.env as Record<string, string>;

export async function GET(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_TRIMS) {
    return NextResponse.json({ error: 'Missing Airtable env vars' }, { status: 500 });
  }
  const { searchParams } = new URL(request.url);
  const modelId = (searchParams.get('modelId') || '').trim();
  if (!modelId) return NextResponse.json([]);

  const filter = `(({model}) = '${modelId.replace(/'/g, "''")}')`;
  const params = new URLSearchParams({ maxRecords: '100', view: 'Grid view', filterByFormula: filter });
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_TRIMS}?${params.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, cache: 'no-store' });
  if (!res.ok) return NextResponse.json([]);
  const data: { records: Array<{ id: string; fields: { name?: string; fuel?: string; price?: number } }> } = await res.json();
  const results = data.records.map((r) => ({ id: r.id, name: r.fields.name || '', fuel: r.fields.fuel || '', price: r.fields.price || 0 })).filter((r) => r.name);
  return NextResponse.json(results);
}


