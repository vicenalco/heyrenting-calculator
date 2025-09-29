'use client';

import Slider from './ui/Slider';
import SelectionButton from './ui/SelectionButton';
import { useEffect, useState, useMemo } from 'react';
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
  // Nota: mantenemos stage por si en futuro se muestra paso actual visualmente
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);

  const [brandQuery, setBrandQuery] = useState('');
  const [makes, setMakes] = useState<{ id: string; name: string }[]>([]);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [trims, setTrims] = useState<{ id: string; name: string; price?: number; fuel?: string }[]>([]);
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
        setModels(modelList);
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
        setTrims(trimList);
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
    setStage(2);
  };

  const handleSelectModel = (id: string, name: string) => {
    onUpdate({ 
      carModel: name, 
      carVersion: '',
      modelId: id
    });
    setStage(3);
  };

  const handleSelectTrim = (trim: { id: string; name: string; price?: number; fuel?: string }) => {
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
    
    if (needsFuelChoice(trim.fuel)) {
      setStage(4);
    } else {
      setStage(4);
    }
  };

  const handleFuel = (fuel: string) => {
    onUpdate({ tipoCombustible: fuel });
  };

  const handleNext = () => {
    if (formData.carBrand && formData.carModel && formData.carVersion) onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Configura tu vehículo 🚗
        </h2>
        <p className="text-gray-600">
          Selecciona paso a paso tu coche y ajusta los parámetros para calcular los gastos reales
        </p>
      </div>

      <div className="space-y-8">
        {/* Paso 1: Marca */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">1. Marca</h3>
          <input
            type="text"
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder="Escribe la marca..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-500"
            style={{ '--tw-ring-color': '#52bf31' } as React.CSSProperties}
            onFocus={(e) => e.target.style.setProperty('--tw-ring-color', '#52bf31')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && makes.length > 0) {
                const first = makes[0];
                handleSelectBrand(first.id, first.name);
              }
            }}
          />
          {loading && (
            <p className="text-sm text-gray-500">Buscando marcas...</p>
          )}
          {brandQuery.trim().length >= 2 && !loading && makes.length === 0 && (
            <p className="text-sm text-gray-500">No se han encontrado marcas. Prueba con otra búsqueda.</p>
          )}
          <div className="flex flex-wrap gap-3">
            {makes.map((m) => (
              <SelectionButton 
                key={m.id} 
                label={m.name} 
                onClick={() => handleSelectBrand(m.id, m.name)} 
                isActive={formData.carBrand === m.name} 
              />
            ))}
          </div>
        </div>

        {/* Paso 2: Modelo */}
        {formData.carBrand && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">2. Modelo</h3>
            {loading && (
              <p className="text-sm text-gray-500">Cargando modelos...</p>
            )}
            <div className="flex flex-wrap gap-3">
              {models.map((m) => (
                <SelectionButton 
                  key={m.id} 
                  label={m.name} 
                  onClick={() => handleSelectModel(m.id, m.name)} 
                  isActive={formData.carModel === m.name} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Motorización */}
        {formData.carModel && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">3. Motorización</h3>
            {loading && (
              <p className="text-sm text-gray-500">Cargando motorizaciones...</p>
            )}
            <div className="flex flex-wrap gap-3">
              {trims.map((trim) => (
                <SelectionButton 
                  key={trim.id} 
                  label={trim.name} 
                  onClick={() => handleSelectTrim(trim)} 
                  isActive={formData.carVersion === trim.name} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Paso 4: Combustible (si procede) */}
        {formData.carVersion && needsFuelChoice(formData.tipoCombustible) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">4. Combustible</h3>
            <div className="flex flex-wrap gap-3">
              {['gasolina', 'diésel', 'híbrido', 'phev', 'eléctrico'].map((fuel) => (
                <SelectionButton 
                  key={fuel} 
                  label={fuel} 
                  onClick={() => handleFuel(fuel)} 
                  isActive={formData.tipoCombustible === fuel} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Ajuste de uso */}
        {formData.carVersion && (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-gray-800">Ajusta tu uso</h3>
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

            {/* Resumen de configuración */}
            <div className="rounded-lg p-6" style={{ backgroundColor: '#f0f9f0' }}>
              <h4 className="text-lg font-semibold mb-4" style={{ color: '#2d5a2d' }}>
                Resumen de tu selección
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ color: '#2d5a2d' }}>
                <div>
                  <strong>Marca:</strong> {formData.carBrand}
                </div>
                <div>
                  <strong>Modelo:</strong> {formData.carModel}
                </div>
                <div>
                  <strong>Motorización:</strong> {formData.carVersion}
                </div>
                <div>
                  <strong>Combustible:</strong> {formData.tipoCombustible}
                </div>
                <div>
                  <strong>Precio estimado:</strong> {formData.precioCoche.toLocaleString('es-ES')} €
                </div>
                <div>
                  <strong>Kilómetros anuales:</strong> {formData.kmsAnuales.toLocaleString('es-ES')} km
                </div>
                <div>
                  <strong>Financiación:</strong> {formData.aniosFinanciacion} años
                </div>
              </div>
            </div>

            {/* Botón de siguiente */}
            <div className="text-center">
              <button 
                onClick={handleNext}
                className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:opacity-90"
                style={{ backgroundColor: '#52bf31' }}
                disabled={!formData.carBrand || !formData.carModel || !formData.carVersion}
              >
                Calcular Gastos Reales →
              </button>
            </div>
          </div>
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
