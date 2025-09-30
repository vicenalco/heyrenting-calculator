import { Brand, Model, Trim } from './airtable';
import { searchKm77Prices, Km77SearchParams, Km77Result } from './km77';

export interface PriceIntegrationResult {
  trim: Trim;
  km77Results: Km77Result[];
  lowestPrice: number | null;
  averagePrice: number | null;
  priceDifference: number | null; // Diferencia entre precio Airtable y km77
  priceAccuracy: 'exact' | 'close' | 'different' | 'no_data';
}

/**
 * Integra los precios de km77 con los datos de Airtable para un trim específico
 */
export async function integrateKm77Prices(
  brand: Brand,
  model: Model,
  trim: Trim
): Promise<PriceIntegrationResult> {
  try {
    // Validar que el trim tenga los datos necesarios
    if (!trim.fuel || !trim.cv || !trim.transmision || trim.transmision.length === 0) {
      return {
        trim,
        km77Results: [],
        lowestPrice: null,
        averagePrice: null,
        priceDifference: null,
        priceAccuracy: 'no_data',
      };
    }

    // Construir parámetros de búsqueda para km77
    const searchParams: Km77SearchParams = {
      brand: brand.name,
      model: model.name,
      fuel: trim.fuel,
      power: trim.cv,
      transmission: trim.transmision[0], // Usar la primera transmisión disponible
    };

    // Realizar búsqueda en km77
    const km77Response = await searchKm77Prices(searchParams);
    
    // Calcular estadísticas de precios (ya agrupados y promediados)
    const prices = km77Response.results.map(r => r.price).filter(p => !isNaN(p));
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
    
    // El precio recomendado es el precio promedio calculado (ya agrupado por motorización)
    const recommendedPrice = averagePrice;

    // Calcular diferencia con el precio de Airtable
    let priceDifference: number | null = null;
    let priceAccuracy: 'exact' | 'close' | 'different' | 'no_data' = 'no_data';

    if (trim.price && lowestPrice) {
      priceDifference = trim.price - lowestPrice;
      const percentageDiff = Math.abs(priceDifference) / trim.price;
      
      if (percentageDiff < 0.05) { // Menos del 5% de diferencia
        priceAccuracy = 'exact';
      } else if (percentageDiff < 0.15) { // Menos del 15% de diferencia
        priceAccuracy = 'close';
      } else {
        priceAccuracy = 'different';
      }
    }

    return {
      trim,
      km77Results: km77Response.results,
      lowestPrice,
      averagePrice,
      priceDifference,
      priceAccuracy,
    };

  } catch (error) {
    console.error('Error integrando precios km77:', error);
    return {
      trim,
      km77Results: [],
      lowestPrice: null,
      averagePrice: null,
      priceDifference: null,
      priceAccuracy: 'no_data',
    };
  }
}

/**
 * Integra precios de km77 para múltiples trims
 */
export async function integrateKm77PricesForTrims(
  brand: Brand,
  model: Model,
  trims: Trim[]
): Promise<PriceIntegrationResult[]> {
  const results: PriceIntegrationResult[] = [];

  // Procesar cada trim de forma secuencial para evitar sobrecargar km77
  for (const trim of trims) {
    try {
      const result = await integrateKm77Prices(brand, model, trim);
      results.push(result);
      
      // Pequeña pausa entre peticiones para ser respetuosos con km77
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error procesando trim ${trim.name}:`, error);
      results.push({
        trim,
        km77Results: [],
        lowestPrice: null,
        averagePrice: null,
        priceDifference: null,
        priceAccuracy: 'no_data',
      });
    }
  }

  return results;
}

/**
 * Función auxiliar para obtener el precio recomendado basándose en km77
 * IMPORTANTE: Prioriza el precio promedio de km77 (coches nuevos)
 */
export function getRecommendedPrice(integrationResult: PriceIntegrationResult): number | null {
  const { trim, averagePrice, priceAccuracy } = integrationResult;

  // Si no hay datos de km77, usar el precio de Airtable
  if (!averagePrice) {
    return trim.price || null;
  }

  // Priorizar el precio promedio de km77 (ya calculado con múltiples variantes)
  // Este es el precio más representativo para coches nuevos
  return averagePrice;
}

/**
 * Función auxiliar para validar la precisión de precios
 */
export function validatePriceAccuracy(integrationResult: PriceIntegrationResult): {
  isAccurate: boolean;
  confidence: 'high' | 'medium' | 'low';
  recommendation: string;
} {
  const { priceAccuracy, km77Results, priceDifference } = integrationResult;

  let isAccurate = false;
  let confidence: 'high' | 'medium' | 'low' = 'low';
  let recommendation = '';

  switch (priceAccuracy) {
    case 'exact':
      isAccurate = true;
      confidence = 'high';
      recommendation = 'Precio muy preciso según km77';
      break;
    case 'close':
      isAccurate = true;
      confidence = 'medium';
      recommendation = 'Precio cercano al de km77';
      break;
    case 'different':
      isAccurate = false;
      confidence = 'low';
      recommendation = 'Precio diferente al de km77 - revisar';
      break;
    case 'no_data':
      isAccurate = false;
      confidence = 'low';
      recommendation = 'Sin datos de km77 disponibles';
      break;
  }

  return { isAccurate, confidence, recommendation };
}
