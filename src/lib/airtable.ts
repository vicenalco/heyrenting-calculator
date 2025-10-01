export type Brand = { id: string; name: string };
export type Model = { id: string; name: string; imageUrl?: string };
export type Trim = { id: string; name: string; fuel?: string; price?: number; cv?: number; transmision?: string[]; startYear?: number; endYear?: number };

// Función auxiliar para obtener la URL base
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // En el cliente, usar la URL actual
    return window.location.origin;
  }
  // En el servidor, usar la variable de entorno o localhost
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

export async function fetchBrands(q: string): Promise<Brand[]> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/airtable/brands?q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return (await res.json()) as Brand[];
}

export async function fetchModels(brandId: string): Promise<Model[]> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/airtable/models?brandId=${encodeURIComponent(brandId)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return (await res.json()) as Model[];
}

export async function fetchTrims(modelId: string): Promise<Trim[]> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/airtable/trims?modelId=${encodeURIComponent(modelId)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return (await res.json()) as Trim[];
}

export async function fetchTrimsWithKm77Prices(brandId: string, modelId: string): Promise<{
  success: boolean;
  data: {
    trims: unknown[];
  };
} | null> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/airtable/trims-with-prices?brandId=${encodeURIComponent(brandId)}&modelId=${encodeURIComponent(modelId)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}


