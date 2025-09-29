import { NextResponse } from 'next/server';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_BRANDS } = process.env as Record<string, string>;

export async function GET(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_BRANDS) {
    return NextResponse.json({ error: 'Missing Airtable env vars' }, { status: 500 });
  }
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const filter = q ? `FIND(LOWER('${q.replace(/'/g, "''")}'), LOWER({name}))` : '';
  const params = new URLSearchParams({
    maxRecords: '50',
    view: 'Grid view',
  });
  if (filter) params.append('filterByFormula', filter);

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_BRANDS}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    cache: 'no-store',
  });
  if (!res.ok) return NextResponse.json([], { status: 200 });
  const data: { records: Array<{ id: string; fields: { name?: string } }> } = await res.json();
  const results = data.records.map((r) => ({ id: r.id, name: r.fields.name || '' })).filter((r) => r.name);
  return NextResponse.json(results);
}


