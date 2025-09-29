import { NextResponse } from 'next/server';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_TRIMS } = process.env as Record<string, string>;

export async function GET(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_TRIMS) {
    return NextResponse.json({ error: 'Missing Airtable env vars' }, { status: 500 });
  }
  
  const { searchParams } = new URL(request.url);
  const modelId = (searchParams.get('modelId') || '').trim();
  if (!modelId) return NextResponse.json([]);

  // El campo 'model' contiene un array, usamos FIND para buscar el ID
  const filter = `FIND('${modelId.replace(/'/g, "''")}', ARRAYJOIN({model}))`;
  const params = new URLSearchParams({ maxRecords: '100', filterByFormula: filter });
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_TRIMS}?${params.toString()}`;
  
  const res = await fetch(url, { 
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, 
    cache: 'no-store' 
  });
  
  if (res.ok) {
    const data = await res.json() as { records: Array<{ id: string; fields: { name?: string; fuel?: string; price?: number } }> };
    const results = data.records.map((r) => ({ 
      id: r.id, 
      name: r.fields.name || '', 
      fuel: r.fields.fuel || '', 
      price: r.fields.price || 0 
    })).filter((r) => r.name);
    
    if (results.length > 0) {
      return NextResponse.json(results);
    }
  }
  
  // Si no funcionó, devolvemos todos los registros para debug
  const debugParams = new URLSearchParams({ maxRecords: '5' });
  const debugUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_TRIMS}?${debugParams.toString()}`;
  const debugRes = await fetch(debugUrl, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, cache: 'no-store' });
  
  if (!debugRes.ok) {
    const errText = await debugRes.text().catch(() => '');
    return NextResponse.json({ error: 'Airtable error', detail: errText }, { status: 500 });
  }
  
  const debugData = await debugRes.json() as { records: Array<{ id: string; fields: Record<string, unknown> }> };
  
  return NextResponse.json({ 
    debug: true,
    modelId,
    sampleRecord: debugData.records[0] || null,
    allFields: debugData.records[0]?.fields || {},
    totalRecords: debugData.records.length,
    message: 'No se encontró el campo de enlace correcto. Revisa los nombres de campos en Airtable.'
  });
}