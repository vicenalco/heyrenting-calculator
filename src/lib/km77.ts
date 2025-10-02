import * as cheerio from 'cheerio';

// Tipos para km77
export interface Km77SearchParams {
  brand: string;
  model: string;
  fuel: string;
  power: number;
  transmission: string;
}

export interface Km77Result {
  motorization: string;
  price: number;
  power: number;
  consumption: string;
  length: number;
  trunk: number;
  description: string;
}

export interface Km77SearchResponse {
  results: Km77Result[];
  totalResults: number;
  searchUrl: string;
}

/**
 * Mapea los tipos de combustible de Airtable a los de km77
 */
export const fuelMapping: Record<string, string> = {
  'gasolina': 'gasolina',
  'diesel': 'gasoleo',
  'Diésel': 'gasoleo', // Mapeo para el formato que viene de Airtable
  'hibrido': 'hibrido_no_enchufable',
  'Híbrido': 'hibrido_no_enchufable', // Mapeo para el formato que viene de Airtable
  'Híbrido Enchufable': 'Híbrido+Enchufable',
  'hibrido_enchufable': 'Híbrido+Enchufable',
  'electrico': 'electrico',
  'gas': 'gas',
};

/**
 * Mapea los tipos de transmisión de Airtable a los de km77
 */
export const transmissionMapping: Record<string, string> = {
  'manual': 'manual',
  'Manual': '', // No filtrar por transmisión si puede ser manual o automático
  'automatico': 'automatico',
  'Automático': 'automatico', // Mapeo para el formato que viene de Airtable
  'Manual/Automático': '', // No filtrar por transmisión si es mixta
  'Manual / Automático': '', // Variante con espacios
  'cvt': 'automatico', // CVT se considera automático
};

/**
 * Convierte el nombre de marca y modelo a formato km77
 * Ejemplo: "Alfa Romeo" + "Junior" -> "alfa-romeo:junior"
 */
export function formatBrandModelForKm77(brand: string, model: string): string {
  const formattedBrand = brand.toLowerCase().replace(/\s+/g, '-');
  const formattedModel = model.toLowerCase().replace(/\s+/g, '-');
  return `${formattedBrand}:${formattedModel}`;
}

/**
 * Construye la URL de búsqueda de km77 basándose en los parámetros
 */
export function buildKm77SearchUrl(params: Km77SearchParams): string {
  const baseUrl = 'https://www.km77.com/buscador/datos';
  
  // Construir parámetros manualmente para evitar problemas de encoding
  const searchParams = [
    'grouped=0',
    'order=price-asc',
    'markets[]=current',
    `nqls[]=ve:car:${formatBrandModelForKm77(params.brand, params.model)}`,
    `fuel_categories[]=${fuelMapping[params.fuel] || params.fuel}`,
    `power-min=${params.power}`,
    `power-max=${params.power + 1}`,
  ];

  // Solo añadir filtro de transmisión si no es una cadena vacía
  const transmissionFilter = transmissionMapping[params.transmission] !== undefined 
    ? transmissionMapping[params.transmission] 
    : params.transmission;
  console.log('🔧 Debug transmisión:', { 
    original: params.transmission, 
    mapped: transmissionFilter, 
    willAddFilter: transmissionFilter && transmissionFilter !== '' 
  });
  if (transmissionFilter && transmissionFilter !== '') {
    searchParams.push(`gearboxes[]=${transmissionFilter}`);
  }

  return `${baseUrl}?${searchParams.join('&')}`;
}

/**
 * Extrae los resultados de la página HTML de km77
 * Obtiene TODOS los resultados sin filtrar por motorización específica
 */
