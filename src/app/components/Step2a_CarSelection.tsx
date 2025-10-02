'use client';

import Slider from './ui/Slider';
import { useEffect, useState } from 'react';
import { fetchBrands, fetchModels, fetchTrims, fetchTrimsWithKm77Prices } from '@/lib/airtable';
import Image from 'next/image';
import { useBackgroundPriceScraping } from '@/lib/useBackgroundPriceScraping';

// Lista de todas las provincias de España
const PROVINCIAS_ESPANA = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Baleares',
  'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba',
  'La Coruña', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca',
  'Jaén', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense',
  'Palencia', 'Las Palmas', 'Pontevedra', 'La Rioja', 'Salamanca', 'Santa Cruz de Tenerife',
  'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid',
  'Vizcaya', 'Zamora', 'Zaragoza'
];

interface Step2a_CarSelectionProps {
  formData: {
    carBrand: string;
    carModel: string;
    carVersion: string; // usaremos para "motorización"
    carYear: number | null; // nuevo campo para el año
    kmsAnuales: number;
    aniosFinanciacion: number;
    precioCoche: number;
    tipoCombustible: string;
    provincia?: string;
    makeQid?: string;
    brandId?: string;
    modelId?: string;
    usoVehiculo?: string;
    estiloConduccion?: string;
    frecuenciaUso?: string;
    presupuesto?: string;
    experiencia?: string;
  };
  onUpdate: (updates: Partial<Step2a_CarSelectionProps['formData']>) => void;
  onNext: () => void;
  isModifying?: boolean;
  onFinishModifying?: () => void;
  onScrapingStateChange?: (state: {
    isScraping: boolean;
    progress: number;
    currentStep: string;
    error: string | null;
    completed: boolean;
  }) => void;
  onPreviousStep?: () => void;
  onNextStep?: () => void;
  isCurrentStepComplete?: boolean;
}

