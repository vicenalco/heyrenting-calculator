import { useState, useEffect, useCallback } from 'react';

interface PriceScrapingState {
  isScraping: boolean;
  progress: number;
  currentStep: string;
  results: any[] | null;
  error: string | null;
  completed: boolean;
}

export function useBackgroundPriceScraping() {
  const [scrapingState, setScrapingState] = useState<PriceScrapingState>({
    isScraping: false,
    progress: 0,
    currentStep: '',
    results: null,
    error: null,
    completed: false,
  });

  const startScraping = useCallback(async (params: any) => {
    console.log('🚀 Iniciando scraping con parámetros:', params);
    
    setScrapingState({
      isScraping: true,
      progress: 0,
      currentStep: 'Iniciando búsqueda...',
      results: null,
      error: null,
      completed: false,
    });

    try {
      // Simular progreso paso a paso
      const steps = [
        { progress: 20, step: 'Construyendo URL de búsqueda...' },
        { progress: 40, step: 'Conectando con fuente de datos...' },
        { progress: 60, step: 'Extrayendo precios de motorizaciones...' },
        { progress: 80, step: 'Calculando promedios de precios...' },
        { progress: 100, step: 'Finalizando...' },
      ];

      for (const { progress, step } of steps) {
        setScrapingState(prev => ({ ...prev, progress, currentStep: step }));
        await new Promise(resolve => setTimeout(resolve, 800)); // Simular tiempo de procesamiento
      }

      // Realizar la búsqueda real a través de la API del servidor
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const apiUrl = `${baseUrl}/api/km77/search`;
      console.log('🌐 Llamando a la API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      console.log('📡 Respuesta de la API:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const results = await response.json();
      console.log('📊 Resultados obtenidos:', results);

      setScrapingState({
        isScraping: false,
        progress: 100,
        currentStep: 'Completado',
        results: results.data?.results || [],
        error: null,
        completed: true,
      });

      return results;
    } catch (error) {
      setScrapingState({
        isScraping: false,
        progress: 0,
        currentStep: '',
        results: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
        completed: false,
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
    });
  }, []);

  return {
    ...scrapingState,
    startScraping,
    resetScraping,
  };
}
