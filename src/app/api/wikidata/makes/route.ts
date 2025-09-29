import { NextResponse } from 'next/server';

// Devuelve marcas con artículo en Wikipedia en español (proxy de relevancia en España)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  const labelFilter = q
    ? `FILTER(CONTAINS(LCASE(?itemLabel), LCASE("${q.replace(/"/g, '\\"')}")))`
    : '';

  const sparql = `
  SELECT ?item ?itemLabel WHERE {
    ?item wdt:P31 wd:Q163740 .
    FILTER EXISTS { ?article schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
    ${labelFilter}
  }
  ORDER BY ?itemLabel
  LIMIT 80`;

  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql);

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/sparql-results+json' },
      // cache 6h en edge
      next: { revalidate: 60 * 60 * 6 },
    });
    const data = await res.json();
    const results = (data.results.bindings || []).map((b: any) => ({
      qid: b.item.value.split('/').pop(),
      name: b.itemLabel.value,
    }));
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json([]);
  }
}