export function parseKm77Results(html: string): Km77Result[] {
  const $ = cheerio.load(html);
  const results: Km77Result[] = [];

  // Buscar la tabla de resultados
  $('table tr').each((index, element) => {
    const $row = $(element);
    
    // Saltar la fila de encabezados
    if (index === 0) return;

    // Extraer datos de cada fila
    const description = $row.find('td').eq(1).text().trim();
    const priceText = $row.find('td').eq(2).text().trim();
    const powerText = $row.find('td').eq(3).text().trim();
    const consumptionText = $row.find('td').eq(4).text().trim();
    const lengthText = $row.find('td').eq(5).text().trim();
    const trunkText = $row.find('td').eq(6).text().trim();

    // Obtener TODOS los resultados, no filtrar por motorización
    // (el filtrado se aplicó antes en la URL de búsqueda con combustible y transmisión)
    if (description && priceText) {
      const price = parseFloat(priceText.replace(/[^\d]/g, ''));
      const power = parseInt(powerText.replace(/[^\d]/g, ''));
      const length = parseInt(lengthText.replace(/[^\d]/g, ''));
      const trunk = parseInt(trunkText.replace(/[^\d]/g, ''));

      if (!isNaN(price) && !isNaN(power)) {
        // Extraer una "motorización" legible desde la descripción
        // Tomamos el texto antes del primer paréntesis, p.ej. "1.3 PHEV Q4"
        const motorization = description.split('(')[0].trim();
        results.push({
          motorization,
          price,
          power,
          consumption: consumptionText,
          length,
          trunk,
          description,
        });
      }
    }
  });

  return results;
}

/**
 * Calcula el precio promedio de TODOS los resultados
 * Ya no agrupa por motorización, sino que devuelve un único resultado con el precio promedio
 */
export function groupResultsByMotorization(results: Km77Result[]): Km77Result[] {
  if (results.length === 0) return [];

  // Calcular media de precios de TODOS los resultados
  const prices = results.map(r => r.price).filter(p => !isNaN(p));
  
  if (prices.length === 0) return [];
  
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Usar el primer resultado como base y actualizar el precio con la media global
  const baseResult = results[0];
  
  return [{
    ...baseResult,
    price: Math.round(averagePrice),
    description: `${baseResult.motorization} (${results.length} variantes, precio promedio: ${Math.round(averagePrice)}€)`,
  }];
}

/**
 * Función principal para buscar precios en km77
 */
export async function searchKm77Prices(params: Km77SearchParams): Promise<Km77SearchResponse> {
  try {
    const searchUrl = buildKm77SearchUrl(params);
    
    // Hacer la petición a km77
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`Error en la petición a km77: ${response.status}`);
    }

    const html = await response.text();

    const rawResults = parseKm77Results(html);
    
    // Agrupar por motorización y calcular media de precios
    const results = groupResultsByMotorization(rawResults);

    return {
      results,
      totalResults: results.length,
      searchUrl,
    };
  } catch (error) {
    console.error('Error en búsqueda km77:', error);
    return {
      results: [],
      totalResults: 0,
      searchUrl: '',
    };
  }
}

/**
 * Extrae la motorización específica del nombre del trim
 * Esta función necesita ser ajustada según la estructura de tus datos
 */
function extractMotorizationFromTrim(): string {
  // Por ahora, devolvemos una motorización genérica
  // Esto debería ser mejorado para extraer la motorización específica
  // basándose en los datos de Airtable
  return 'Ibrida 1.2'; // Ejemplo para Alfa Romeo Junior
}

/**
 * Función auxiliar para obtener el precio más bajo de una motorización específica
 * IMPORTANTE: Estos son precios de coches NUEVOS
 */
export function getLowestPrice(results: Km77Result[]): number | null {
  if (results.length === 0) return null;
  
  const prices = results.map(r => r.price).filter(p => !isNaN(p));
  return prices.length > 0 ? Math.min(...prices) : null;
}

/**
 * Función auxiliar para obtener el precio promedio de una motorización específica
 * IMPORTANTE: Estos son precios de coches NUEVOS
 */
export function getAveragePrice(results: Km77Result[]): number | null {
  if (results.length === 0) return null;
  
  const prices = results.map(r => r.price).filter(p => !isNaN(p));
  return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
}

/**
 * Función principal para obtener el precio recomendado de km77
 * Prioriza el precio promedio calculado (ya que agrupa múltiples variantes)
 */
export function getRecommendedKm77Price(results: Km77Result[]): number | null {
  if (results.length === 0) return null;
  
  // Como ya agrupamos y calculamos la media, el precio de cada resultado es el promedio
  const prices = results.map(r => r.price).filter(p => !isNaN(p));
  return prices.length > 0 ? prices[0] : null; // El primer resultado ya es el promedio
}
