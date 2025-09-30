export type Brand = { id: string; name: string };
export type Model = { id: string; name: string; startYear?: number; endYear?: number; imageUrl?: string };
export type Trim = { id: string; name: string; fuel?: string; price?: number; cv?: number; transmision?: string[] };

export async function fetchBrands(q: string): Promise<Brand[]> {
  const url = `/api/airtable/brands?q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return (await res.json()) as Brand[];
}

export async function fetchModels(brandId: string): Promise<Model[]> {
  const url = `/api/airtable/models?brandId=${encodeURIComponent(brandId)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return (await res.json()) as Model[];
}

export async function fetchTrims(modelId: string): Promise<Trim[]> {
  const url = `/api/airtable/trims?modelId=${encodeURIComponent(modelId)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return (await res.json()) as Trim[];
}

export async function fetchTrimsWithKm77Prices(brandId: string, modelId: string): Promise<any> {
  const url = `/api/airtable/trims-with-prices?brandId=${encodeURIComponent(brandId)}&modelId=${encodeURIComponent(modelId)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}


