'use client';

import Slider from './ui/Slider';
import { useEffect, useState } from 'react';
import { fetchBrands, fetchModels, fetchTrims, fetchTrimsWithKm77Prices } from '@/lib/airtable';
import Image from 'next/image';
import PriceUpdateInfo from './PriceUpdateInfo';
import PriceScrapingProgress from './PriceScrapingProgress';
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
  onScrapingStateChange?: (state: any) => void;
}

export default function Step2a_CarSelection({ formData, onUpdate, onNext, isModifying = false, onFinishModifying, onScrapingStateChange }: Step2a_CarSelectionProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);

  const [brandQuery, setBrandQuery] = useState('');
  const [makes, setMakes] = useState<{ id: string; name: string }[]>([]);
  const [models, setModels] = useState<{ id: string; name: string; startYear?: number; endYear?: number; imageUrl?: string }[]>([]);
  const [trims, setTrims] = useState<{ id: string; name: string; price?: number; fuel?: string; cv?: number; transmision?: string[]; priceUpdated?: boolean; priceAccuracy?: string; originalPrice?: number }[]>([]);
  const [selectedTrim, setSelectedTrim] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [priceUpdateStats, setPriceUpdateStats] = useState<{
    totalTrims: number;
    updatedTrims: number;
    accuracyPercentage: number;
  } | null>(null);

  // Hook para scraping en segundo plano
  const {
    isScraping,
    progress,
    currentStep: scrapingCurrentStep,
    results: scrapingResults,
    error: scrapingError,
    completed: scrapingCompleted,
    startScraping,
    resetScraping,
  } = useBackgroundPriceScraping();
  
  // Estados para el paso 5 (preguntas adicionales)
  const [usoVehiculo, setUsoVehiculo] = useState('');
  const [estiloConduccion, setEstiloConduccion] = useState('');
  const [frecuenciaUso, setFrecuenciaUso] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [experiencia, setExperiencia] = useState('');

  // Debounce para evitar sobrecargar Airtable
  const debouncedQuery = useDebouncedValue(brandQuery, 100);

  // Limpiar estado de carga cuando se entra en modo modificación
  useEffect(() => {
    if (isModifying) {
      setLoading(false);
      setLoadingText('');
    }
  }, [isModifying]);

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
      
      // Delay de 2-3 segundos con texto personalizado
      await delayWithLoading(2500, 'Buscando modelos...');
      
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
      
      // Sin delay ni animación - cargar trims directamente
      
      try {
        // Primero intentar obtener trims con precios actualizados
        const trimListWithPrices = await fetchTrimsWithKm77Prices(formData.brandId!, formData.modelId!);
        
        if (trimListWithPrices && trimListWithPrices.success && trimListWithPrices.data.trims) {
          // Usar los trims con precios actualizados
          const trimsWithUpdatedPrices = trimListWithPrices.data.trims.map((integrationResult: any) => {
            const trim = integrationResult.trim;
            const updatedPrice = integrationResult.averagePrice || integrationResult.lowestPrice || trim.price;
            
            return {
              ...trim,
              price: updatedPrice, // Usar el precio actualizado
              originalPrice: trim.price, // Guardar precio original
              priceUpdated: !!updatedPrice && updatedPrice !== trim.price, // Indicar si se actualizó
              priceAccuracy: integrationResult.priceAccuracy
            };
          });
          
          // Calcular estadísticas de actualización
          const totalTrims = trimsWithUpdatedPrices.length;
          const updatedTrims = trimsWithUpdatedPrices.filter((t: any) => t.priceUpdated).length;
          const accuratePrices = trimsWithUpdatedPrices.filter((t: any) => 
            t.priceAccuracy === 'exact' || t.priceAccuracy === 'close'
          ).length;
          const accuracyPercentage = totalTrims > 0 ? Math.round((accuratePrices / totalTrims) * 100) : 0;
          
          setPriceUpdateStats({
            totalTrims,
            updatedTrims,
            accuracyPercentage
          });
          
          setTrims(trimsWithUpdatedPrices);
        } else {
          // Fallback a trims normales si no hay precios actualizados
          const trimList = await fetchTrims(formData.modelId!);
          
          if (trimList && typeof trimList === 'object' && 'debug' in trimList) {
            console.log('Debug info from trims:', trimList);
            setTrims([]);
          } else if (Array.isArray(trimList)) {
            setTrims(trimList);
          } else {
            console.error('Unexpected response format:', trimList);
            setTrims([]);
          }
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
          const matchingResult = scrapingResults.find((result: any) => 
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
    setCurrentStep(3);
  };

  const handleSelectTrim = (trim: { id: string; name: string; price?: number; fuel?: string; cv?: number }) => {
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
    if (currentStep < 7) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    }
  };

  const handleNext = () => {
    if (formData.carBrand && formData.carModel && formData.carVersion && formData.carYear && formData.kmsAnuales) {
      // Guardar las respuestas adicionales en formData
      onUpdate({
        usoVehiculo,
        estiloConduccion,
        frecuenciaUso,
        presupuesto,
        experiencia
      });
      onNext();
    }
  };

  const handleUsoVehiculo = (uso: string) => {
    setUsoVehiculo(uso);
    // No cambiar el paso automáticamente, dejar que el usuario use el botón "Siguiente"
  };

  const handleEstiloConduccion = (estilo: string) => {
    setEstiloConduccion(estilo);
  };

  const handleFrecuenciaUso = (frecuencia: string) => {
    setFrecuenciaUso(frecuencia);
  };

  const handlePresupuesto = (presu: string) => {
    setPresupuesto(presu);
  };

  const handleExperiencia = (exp: string) => {
    setExperiencia(exp);
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
      case 5:
        return renderUsageStep();
      case 6:
        return renderQuestionsStep();
      case 7:
        return renderKmsStep();
      case 8:
        return renderProvinceStep();
      default:
        return renderBrandStep();
    }
  };

  const renderBrandStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          <i className="fa-solid fa-tag mr-2"></i>¿Qué marca te gusta?
        </h3>
        <p className="text-gray-600">Busca y selecciona la marca del vehículo que quieres comprar</p>
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={brandQuery}
          onChange={(e) => setBrandQuery(e.target.value)}
          placeholder="Escribe la marca que buscas..."
          className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
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
          <div className="text-4xl mb-2">🔍</div>
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
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">🚙 Elige el modelo</h3>
        <p className="text-gray-600">Selecciona el modelo de <strong>{formData.carBrand}</strong></p>
      </div>
      
      {loading && (
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-green-500 text-lg">⚙️</div>
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
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          <i className="fa-solid fa-cogs mr-2"></i>¿Qué motorización prefieres?
        </h3>
        <p className="text-gray-600">Elige la versión de <strong>{formData.carModel}</strong></p>
      </div>
      
      {loading && (
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-green-500 text-lg">🔧</div>
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
                formData.carVersion === trim.name
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
    </div>
  );

  const renderYearStep = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => currentYear - i);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            <i className="fa-solid fa-calendar mr-2"></i>¿De qué año es el vehículo que quieres comprar?
          </h3>
          <p className="text-gray-600">Selecciona el año de fabricación del <strong>{formData.carModel}</strong> que quieres comprar</p>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {years.map((year) => (
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
                    transmission: (selectedTrim as any).transmision?.[0] || 'automatico'
                  };
                  
                  console.log('🎯 Iniciando scraping después de seleccionar año:', year, 'con parámetros:', scrapingParams);
                  startScraping(scrapingParams);
                }
                
                setCurrentStep(5);
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

  const renderUsageStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          <i className="fa-solid fa-euro-sign mr-2"></i>Configura tu financiación
        </h3>
        <p className="text-gray-600">Selecciona los años de financiación para el vehículo que quieres comprar</p>
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
        <Slider
          label="Años de Financiación"
          min={1}
          max={8}
          step={1}
          value={formData.aniosFinanciacion}
          onChange={(value) => onUpdate({ aniosFinanciacion: value })}
          unit="años"
        />
      </div>

      {/* Resumen de configuración */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900 mb-2">✨ Configuración seleccionada</h4>
          <p className="text-gray-600">Revisa la selección antes de calcular</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fa-solid fa-car text-2xl mr-3 text-gray-600"></i>
              <div>
                <p className="text-sm text-gray-500">Vehículo</p>
                <p className="font-bold text-gray-900">{formData.carBrand} {formData.carModel} {formData.carYear}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fa-solid fa-cogs text-2xl mr-3 text-gray-600"></i>
              <div>
                <p className="text-sm text-gray-500">Motorización</p>
                <p className="font-bold text-gray-900">{formData.carVersion}</p>
              </div>
            </div>
          </div>
          
          {/* Precio eliminado - solo se mostrará en el paso 3 */}
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fa-solid fa-euro-sign text-2xl mr-3 text-gray-600"></i>
              <div>
                <p className="text-sm text-gray-500">Financiación</p>
                <p className="font-bold text-gray-900">{formData.aniosFinanciacion} años</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKmsStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          <i className="fa-solid fa-road mr-2"></i>¿Cuántos kilómetros harás al año?
        </h3>
        <p className="text-gray-600">Estima el uso anual que tendrás con el vehículo para calcular los gastos reales</p>
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
        <Slider
          label="Kilómetros Anuales"
          min={5000}
          max={50000}
          step={1000}
          value={formData.kmsAnuales}
          onChange={(value) => onUpdate({ kmsAnuales: value })}
          unit="km"
        />
      </div>

      {/* Resumen final */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900 mb-2">🚗 Vehículo seleccionado</h4>
          <p className="text-gray-600">Revisa toda la configuración antes de calcular</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fa-solid fa-car text-2xl mr-3 text-gray-600"></i>
              <div>
                <p className="text-sm text-gray-500">Vehículo</p>
                <p className="font-bold text-gray-900">{formData.carBrand} {formData.carModel} {formData.carYear}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fa-solid fa-cogs text-2xl mr-3 text-gray-600"></i>
              <div>
                <p className="text-sm text-gray-500">Motorización</p>
                <p className="font-bold text-gray-900">{formData.carVersion}</p>
              </div>
            </div>
          </div>
          
          {/* Precio eliminado - solo se mostrará en el paso 3 */}
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fa-solid fa-euro-sign text-2xl mr-3 text-gray-600"></i>
              <div>
                <p className="text-sm text-gray-500">Financiación</p>
                <p className="font-bold text-gray-900">{formData.aniosFinanciacion} años</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <i className="fa-solid fa-road text-2xl mr-3 text-gray-600"></i>
              <div>
                <p className="text-sm text-gray-500">Uso anual</p>
                <p className="font-bold text-gray-900">{formData.kmsAnuales.toLocaleString('es-ES')} km</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProvinceStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          <i className="fa-solid fa-map-marker-alt mr-2"></i>¿En qué provincia vives?
        </h3>
        <p className="text-gray-600">Selecciona tu provincia para cálculos más precisos</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {PROVINCIAS_ESPANA.map((provincia) => (
          <button
            key={provincia}
            onClick={() => {
              onUpdate({ provincia });
              setCurrentStep(8);
            }}
            className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              formData.provincia === provincia
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <div className="text-center">
              <div className="text-lg mb-1">
                <i className="fa-solid fa-map-pin text-gray-600"></i>
              </div>
              <span className="text-sm font-medium text-gray-900">{provincia}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          <i className="fa-solid fa-question-circle mr-2"></i>Cuéntanos más sobre tu uso
        </h3>
        <p className="text-gray-600">Estas respuestas nos ayudarán a calcular los gastos reales más precisos</p>
      </div>

      {/* Uso del vehículo */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">
          <i className="fa-solid fa-route mr-2"></i>¿Cómo usarás principalmente tu {formData.carModel}?
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'urbano', label: 'Ciudad', icon: 'fa-city', desc: 'Trayectos cortos, semáforos, atascos' },
            { key: 'carretera', label: 'Carretera', icon: 'fa-road', desc: 'Viajes largos, autopistas' },
            { key: 'mixto', label: 'Mixto', icon: 'fa-balance-scale', desc: 'Combinación de ciudad y carretera' }
          ].map((uso) => (
            <div
              key={uso.key}
              onClick={() => handleUsoVehiculo(uso.key)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                usoVehiculo === uso.key
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <i className={`fa-solid ${uso.icon} text-2xl mb-2 text-gray-600`}></i>
                <h5 className="font-semibold text-gray-900">{uso.label}</h5>
                <p className="text-xs text-gray-500 mt-1">{uso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estilo de conducción */}
      {usoVehiculo && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            <i className="fa-solid fa-steering-wheel mr-2"></i>¿Cómo describirías tu estilo de conducción?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'conservador', label: 'Conservador', icon: 'fa-shield-halved', desc: 'Suave, eficiente, precavido' },
              { key: 'normal', label: 'Normal', icon: 'fa-gauge', desc: 'Equilibrado, respeta límites' },
              { key: 'deportivo', label: 'Deportivo', icon: 'fa-bolt', desc: 'Dinámico, aceleraciones rápidas' }
            ].map((estilo) => (
              <div
                key={estilo.key}
                onClick={() => handleEstiloConduccion(estilo.key)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  estiloConduccion === estilo.key
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <i className={`fa-solid ${estilo.icon} text-2xl mb-2 text-gray-600`}></i>
                  <h5 className="font-semibold text-gray-900">{estilo.label}</h5>
                  <p className="text-xs text-gray-500 mt-1">{estilo.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frecuencia de uso */}
      {estiloConduccion && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            <i className="fa-solid fa-calendar-days mr-2"></i>¿Con qué frecuencia usarás el vehículo?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'diario', label: 'Diario', icon: 'fa-calendar-day', desc: 'Todos los días, trabajo y ocio' },
              { key: 'frecuente', label: 'Frecuente', icon: 'fa-calendar-week', desc: 'Varias veces por semana' },
              { key: 'ocasional', label: 'Ocasional', icon: 'fa-calendar', desc: 'Fines de semana y vacaciones' }
            ].map((frecuencia) => (
              <div
                key={frecuencia.key}
                onClick={() => handleFrecuenciaUso(frecuencia.key)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  frecuenciaUso === frecuencia.key
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <i className={`fa-solid ${frecuencia.icon} text-2xl mb-2 text-gray-600`}></i>
                  <h5 className="font-semibold text-gray-900">{frecuencia.label}</h5>
                  <p className="text-xs text-gray-500 mt-1">{frecuencia.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Presupuesto */}
      {frecuenciaUso && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            <i className="fa-solid fa-euro-sign mr-2"></i>¿Cuál es tu presupuesto mensual aproximado para mantenimiento?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'bajo', label: 'Bajo (50-100€)', icon: 'fa-coins', desc: 'Mantenimiento básico' },
              { key: 'medio', label: 'Medio (100-200€)', icon: 'fa-wallet', desc: 'Mantenimiento regular' },
              { key: 'alto', label: 'Alto (200€+)', icon: 'fa-gem', desc: 'Mantenimiento premium' }
            ].map((presu) => (
              <div
                key={presu.key}
                onClick={() => handlePresupuesto(presu.key)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  presupuesto === presu.key
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <i className={`fa-solid ${presu.icon} text-2xl mb-2 text-gray-600`}></i>
                  <h5 className="font-semibold text-gray-900">{presu.label}</h5>
                  <p className="text-xs text-gray-500 mt-1">{presu.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experiencia */}
      {presupuesto && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            <i className="fa-solid fa-graduation-cap mr-2"></i>¿Qué experiencia tienes con vehículos similares?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'principiante', label: 'Principiante', icon: 'fa-seedling', desc: 'Primer vehículo o poco experiencia' },
              { key: 'intermedio', label: 'Intermedio', icon: 'fa-chart-line', desc: 'Alguna experiencia con vehículos' },
              { key: 'experto', label: 'Experto', icon: 'fa-crown', desc: 'Mucha experiencia, conoces el mercado' }
            ].map((exp) => (
              <div
                key={exp.key}
                onClick={() => handleExperiencia(exp.key)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  experiencia === exp.key
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <i className={`fa-solid ${exp.icon} text-2xl mb-2 text-gray-600`}></i>
                  <h5 className="font-semibold text-gray-900">{exp.label}</h5>
                  <p className="text-xs text-gray-500 mt-1">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen de respuestas */}
      {experiencia && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            <i className="fa-solid fa-clipboard-check mr-2"></i>Resumen de tu perfil
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Uso:</strong> {usoVehiculo === 'urbano' ? 'Ciudad' : usoVehiculo === 'carretera' ? 'Carretera' : 'Mixto'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Conducción:</strong> {estiloConduccion === 'conservador' ? 'Conservador' : estiloConduccion === 'normal' ? 'Normal' : 'Deportivo'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Frecuencia:</strong> {frecuenciaUso === 'diario' ? 'Diario' : frecuenciaUso === 'frecuente' ? 'Frecuente' : 'Ocasional'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Presupuesto:</strong> {presupuesto === 'bajo' ? 'Bajo' : presupuesto === 'medio' ? 'Medio' : 'Alto'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          <i className="fa-solid fa-car mr-2"></i>Configura el vehículo
        </h2>
        <p className="text-gray-600">
          Selecciona paso a paso el coche que quieres comprar y ajusta los parámetros para calcular los gastos reales
        </p>
        
        {/* Indicador de pasos */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  step <= currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        {renderStepContent()}
      </div>

      {/* Navegación interna del paso 2 - Diseño diferenciado */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className="flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-1">←</span>
            Anterior
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Paso</span>
            <span className="text-sm font-medium text-gray-700">{currentStep} de 8</span>
          </div>

          {currentStep === 8 ? (
            <button 
              onClick={isModifying ? onFinishModifying : handleNext}
              className="flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.carBrand || !formData.carModel || !formData.carVersion || !formData.carYear || !formData.kmsAnuales || !formData.provincia || !usoVehiculo || !estiloConduccion || !frecuenciaUso || !presupuesto || !experiencia}
            >
              <span className="mr-1">🚀</span>
              {isModifying ? 'Ver Resultados' : 'Finalizar'}
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              disabled={
                (currentStep === 1 && !formData.carBrand) ||
                (currentStep === 2 && !formData.carModel) ||
                (currentStep === 3 && !formData.carVersion) ||
                (currentStep === 4 && !formData.carYear) ||
                (currentStep === 5 && !formData.aniosFinanciacion) ||
                (currentStep === 6 && (!usoVehiculo || !estiloConduccion || !frecuenciaUso || !presupuesto || !experiencia)) ||
                (currentStep === 7 && !formData.kmsAnuales) ||
                ((currentStep as number) === 8 && !formData.provincia)
              }
              className="flex items-center px-3 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
              <span className="ml-1">→</span>
            </button>
          )}
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
