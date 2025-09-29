import { NextResponse } from 'next/server';

// Modelos por marca (filtrados para estar vigentes en el año actual y con artículo en eswiki)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const makeQid = (searchParams.get('makeQid') || '').trim();
  if (!makeQid) return NextResponse.json([]);

  const sparql = `
  SELECT ?item ?itemLabel ?start ?end WHERE {
    BIND(year(now()) AS ?year)
    ?item wdt:P31 wd:Q3231690 ;      # modelo de automóvil
          wdt:P176 wd:${makeQid} ;   # fabricante
          wdt:P571 ?start .          # inicio producción
    OPTIONAL { ?item wdt:P2669 ?end } # fin/descatalogación
    FILTER (year(?start) <= ?year && (!BOUND(?end) || year(?end) >= ?year))
    FILTER EXISTS { ?article schema:about ?item ; schema:isPartOf <https://es.wikipedia.org/> }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
  }
  ORDER BY ?itemLabel
  LIMIT 150`;

  const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql);
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/sparql-results+json' },
      next: { revalidate: 60 * 60 * 6 },
    });
    const data = await res.json();
    const results = (data.results.bindings || []).map((b: any) => ({
      qid: b.item.value.split('/').pop(),
      name: b.itemLabel.value,
      startYear: b.start?.value?.slice(0, 4),
      endYear: b.end?.value?.slice(0, 4) || null,
    }));
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json([]);
  }
}


