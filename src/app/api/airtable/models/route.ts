import { NextResponse } from 'next/server';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_MODELS } = process.env as Record<string, string>;

export async function GET(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_MODELS) {
    return NextResponse.json({ error: 'Missing Airtable env vars' }, { status: 500 });
  }
  const { searchParams } = new URL(request.url);
  const brandId = (searchParams.get('brandId') || '').trim();
  if (!brandId) return NextResponse.json([]);

  // El campo 'brand' contiene un array, usamos una fórmula más simple
  const filter = `{brand} = '${brandId.replace(/'/g, "''")}'`;
  const params = new URLSearchParams({ maxRecords: '100', filterByFormula: filter });
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_MODELS}?${params.toString()}`;
  
  const res = await fetch(url, { 
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, 
    cache: 'no-store' 
  });
  
  if (res.ok) {
    const data = await res.json() as { records: Array<{ id: string; fields: { name?: string } }> };
    const results = data.records.map((r) => ({ id: r.id, name: r.fields.name || '' })).filter((r) => r.name);
    
    if (results.length > 0) {
      return NextResponse.json(results);
    }
  }
  
  // Si no funcionó, devolvemos todos los registros para debug
  const debugParams = new URLSearchParams({ maxRecords: '5' });
  const debugUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_MODELS}?${debugParams.toString()}`;
  const debugRes = await fetch(debugUrl, { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, cache: 'no-store' });
  
  if (!debugRes.ok) {
    const errText = await debugRes.text().catch(() => '');
    return NextResponse.json({ error: 'Airtable error', detail: errText }, { status: 500 });
  }
  
  const debugData: { records: Array<{ id: string; fields: Record<string, unknown> }> } = await debugRes.json();
  
  // Devolvemos la estructura para debug
  return NextResponse.json({ 
    debug: true,
    brandId,
    sampleRecord: debugData.records[0] || null,
    allFields: debugData.records[0]?.fields || {},
    totalRecords: debugData.records.length,
    message: 'No se encontró el campo de enlace correcto. Revisa los nombres de campos en Airtable.'
  });
}