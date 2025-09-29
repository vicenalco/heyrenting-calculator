export type Brand = { id: string; name: string };
export type Model = { id: string; name: string };
export type Trim = { id: string; name: string; fuel?: string; price?: number; cv?: number };

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


