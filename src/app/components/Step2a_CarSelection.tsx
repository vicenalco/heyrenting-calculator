'use client';

import Slider from './ui/Slider';
import SelectionButton from './ui/SelectionButton';
import { useEffect, useState } from 'react';
import { fetchBrands, fetchModels, fetchTrims } from '@/lib/airtable';

interface Step2a_CarSelectionProps {
  formData: {
    carBrand: string;
    carModel: string;
    carVersion: string; // usaremos para "motorización"
    kmsAnuales: number;
    aniosFinanciacion: number;
    precioCoche: number;
    tipoCombustible: string;
    makeQid?: string;
    brandId?: string;
    modelId?: string;
  };
  onUpdate: (updates: Partial<Step2a_CarSelectionProps['formData']>) => void;
  onNext: () => void;
}

export default function Step2a_CarSelection({ formData, onUpdate, onNext }: Step2a_CarSelectionProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [brandQuery, setBrandQuery] = useState('');
  const [makes, setMakes] = useState<{ id: string; name: string }[]>([]);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [trims, setTrims] = useState<{ id: string; name: string; price?: number; fuel?: string; cv?: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce para evitar sobrecargar Airtable
  const debouncedQuery = useDebouncedValue(brandQuery, 300);

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
    
    setLoading(true);
    fetchModels(formData.brandId)
      .then((modelList) => {
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
      })
      .catch((error) => {
        console.error('Error fetching models:', error);
        setModels([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [formData.brandId]);

  // Cargar trims cuando se selecciona un modelo
  useEffect(() => {
    if (!formData.modelId) { 
      setTrims([]); 
      return; 
    }
    
    setLoading(true);
    fetchTrims(formData.modelId)
      .then((trimList) => {
        // Verificar si es un objeto de debug
        if (trimList && typeof trimList === 'object' && 'debug' in trimList) {
          console.log('Debug info from trims:', trimList);
          setTrims([]);
        } else if (Array.isArray(trimList)) {
          setTrims(trimList);
        } else {
          console.error('Unexpected response format:', trimList);
          setTrims([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching trims:', error);
        setTrims([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [formData.modelId]);

  const needsFuelChoice = (fuel?: string) => !fuel || fuel === 'híbrido';

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
    
    // Siempre ir al paso 4 (uso y resumen)
    setCurrentStep(4);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleNext = () => {
    if (formData.carBrand && formData.carModel && formData.carVersion) onNext();
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
        return renderUsageStep();
      default:
        return renderBrandStep();
    }
  };

  const renderBrandStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">🏷️ ¿Qué marca te gusta?</h3>
        <p className="text-gray-600">Busca y selecciona la marca de tu vehículo</p>
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
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-green-500"></div>
          </div>
        )}
      </div>
      
      {brandQuery.trim().length >= 2 && !loading && makes.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-500">No encontramos esa marca. Prueba con otra búsqueda</p>
        </div>
      )}
      
      {makes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                <div className="text-2xl mb-2">🚗</div>
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">🚙 Elige tu modelo</h3>
        <p className="text-gray-600">Selecciona el modelo de <strong>{formData.carBrand}</strong></p>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando modelos...</p>
        </div>
      )}
      
      {!loading && models.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="text-3xl mb-3">🚗</div>
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">⚙️ ¿Qué motorización prefieres?</h3>
        <p className="text-gray-600">Elige la versión de <strong>{formData.carModel}</strong></p>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando motorizaciones...</p>
        </div>
      )}
      
      {!loading && trims.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trims.map((trim) => (
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
                {typeof trim.price === 'number' && trim.price > 0 && (
                  <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
                    <i className="fa-solid fa-tags" aria-hidden="true"></i>
                    <span>{trim.price.toLocaleString('es-ES')} €</span>
                  </div>
                )}
                {(trim.fuel || typeof trim.cv === 'number') && (
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    {trim.fuel && (
                      <span className="inline-flex items-center gap-1">
                        <i className="fa-solid fa-gas-pump" aria-hidden="true"></i>
                        <span className="capitalize">{trim.fuel}</span>
                      </span>
                    )}
                    {typeof trim.cv === 'number' && (
                      <span className="inline-flex items-center gap-1">
                        <i className="fa-solid fa-horse" aria-hidden="true"></i>
                        <span>{trim.cv} CV</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );


  const renderUsageStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">📊 Ajusta tu uso</h3>
        <p className="text-gray-600">Personaliza los parámetros según tus necesidades</p>
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
          <h4 className="text-2xl font-bold text-gray-900 mb-2">✨ Tu configuración</h4>
          <p className="text-gray-600">Revisa tu selección antes de calcular</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">🚗</span>
              <div>
                <p className="text-sm text-gray-500">Vehículo</p>
                <p className="font-bold text-gray-900">{formData.carBrand} {formData.carModel}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">⚙️</span>
              <div>
                <p className="text-sm text-gray-500">Motorización</p>
                <p className="font-bold text-gray-900">{formData.carVersion}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">💰</span>
              <div>
                <p className="text-sm text-gray-500">Precio estimado</p>
                <p className="font-bold text-green-600 text-lg">{formData.precioCoche.toLocaleString('es-ES')} €</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">📊</span>
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

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Configura tu vehículo 🚗
        </h2>
        <p className="text-gray-600">
          Selecciona paso a paso tu coche y ajusta los parámetros para calcular los gastos reales
        </p>
        
        {/* Indicador de pasos */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
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

      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
          className="flex items-center px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="mr-2">←</span>
          Anterior
        </button>

        <div className="text-sm text-gray-500">
          Paso {currentStep} de 4
        </div>

        {currentStep === 4 ? (
          <button 
            onClick={handleNext}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ backgroundColor: '#52bf31' }}
            disabled={!formData.carBrand || !formData.carModel || !formData.carVersion}
          >
            <span className="mr-2">🚀</span>
            Calcular Gastos Reales
            <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
          </button>
        ) : (
          <button
            onClick={handleNextStep}
            disabled={
              (currentStep === 1 && !formData.carBrand) ||
              (currentStep === 2 && !formData.carModel) ||
              (currentStep === 3 && !formData.carVersion)
            }
            className="flex items-center px-6 py-3 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#52bf31' }}
          >
            Siguiente
            <span className="ml-2">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Hook simple de debounce
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [val, setVal] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setVal(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return val;
}