export default function Step2a_CarSelection({ formData, onUpdate, onNext, isModifying = false, onFinishModifying, onScrapingStateChange, onPreviousStep, onNextStep, isCurrentStepComplete = false }: Step2a_CarSelectionProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  const [brandQuery, setBrandQuery] = useState('');
  const [makes, setMakes] = useState<{ id: string; name: string }[]>([]);
  const [models, setModels] = useState<{ id: string; name: string; imageUrl?: string }[]>([]);
  const [trims, setTrims] = useState<{ id: string; name: string; price?: number; fuel?: string; cv?: number; transmision?: string[]; startYear?: number; endYear?: number; priceUpdated?: boolean; priceAccuracy?: string; originalPrice?: number }[]>([]);
  const [selectedTrim, setSelectedTrim] = useState<{ id: string; name: string; price?: number; fuel?: string; cv?: number; transmision?: string[]; startYear?: number; endYear?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Hook para scraping en segundo plano
  const {
    isScraping,
    progress,
    currentStep: scrapingCurrentStep,
    results: scrapingResults,
    error: scrapingError,
    completed: scrapingCompleted,
    startScraping,
  } = useBackgroundPriceScraping();

  // Debounce para evitar sobrecargar Airtable
  const debouncedQuery = useDebouncedValue(brandQuery, 100);

  // Función para calcular los años disponibles basados en la motorización seleccionada
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    
    // Prioridad: usar los años de la motorización seleccionada
    if (selectedTrim && selectedTrim.startYear && selectedTrim.endYear) {
      const startYear = Math.max(selectedTrim.startYear, 2010); // No mostrar años anteriores a 2010
      const endYear = Math.min(selectedTrim.endYear, currentYear);
      return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    }
    
    // Si no hay motorización seleccionada, mostrar años recientes (últimos 5 años)
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  };

  // Limpiar estado de carga cuando se entra en modo modificación
  useEffect(() => {
    if (isModifying) {
      setLoading(false);
      setLoadingText('');
    }
  }, [isModifying]);

  // Sincronizar brandQuery con formData.carBrand cuando se navega de vuelta
  useEffect(() => {
    if (formData.carBrand && !brandQuery) {
      setBrandQuery(formData.carBrand);
    }
  }, [formData.carBrand, brandQuery]);

  // Función helper para delay con loading
  const delayWithLoading = (ms: number, text: string) => {
    return new Promise(resolve => {
      setLoadingText(text);
      setTimeout(resolve, ms);
    });
  };

  // Buscar marcas con Airtable
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) { 
      setMakes([]); 
      return; 
    }
    
    setLoading(true);
    fetchBrands(debouncedQuery)
      .then((brands) => {
        setMakes(brands);
      })
      .catch((error) => {
        console.error('Error fetching brands:', error);
        setMakes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debouncedQuery]);

  // Cargar modelos cuando se selecciona una marca
  useEffect(() => {
    if (!formData.brandId) { 
      setModels([]); 
      return; 
    }
    
    const loadModels = async () => {
      setLoading(true);
      
      // Delay mínimo para mostrar el loading
      await delayWithLoading(1000, 'Buscando modelos...');
      
      try {
        const modelList = await fetchModels(formData.brandId!);
        
        // Verificar si es un objeto de debug
        if (modelList && typeof modelList === 'object' && 'debug' in modelList) {
          console.log('Debug info from models:', modelList);
          setModels([]);
        } else if (Array.isArray(modelList)) {
          setModels(modelList);
        } else {
          console.error('Unexpected response format:', modelList);
          setModels([]);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        setModels([]);
      } finally {
        setLoading(false);
        setLoadingText('');
      }
    };
    
    loadModels();
  }, [formData.brandId]);

  // Cargar trims cuando se selecciona un modelo
  useEffect(() => {
    if (!formData.modelId || !formData.brandId) { 
      setTrims([]); 
      return; 
    }
    
    const loadTrims = async () => {
      setLoading(true);
      setLoadingText('Buscando motorizaciones...');
      
      // Sin delay ni animación - cargar trims directamente
      
      try {
        console.log('🔍 Iniciando carga de motorizaciones para modelo:', formData.modelId);
        
        // Usar directamente fetchTrims para evitar problemas con la integración de precios
        console.log('🔄 Cargando motorizaciones directamente');
        const trimList = await fetchTrims(formData.modelId!);
        console.log('📋 Resultado fetchTrims:', trimList);
        console.log('📋 Tipo de respuesta:', typeof trimList);
        console.log('📋 Es array:', Array.isArray(trimList));
        
        if (trimList && typeof trimList === 'object' && 'debug' in trimList) {
          console.log('Debug info from trims:', trimList);
          setTrims([]);
        } else if (Array.isArray(trimList)) {
          console.log('✅ Trims cargados correctamente:', trimList.length, 'motorizaciones');
          setTrims(trimList);
        } else {
          console.error('❌ Unexpected response format:', trimList);
          setTrims([]);
        }
      } catch (error) {
        console.error('Error fetching trims:', error);
        // Fallback a trims normales en caso de error
        try {
          const trimList = await fetchTrims(formData.modelId!);
          if (Array.isArray(trimList)) {
            setTrims(trimList);
          }
        } catch (fallbackError) {
          console.error('Error in fallback:', fallbackError);
          setTrims([]);
        }
      } finally {
        setLoading(false);
        setLoadingText('');
      }
    };
    
    loadTrims();
  }, [formData.modelId, formData.brandId]);

  // Efecto para pasar el estado del scraping al componente padre
  useEffect(() => {
    if (onScrapingStateChange) {
      onScrapingStateChange({
        isScraping,
        progress,
        currentStep: scrapingCurrentStep,
        error: scrapingError,
        completed: scrapingCompleted,
      });
    }
  }, [isScraping, progress, scrapingCurrentStep, scrapingError, scrapingCompleted, onScrapingStateChange]);

  // Efecto para actualizar precios cuando el scraping se complete
  useEffect(() => {
    console.log('🔄 Estado del scraping:', { scrapingCompleted, scrapingResults: scrapingResults?.length });
    
    if (scrapingCompleted && scrapingResults && scrapingResults.length > 0) {
      console.log('✅ Scraping completado, actualizando precios...');
      
      // Actualizar los precios de los trims con los resultados del scraping
      setTrims(prevTrims => 
        prevTrims.map(trim => {
          // Buscar el resultado correspondiente por motorización
          const matchingResult = scrapingResults.find((result: { motorization?: string; price: number }) => 
            result.motorization && trim.name.toLowerCase().includes(result.motorization.toLowerCase())
          );
          
          if (matchingResult) {
            console.log('💰 Precio encontrado para', trim.name, ':', matchingResult.price);
            return {
              ...trim,
              price: matchingResult.price,
              priceUpdated: true,
              priceAccuracy: 'exact'
            };
          }
          
          return trim;
        })
      );
    }
  }, [scrapingCompleted, scrapingResults]);

  const handleSelectBrand = (id: string, name: string) => {
    onUpdate({ 
      carBrand: name, 
      carModel: '', 
      carVersion: '', 
      brandId: id,
      modelId: '',
      makeQid: undefined 
    });
    setCurrentStep(2);
  };

  const handleSelectModel = (id: string, name: string) => {
    onUpdate({ 
      carModel: name, 
      carVersion: '',
      modelId: id
    });
    // Solo avanzar automáticamente si no se está navegando hacia atrás
    if (!isNavigatingBack) {
      setCurrentStep(3);
    }
    // Resetear el flag de navegación hacia atrás
    setIsNavigatingBack(false);
  };

  const handleSelectTrim = (trim: { id: string; name: string; price?: number; fuel?: string; cv?: number; startYear?: number; endYear?: number }) => {
    const updates: Partial<Step2a_CarSelectionProps['formData']> = {
      carVersion: trim.name
    };
    
    // Autocompletar precio si está disponible
    if (trim.price) {
      updates.precioCoche = trim.price;
    }
    
    // Autocompletar combustible si está disponible
    if (trim.fuel) {
      updates.tipoCombustible = trim.fuel;
    }
    
    onUpdate(updates);
    
    // Guardar el trim seleccionado para usar en el scraping
    setSelectedTrim(trim);
    
    // El scraping se realizará después de seleccionar el año
    console.log('📝 Trim seleccionado:', trim.name, '- Scraping se realizará después de seleccionar año');
    
    // Ir al paso 4 (selección de año)
    setCurrentStep(4);
  };


  const handleNextStep = () => {
    if (currentStep < 4) {
      setIsNavigatingBack(false);
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else if (currentStep === 4 && formData.carYear !== null) {
      // Si estamos en el paso 4 (año) y ya se ha seleccionado un año, avanzar al paso 3
      onNext();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setIsNavigatingBack(true);
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBrandStep();
      case 2:
        return renderModelStep();
      case 3:
        return renderTrimStep();
      case 4:
        return renderYearStep();
      default:
        return renderBrandStep();
    }
  };

  const renderBrandStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">¿Qué marca te gusta?</h2>
        <p className="text-lg text-gray-600">Busca y selecciona la marca del vehículo que quieres comprar</p>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={brandQuery}
          onChange={(e) => setBrandQuery(e.target.value)}
          placeholder="Escribe la marca que buscas..."
          className="w-full px-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 min-h-[60px]"
          style={{ 
            '--tw-ring-color': '#52bf31',
            backgroundColor: '#fafafa'
          } as React.CSSProperties}
          onFocus={(e) => {
            e.target.style.setProperty('--tw-ring-color', '#52bf31');
            e.target.style.borderColor = '#52bf31';
            e.target.style.backgroundColor = '#ffffff';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.backgroundColor = '#fafafa';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && makes.length > 0) {
              const first = makes[0];
              handleSelectBrand(first.id, first.name);
            }
          }}
        />
      </div>
      
      {/* Spinner de carga visible */}
      {loading && (
        <div className="text-center py-8">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-car text-green-500 text-lg"></i>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-700">Buscando marcas...</p>
          </div>
        </div>
      )}
      
      {/* Contenido dinámico sin espacio fijo */}
      {brandQuery.trim().length >= 2 && !loading && makes.length === 0 && (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">
            <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
          </div>
          <p className="text-gray-500">No encontramos esa marca. Prueba con otra búsqueda</p>
        </div>
      )}
      
      {makes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {makes.map((m) => (
            <div
              key={m.id}
              onClick={() => handleSelectBrand(m.id, m.name)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.carBrand === m.name
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">
                  <i className="fa-solid fa-car text-gray-600"></i>
                </div>
                <h4 className="font-semibold text-gray-900">{m.name}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderModelStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">¿Qué modelo de {formData.carBrand} te interesa?</h2>
        <p className="text-lg text-gray-600">Selecciona el modelo que quieres configurar</p>
      </div>
      
      {loading && (
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-green-500 text-lg">
                <i className="fa-solid fa-gear"></i>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-700">{loadingText}</p>
          </div>
        </div>
      )}
      
      {!loading && models.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {models.map((m) => (
            <div
              key={m.id}
              onClick={() => handleSelectModel(m.id, m.name)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.carModel === m.name
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                {m.imageUrl ? (
                  <div className="mb-3">
                    <Image 
                      src={m.imageUrl} 
                      alt={m.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg mx-auto"
                      onError={(e) => {
                        // Si falla la imagen, mostrar icono
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) nextElement.style.display = 'block';
                      }}
                    />
                    <div className="text-3xl mb-3 hidden">
                      <i className="fa-solid fa-car text-gray-600"></i>
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl mb-3">
                    <i className="fa-solid fa-car text-gray-600"></i>
                  </div>
                )}
                <h4 className="font-bold text-lg text-gray-900">{m.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{formData.carBrand}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTrimStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">¿Qué motorización prefieres?</h2>
        <p className="text-lg text-gray-600">Elige la versión de <strong>{formData.carModel}</strong></p>
      </div>
      
      {loading && (
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-green-500 text-lg">
                <i className="fa-solid fa-wrench"></i>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-700">{loadingText}</p>
          </div>
        </div>
      )}
      
      {!loading && trims.length > 0 && (
        <div className="space-y-6">
          {/* Información de precios eliminada - no debe aparecer en selección de motorización */}
          
          {/* Animación de scraping eliminada - no debe aparecer en selección de motorización */}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {trims.map((trim) => {
            return (
            <div
              key={trim.id}
              onClick={() => handleSelectTrim(trim)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                selectedTrim && selectedTrim.id === trim.id
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-gray-900">
                  <i className="fa-solid fa-wrench text-lg" aria-hidden="true"></i>
                  <h4 className="font-bold text-lg">{trim.name}</h4>
                </div>
                {/* Los precios se mostrarán en el paso 3, no aquí */}
                {(trim.fuel || trim.cv || (trim.transmision && trim.transmision.length > 0)) && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {trim.fuel && (
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                        <i className="fa-solid fa-gas-pump" aria-hidden="true"></i>
                        <span className="capitalize">{trim.fuel}</span>
                      </span>
                    )}
                    {trim.cv && (
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                        <i className="fa-solid fa-horse" aria-hidden="true"></i>
                        <span>{trim.cv} CV</span>
                      </span>
                    )}
                    {trim.transmision && trim.transmision.length > 0 && (
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full border border-purple-200">
                        <i className="fa-solid fa-gear" aria-hidden="true"></i>
                        <span>{trim.transmision.join(' / ')}</span>
                      </span>
                    )}
                  </div>
                )}
                
              </div>
            </div>
            );
          })}
          </div>
        </div>
      )}

      {!loading && trims.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">
            <i className="fa-solid fa-exclamation-triangle text-yellow-500"></i>
          </div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron motorizaciones</h4>
          <p className="text-gray-600 mb-4">
            No hay motorizaciones disponibles para el modelo <strong>{formData.carModel}</strong>
          </p>
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a seleccionar modelo
          </button>
        </div>
      )}
    </div>
  );

  const renderYearStep = () => {
    const availableYears = getAvailableYears();
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">¿De qué año es el vehículo?</h2>
          <p className="text-lg text-gray-600">
            Selecciona el año de fabricación del <strong>{formData.carModel}</strong>
            {selectedTrim && (
              <span className="block text-sm text-gray-500 mt-1">
                Motorización: <strong>{selectedTrim.name}</strong>
                {selectedTrim.startYear && selectedTrim.endYear && (
                  <span> - Disponible desde {selectedTrim.startYear} hasta {selectedTrim.endYear}</span>
                )}
              </span>
            )}
          </p>
          
          {/* Texto explicativo sobre los años de disponibilidad */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <i className="fa-solid fa-info-circle text-blue-500 mt-0.5"></i>
              </div>
              <div className="ml-3">
                <p className="font-medium mb-1">Información sobre los años mostrados</p>
                <p className="text-blue-700">
                  Los años mostrados corresponden al período en el que la motorización <strong>{selectedTrim?.name || 'seleccionada'}{selectedTrim?.cv ? ` de ${selectedTrim.cv} CV` : ''}</strong> ha estado disponible en el mercado europeo para el modelo <strong>{formData.carModel}</strong>.
                </p>
                <p className="text-blue-700 mt-2">
                  <strong>Nota:</strong> Si aparece el año 2025, significa que la motorización sigue disponible actualmente, no que termine en 2025.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {availableYears.map((year) => (
            <div
              key={year}
              onClick={() => {
                onUpdate({ carYear: year });
                
                // Iniciar scraping después de seleccionar año
                if (formData.carBrand && formData.carModel && selectedTrim) {
                  const scrapingParams = {
                    brand: formData.carBrand,
                    model: formData.carModel,
                    fuel: selectedTrim.fuel,
                    power: selectedTrim.cv,
                    transmission: selectedTrim.transmision?.[0] || 'automatico'
                  };
                  
                  console.log('🎯 Iniciando scraping después de seleccionar año:', year, 'con parámetros:', scrapingParams);
                  startScraping(scrapingParams);
                }
                
                // Avanzar al paso 3 después de seleccionar el año
                onNext();
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.carYear === year
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">
                  <i className="fa-solid fa-calendar-days text-gray-600"></i>
                </div>
                <h4 className="font-semibold text-gray-900">{year}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Indicador de pasos */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                stepNum <= currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        {renderStepContent()}
      </div>

      {/* Navegación interna del paso 2 - Diseño diferenciado */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mt-8">
        {/* Contador de pasos móvil - solo visible en móvil */}
        <div className="text-center mb-4 sm:hidden">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200">
            <span className="text-sm text-gray-500">Pregunta</span>
            <span className="text-base font-semibold text-gray-700 ml-2">{currentStep} de 4</span>
          </div>
        </div>

        {/* Botones de navegación - responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] order-2 sm:order-1">
            <span className="mr-2">←</span>
            Anterior
          </button>

          {/* Contador de pasos desktop - solo visible en desktop */}
          <div className="hidden sm:flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 sm:order-2">
            <span className="text-sm text-gray-500">Pregunta</span>
            <span className="text-base font-semibold text-gray-700 ml-2">{currentStep} de 4</span>
          </div>

          <button
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && !formData.carBrand) ||
              (currentStep === 2 && !formData.carModel) ||
              (currentStep === 3 && !formData.carVersion) ||
              (currentStep === 4 && !formData.carYear)
            }
            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] order-1 sm:order-3"
          >
            Siguiente
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>

      {/* Botones de navegación adicionales */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        {/* Texto móvil - solo visible en móvil */}
        <div className="text-center mb-6 sm:hidden">
          <div className="text-sm font-medium text-gray-600 mb-2">Navegación rápida</div>
          <div className="text-xs text-gray-500">Usa los botones para saltar entre pasos</div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <button
            onClick={onPreviousStep}
            disabled={!onPreviousStep}
            className="flex items-center justify-center px-6 py-4 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            <span className="mr-2">←</span>
            Paso 1
          </button>

          {/* Texto desktop - solo visible en desktop */}
          <div className="hidden sm:block text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">Navegación rápida</div>
            <div className="text-xs text-gray-500">Usa los botones para saltar entre pasos</div>
          </div>

          <button
            onClick={onNextStep}
            disabled={!onNextStep || !isCurrentStepComplete}
            className="flex items-center justify-center px-6 py-4 text-base font-medium text-green-600 bg-white border-2 border-green-600 rounded-lg hover:bg-green-50 hover:border-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            Paso 3
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>

    </div>
  );
}

// Hook simple de debounce
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [val, setVal] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setVal(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return val;
}
