import { NextResponse } from 'next/server';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_TRIMS } = process.env as Record<string, string>;

export async function GET(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_TRIMS) {
    return NextResponse.json({ error: 'Missing Airtable env vars' }, { status: 500 });
  }
  
  const { searchParams } = new URL(request.url);
  const modelId = (searchParams.get('modelId') || '').trim();
  if (!modelId) return NextResponse.json([]);

  // Cargamos todos los trims y filtramos en el frontend
  const params = new URLSearchParams({ maxRecords: '100' });
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_TRIMS}?${params.toString()}`;
  
  const res = await fetch(url, { 
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return NextResponse.json({ error: 'Airtable error', detail: errText }, { status: 500 });
  }
  
  const data = await res.json() as { records: Array<{ id: string; fields: { name?: string; fuel?: string; price?: number; cv?: number; model?: string[]; transmision?: string[] } }> };
  
  // Filtramos en el frontend: buscamos trims donde el array model contenga el modelId
  const results = data.records
    .filter((r) => {
      const modelArray = r.fields.model;
      return modelArray && Array.isArray(modelArray) && modelArray.includes(modelId);
    })
    .map((r) => {
      const result = { 
        id: r.id, 
        name: r.fields.name || '', 
        fuel: r.fields.fuel, 
        price: r.fields.price, 
        cv: r.fields.cv,
        transmision: r.fields.transmision || []
      };
      return result;
    })
    .filter((r) => r.name);
  
  return NextResponse.json(results);
}