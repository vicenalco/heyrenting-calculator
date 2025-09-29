export type WdMake = { qid: string; name: string };
export type WdModel = { qid: string; name: string; startYear?: string; endYear?: string | null };

export async function fetchMakesWD(q: string): Promise<WdMake[]> {
  const url = `/api/wikidata/makes?q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return (await res.json()) as WdMake[];
}

export async function fetchModelsWD(makeQid: string): Promise<WdModel[]> {
  const url = `/api/wikidata/models?makeQid=${encodeURIComponent(makeQid)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return (await res.json()) as WdModel[];
}


