import * as cheerio from 'cheerio';

// Tipos para coches.com
export interface CochesSearchParams {
  brand: string;
  model: string;
  fuel: string;
  power: number;
  years?: number[]; // Array de años seleccionados
}

export interface CochesResult {
  price: number;
  count: number; // Número de vehículos encontrados
}

export interface CochesSearchResponse {
  segundaMano: CochesResult | null;
  km0: CochesResult | null;
}

// Tipos para el JSON de coches.com
interface CochesCarPrice {
  amount: number;
  currency: string;
}

interface CochesCarBadge {
  key: string;
  value: string;
  [key: string]: unknown;
}

interface CochesCarData {
  id: string;
  price?: CochesCarPrice;
  badges?: CochesCarBadge[];
  isKm0?: boolean; // Campo que indica si el vehículo es km0
  [key: string]: unknown;
}

interface CochesNextData {
  props?: {
    pageProps?: {
      classifieds?: {
        classifiedList?: CochesCarData[];
      };
    };
  };
}

/**
 * Mapea los tipos de combustible de Airtable a los de coches.com
 */
export const fuelMappingCoches: Record<string, string> = {
  'gasolina': 'gasolina',
  'diesel': 'diesel',
  'Diésel': 'diesel',
  'hibrido': 'hibrido',
  'Híbrido': 'hibrido',
  'Híbrido Enchufable': 'hibrido',
  'hibrido_enchufable': 'hibrido',
  'electrico': 'electrico',
  'gas': 'gas',
};

/**
 * Encuentra el rango de potencia (desde-hasta) para coches.com
 * Tramos: 60, 70, 80, 90, 100, 110, 120, 140, 160, 180, 200, 250, 300, 400
 * Ejemplo: 145 CV -> desde: 140, hasta: 160
 */
export function getPowerRange(power: number): { desde: number; hasta: number } {
  const brackets = [60, 70, 80, 90, 100, 110, 120, 140, 160, 180, 200, 250, 300, 400];
  
  // Encontrar el tramo inferior (desde) y superior (hasta)
  let desde = brackets[0];
  let hasta = brackets[brackets.length - 1];
  
  for (let i = 0; i < brackets.length; i++) {
    if (power <= brackets[i]) {
      // Si la potencia es menor o igual al primer tramo, usar el primer tramo
      desde = i === 0 ? brackets[0] : brackets[i - 1];
      hasta = brackets[i];
      break;
    }
  }
  
  // Si la potencia es mayor que el último tramo, usar el último
  if (power > brackets[brackets.length - 1]) {
    desde = brackets[brackets.length - 1];
    hasta = brackets[brackets.length - 1];
  }
  
  return { desde, hasta };
}

/**
 * Convierte el nombre de marca y modelo a formato coches.com
 * Ejemplo: "Alfa Romeo" + "Giulia" -> "alfa-romeo-giulia"
 */
export function formatBrandModelForCoches(brand: string, model: string): string {
  const formattedBrand = brand.toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const formattedModel = model.toLowerCase()
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return `${formattedBrand}-${formattedModel}`;
}

/**
 * Construye la URL de búsqueda de coches.com
 */
export function buildCochesSearchUrl(
  type: 'segunda-mano' | 'km0',
  params: CochesSearchParams,
  includeYears: boolean = true
): string {
  const baseUrl = 'https://www.coches.com';
  const vehicleType = type === 'segunda-mano' ? 'coches-segunda-mano' : 'km0';
  const brandModel = formatBrandModelForCoches(params.brand, params.model);
  const fuel = fuelMappingCoches[params.fuel] || params.fuel.toLowerCase();
  const powerRange = getPowerRange(params.power);
  
  let url = `${baseUrl}/${vehicleType}/${brandModel}-${fuel}.htm`;
  
  const queryParams: string[] = [];
  queryParams.push(`potencia_desde=${powerRange.desde}`);
  queryParams.push(`potencia_hasta=${powerRange.hasta}`);
  
  // Añadir filtros de año si se proporcionan y se solicita incluirlos
  if (includeYears && params.years && params.years.length > 0) {
    const minYear = Math.min(...params.years);
    const maxYear = Math.max(...params.years);
    queryParams.push(`anyo_desde=${minYear}`);
    queryParams.push(`anyo_hasta=${maxYear}`);
  }
  
  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&');
  }
  
  return url;
}

/**
 * Verifica si un coche es KM0
 */
function isKm0Vehicle(car: CochesCarData): boolean {
  // El JSON de coches.com tiene un campo 'isKm0' que indica directamente si es km0
  return car.isKm0 === true;
}

/**
 * Extrae el precio promedio de la página HTML de coches.com
 * @param html - HTML de la página
 * @param excludeKm0 - Si true, excluye vehículos con etiqueta KM0 (útil para búsquedas de segunda mano)
 */
export function parseCochesResults(html: string, excludeKm0: boolean = false): CochesResult | null {
  const $ = cheerio.load(html);
  
  try {
    // Buscar el script __NEXT_DATA__ que contiene los datos JSON
    const nextDataScript = $('script#__NEXT_DATA__').html();
    
    if (!nextDataScript) {
      return null;
    }
    
    // Parsear el JSON
    const nextData = JSON.parse(nextDataScript) as CochesNextData;
    
    // Extraer los datos de los coches desde la estructura JSON
    const classifiedList = nextData?.props?.pageProps?.classifieds?.classifiedList;
    
    if (!classifiedList || !Array.isArray(classifiedList)) {
      return null;
    }
    
    const prices: number[] = [];
    let totalCars = 0;
    let excludedKm0Count = 0;
    
    // Extraer precios de cada coche
    classifiedList.forEach((car: CochesCarData) => {
      totalCars++;
      
      // Si estamos excluyendo KM0 y el coche es km0, lo saltamos
      if (excludeKm0 && isKm0Vehicle(car)) {
        excludedKm0Count++;
        return;
      }
      
      if (car.price && car.price.amount) {
        prices.push(car.price.amount);
      }
    });
    
    if (prices.length === 0) {
      return null;
    }
    
    // Calcular precio promedio
    const averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    
    return {
      price: averagePrice,
      count: prices.length,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Función principal para buscar precios en coches.com
 */
export async function searchCochesPrice(
  type: 'segunda-mano' | 'km0',
  params: CochesSearchParams
): Promise<CochesResult | null> {
  try {
    // Para segunda mano, excluir coches con etiqueta KM0
    const excludeKm0 = type === 'segunda-mano';
    
    // Primer intento: con años si están disponibles
    let searchUrl = buildCochesSearchUrl(type, params, true);
    
    let response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Error en la petición a coches.com: ${response.status}`);
    }

    let html = await response.text();
    let result = parseCochesResults(html, excludeKm0);
    
    // Si no se encontraron resultados y se usaron años, intentar sin años
    if (!result && params.years && params.years.length > 0) {
      searchUrl = buildCochesSearchUrl(type, params, false);
      
      response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
      });

      if (response.ok) {
        html = await response.text();
        result = parseCochesResults(html, excludeKm0);
      }
    }
    
    return result;
  } catch (error) {
    return null;
  }
}

/**
 * Función principal para obtener precios de segunda mano y km0
 */
export async function searchAllCochesPrices(
  params: CochesSearchParams
): Promise<CochesSearchResponse> {
  // Buscar ambos tipos en paralelo
  const [segundaMano, km0] = await Promise.all([
    searchCochesPrice('segunda-mano', params),
    searchCochesPrice('km0', params),
  ]);
  
  return {
    segundaMano,
    km0,
  };
}


