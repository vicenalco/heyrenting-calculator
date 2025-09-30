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
  'diesel': 'diesel',
  'hibrido': 'hibrido_no_enchufable',
  'hibrido_enchufable': 'hibrido_enchufable',
  'electrico': 'electrico',
  'gas': 'gas',
};

/**
 * Mapea los tipos de transmisión de Airtable a los de km77
 */
export const transmissionMapping: Record<string, string> = {
  'manual': 'manual',
  'automatico': 'automatico',
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
  
  const searchParams = new URLSearchParams({
    grouped: '0',
    order: 'price-asc',
    'markets[]': 'current',
    'nqls[]': `ve:car:${formatBrandModelForKm77(params.brand, params.model)}`,
    'fuel_categories[]': fuelMapping[params.fuel] || params.fuel,
    'gearboxes[]': transmissionMapping[params.transmission] || params.transmission,
  });

  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Extrae los resultados de la página HTML de km77
 */
export function parseKm77Results(html: string, targetMotorization: string): Km77Result[] {
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

    // Verificar si la descripción contiene la motorización objetivo
    if (description.toLowerCase().includes(targetMotorization.toLowerCase())) {
      const price = parseFloat(priceText.replace(/[^\d]/g, ''));
      const power = parseInt(powerText.replace(/[^\d]/g, ''));
      const length = parseInt(lengthText.replace(/[^\d]/g, ''));
      const trunk = parseInt(trunkText.replace(/[^\d]/g, ''));

      if (!isNaN(price) && !isNaN(power)) {
        results.push({
          motorization: targetMotorization,
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
    
    // Extraer la motorización objetivo del nombre del trim
    // Por ejemplo: "Ibrida 1.2" de "Alfa Romeo Junior Ibrida 1.2 107 kW (145 CV) eDCT6"
    const targetMotorization = extractMotorizationFromTrim(params.brand, params.model);
    
    const results = parseKm77Results(html, targetMotorization);

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
function extractMotorizationFromTrim(brand: string, model: string): string {
  // Por ahora, devolvemos una motorización genérica
  // Esto debería ser mejorado para extraer la motorización específica
  // basándose en los datos de Airtable
  return 'Ibrida 1.2'; // Ejemplo para Alfa Romeo Junior
}

/**
 * Función auxiliar para obtener el precio más bajo de una motorización específica
 */
export function getLowestPrice(results: Km77Result[]): number | null {
  if (results.length === 0) return null;
  
  const prices = results.map(r => r.price).filter(p => !isNaN(p));
  return prices.length > 0 ? Math.min(...prices) : null;
}

/**
 * Función auxiliar para obtener el precio promedio de una motorización específica
 */
export function getAveragePrice(results: Km77Result[]): number | null {
  if (results.length === 0) return null;
  
  const prices = results.map(r => r.price).filter(p => !isNaN(p));
  return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
}
