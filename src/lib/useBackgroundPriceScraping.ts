import { useState, useCallback } from 'react';

interface ScrapingParams {
  brand: string;
  model: string;
  fuel?: string;
  power?: number;
  transmission?: string;
  years?: number[];
  onPricesReady?: (prices: { precioNuevo: number | null; precioSegundaMano: number | null; precioKm0: number | null }) => void;
}

interface PriceScrapingState {
  isScraping: boolean;
  progress: number;
  currentStep: string;
  results: { motorization?: string; price: number }[] | null;
  error: string | null;
  completed: boolean;
  precioNuevo: number | null;
  precioSegundaMano: number | null;
  precioKm0: number | null;
}

export function useBackgroundPriceScraping() {
  const [scrapingState, setScrapingState] = useState<PriceScrapingState>({
    isScraping: false,
    progress: 0,
    currentStep: '',
    results: null,
    error: null,
    completed: false,
    precioNuevo: null,
    precioSegundaMano: null,
    precioKm0: null,
  });

  const startScraping = useCallback(async (params: ScrapingParams) => {
    setScrapingState({
      isScraping: true,
      progress: 0,
      currentStep: 'Iniciando búsqueda...',
      results: null,
      error: null,
      completed: false,
      precioNuevo: null,
      precioSegundaMano: null,
      precioKm0: null,
    });

    try {
      // Paso 1: Buscar en km77 (vehículos nuevos)
      setScrapingState(prev => ({ ...prev, progress: 20, currentStep: 'Buscando precios de vehículos nuevos...' }));
      
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const km77ApiUrl = `${baseUrl}/api/km77/search`;
      
      const km77Response = await fetch(km77ApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!km77Response.ok) {
        throw new Error(`Error en la API km77: ${km77Response.status}`);
      }

      const km77Results = await km77Response.json();
      
      // Paso 2: Buscar en coches.com (segunda mano y km0)
      setScrapingState(prev => ({ ...prev, progress: 60, currentStep: 'Buscando precios de segunda mano y km0...' }));
      
      const cochesApiUrl = `${baseUrl}/api/coches/search`;
      
      const cochesResponse = await fetch(cochesApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      let cochesResults = null;
      if (cochesResponse.ok) {
        cochesResults = await cochesResponse.json();
      }
      
      // Extraer precios
      const precioNuevo = km77Results.data?.priceStats?.average || null;
      const precioSegundaMano = cochesResults?.data?.segundaMano?.price || null;
      const precioKm0 = cochesResults?.data?.km0?.price || null;
      
      // Combinar resultados
      const results = {
        ...km77Results,
        coches: cochesResults?.data || null,
      };

      setScrapingState({
        isScraping: false,
        progress: 100,
        currentStep: 'Completado',
        results: results.data?.results || [],
        error: null,
        completed: true,
        precioNuevo,
        precioSegundaMano,
        precioKm0,
      });

      // Llamar al callback si existe
      if (params.onPricesReady) {
        params.onPricesReady({ precioNuevo, precioSegundaMano, precioKm0 });
      }

      return results;
    } catch (error) {
      setScrapingState({
        isScraping: false,
        progress: 0,
        currentStep: '',
        results: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
        completed: false,
        precioNuevo: null,
        precioSegundaMano: null,
        precioKm0: null,
      });
    }
  }, []);

  const resetScraping = useCallback(() => {
    setScrapingState({
      isScraping: false,
      progress: 0,
      currentStep: '',
      results: null,
      error: null,
      completed: false,
      precioNuevo: null,
      precioSegundaMano: null,
      precioKm0: null,
    });
  }, []);

  return {
    ...scrapingState,
    startScraping,
    resetScraping,
  };
}
