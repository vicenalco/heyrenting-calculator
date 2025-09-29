import { NextResponse } from 'next/server';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_MODELS } = process.env as Record<string, string>;

export async function GET(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_MODELS) {
    return NextResponse.json({ error: 'Missing Airtable env vars' }, { status: 500 });
  }
  const { searchParams } = new URL(request.url);
  const brandId = (searchParams.get('brandId') || '').trim();
  if (!brandId) return NextResponse.json([]);

  // Intentamos diferentes nombres de campo para el enlace
  const possibleFieldNames = ['brand', 'Brand', 'marca', 'Marca', 'car_brand', 'Car Brand'];
  
  for (const fieldName of possibleFieldNames) {
    const filter = `{${fieldName}} = '${brandId.replace(/'/g, "''")}'`;
    const params = new URLSearchParams({ maxRecords: '100', filterByFormula: filter });
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_MODELS}?${params.toString()}`;
    
    const res = await fetch(url, { 
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, 
      cache: 'no-store' 
    });
    
    if (res.ok) {
      const data: { records: Array<{ id: string; fields: { name?: string } }> } = await res.json();
      const results = data.records.map((r) => ({ id: r.id, name: r.fields.name || '' })).filter((r) => r.name);
      
      if (results.length > 0) {
        return NextResponse.json(results);
      }
    }
  }
  
  // Si ningún campo funcionó, devolvemos todos los registros para debug
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
    totalRecords: data.records.length,
    message: 'No se encontró el campo de enlace correcto. Revisa los nombres de campos en Airtable.'
  });
}


