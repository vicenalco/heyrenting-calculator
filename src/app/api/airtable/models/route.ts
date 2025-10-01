import { NextResponse } from 'next/server';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_MODELS } = process.env as Record<string, string>;

export async function GET(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_MODELS) {
    return NextResponse.json({ error: 'Missing Airtable env vars' }, { status: 500 });
  }
  
  const { searchParams } = new URL(request.url);
  const brandId = (searchParams.get('brandId') || '').trim();
  if (!brandId) return NextResponse.json([]);

  // Cargamos todos los modelos y filtramos en el frontend
  const params = new URLSearchParams({ maxRecords: '100' });
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_MODELS}?${params.toString()}`;
  
  const res = await fetch(url, { 
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, 
    cache: 'no-store' 
  });
  
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return NextResponse.json({ error: 'Airtable error', detail: errText }, { status: 500 });
  }
  
  const data = await res.json() as { records: Array<{ id: string; fields: { name?: string; brand?: string[]; startYear?: number; endYear?: number; imageUrl?: string } }> };
  
  // Filtramos en el frontend: buscamos modelos donde el array brand contenga el brandId
  const results = data.records
    .filter((r) => {
      const brandArray = r.fields.brand;
      return brandArray && Array.isArray(brandArray) && brandArray.includes(brandId);
    })
    .map((r) => ({ 
      id: r.id, 
      name: r.fields.name || '',
      startYear: r.fields.startYear,
      endYear: r.fields.endYear,
      imageUrl: r.fields.imageUrl
    }))
    .filter((r) => r.name)
    .sort((a, b) => {
      // Ordenar por modelos más nuevos primero
      // 1. Prioridad a modelos que siguen en producción (endYear más alto o actual)
      const currentYear = new Date().getFullYear();
      const endYearA = a.endYear || currentYear; // Si no tiene endYear, asumimos que sigue en producción
      const endYearB = b.endYear || currentYear;
      
      // Si los endYear son diferentes, ordenar por el más reciente
      if (endYearB !== endYearA) {
        return endYearB - endYearA;
      }
      
      // Si tienen el mismo endYear, ordenar por startYear más reciente
      const startYearA = a.startYear || 0;
      const startYearB = b.startYear || 0;
      return startYearB - startYearA;
    });
  
  return NextResponse.json(results);
}