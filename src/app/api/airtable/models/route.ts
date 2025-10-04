import { NextResponse } from 'next/server';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_MODELS, AIRTABLE_TABLE_TRIMS } = process.env as Record<string, string>;

export async function GET(request: Request) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_MODELS || !AIRTABLE_TABLE_TRIMS) {
    return NextResponse.json({ error: 'Missing Airtable env vars' }, { status: 500 });
  }
  
  const { searchParams } = new URL(request.url);
  const brandId = (searchParams.get('brandId') || '').trim();
  if (!brandId) return NextResponse.json([]);

  // Cargamos todos los modelos y filtramos en el frontend
  const params = new URLSearchParams({ maxRecords: '100' });
  const modelsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_MODELS}?${params.toString()}`;
  
  const modelsRes = await fetch(modelsUrl, { 
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, 
    cache: 'no-store' 
  });
  
  if (!modelsRes.ok) {
    const errText = await modelsRes.text().catch(() => '');
    return NextResponse.json({ error: 'Airtable error', detail: errText }, { status: 500 });
  }
  
  const modelsData = await modelsRes.json() as { records: Array<{ id: string; fields: { name?: string; brand?: string[]; imageUrl?: string } }> };
  
  // Filtramos modelos por marca
  const filteredModels = modelsData.records
    .filter((r) => {
      const brandArray = r.fields.brand;
      return brandArray && Array.isArray(brandArray) && brandArray.includes(brandId);
    })
    .filter((r) => r.fields.name);

  // Cargar todos los trims para obtener los años
  const trimsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_TRIMS}?${params.toString()}`;
  
  const trimsRes = await fetch(trimsUrl, { 
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }, 
    cache: 'no-store' 
  });
  
  if (!trimsRes.ok) {
    // Si falla la carga de trims, devolver modelos sin ordenar por año
    return NextResponse.json(
      filteredModels.map((r) => ({ 
        id: r.id, 
        name: r.fields.name || '',
        imageUrl: r.fields.imageUrl
      }))
    );
  }
  
  const trimsData = await trimsRes.json() as { records: Array<{ id: string; fields: { model?: string[]; startYear?: number; endYear?: number } }> };
  
  // Crear un mapa de modelId -> años (startYear mínimo, endYear máximo)
  const modelYearsMap = new Map<string, { startYear: number; endYear: number }>();
  
  trimsData.records.forEach((trim) => {
    const modelIds = trim.fields.model;
    if (modelIds && Array.isArray(modelIds)) {
      modelIds.forEach((modelId) => {
        const startYear = trim.fields.startYear || 0;
        const endYear = trim.fields.endYear || new Date().getFullYear();
        
        const existing = modelYearsMap.get(modelId);
        if (!existing) {
          modelYearsMap.set(modelId, { startYear, endYear });
        } else {
          // Actualizar con el startYear más bajo y el endYear más alto
          modelYearsMap.set(modelId, {
            startYear: Math.min(existing.startYear, startYear),
            endYear: Math.max(existing.endYear, endYear)
          });
        }
      });
    }
  });
  
  // Mapear modelos con sus años desde los trims
  const results = filteredModels
    .map((r) => {
      const years = modelYearsMap.get(r.id);
      return {
        id: r.id, 
        name: r.fields.name || '',
        startYear: years?.startYear,
        endYear: years?.endYear,
        imageUrl: r.fields.imageUrl
      };
    })
    .sort((a, b) => {
      // Ordenar alfabéticamente por nombre del modelo
      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
  
  return NextResponse.json(results);
}