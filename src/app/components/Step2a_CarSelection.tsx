'use client';

import Slider from './ui/Slider';
import SelectionButton from './ui/SelectionButton';
import { useEffect, useState } from 'react';
import { fetchMakesWD, fetchModelsWD } from '@/lib/wikidata';

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
  };
  onUpdate: (updates: Partial<Step2a_CarSelectionProps['formData']>) => void;
  onNext: () => void;
}

export default function Step2a_CarSelection({ formData, onUpdate, onNext }: Step2a_CarSelectionProps) {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);

  const [brandQuery, setBrandQuery] = useState('');
  const [makes, setMakes] = useState<{ qid: string; name: string }[]>([]);
  const [models, setModels] = useState<{ qid: string; name: string; startYear?: string; endYear?: string | null }[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetchMakesWD(brandQuery);
      if (active) setMakes(res);
    })();
    return () => { active = false; };
  }, [brandQuery]);

  useEffect(() => {
    let active = true;
    if (!formData.makeQid) return;
    (async () => {
      const res = await fetchModelsWD(formData.makeQid!);
      if (active) setModels(res);
    })();
    return () => { active = false; };
  }, [formData.makeQid]);

  const motorByModel: Record<string, { label: string; price: number; fuel?: 'gasolina' | 'diésel' | 'híbrido' | 'phev' | 'eléctrico' }[]> = {
    default: [
      { label: 'Gasolina 1.5', price: 28000, fuel: 'gasolina' },
      { label: 'Diésel 2.0', price: 32000, fuel: 'diésel' },
      { label: 'Híbrido enchufable', price: 40000, fuel: 'phev' },
    ],
  };

  const needsFuelChoice = (fuel?: string) => !fuel || fuel === 'híbrido';

  const handleSelectBrand = (qid: string, name: string) => {
    onUpdate({ carBrand: name, carModel: '', carVersion: '', makeQid: qid });
    setStage(2);
  };

  const handleSelectModel = (model: string) => {
    onUpdate({ carModel: model, carVersion: '' });
    setStage(3);
  };

  const handleSelectMotor = (motor: { label: string; price: number; fuel?: string }) => {
    onUpdate({ carVersion: motor.label, precioCoche: motor.price });
    if (needsFuelChoice(motor.fuel)) {
      setStage(4);
    } else if (motor.fuel) {
      onUpdate({ tipoCombustible: motor.fuel });
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
        {/* Paso 1: Marca (Wikidata + eswiki) */}
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
                handleSelectBrand(first.qid, first.name);
              }
            }}
          />
          <div className="flex flex-wrap gap-3">
            {makes.map((m) => (
              <SelectionButton key={m.qid} label={m.name} onClick={() => handleSelectBrand(m.qid, m.name)} isActive={formData.carBrand === m.name} />
            ))}
          </div>
        </div>

        {/* Paso 2: Modelo (vigente en 2025 en eswiki) */}
        {formData.makeQid && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">2. Modelo</h3>
            <div className="flex flex-wrap gap-3">
              {models.map((m) => (
                <SelectionButton key={m.qid} label={m.name} onClick={() => handleSelectModel(m.name)} isActive={formData.carModel === m.name} />
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Motorización (temporal) */}
        {formData.carModel && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">3. Motorización</h3>
            <div className="flex flex-wrap gap-3">
              {(motorByModel[formData.carModel] || motorByModel.default).map((mot) => (
                <SelectionButton key={mot.label} label={mot.label} onClick={() => handleSelectMotor(mot)} isActive={formData.carVersion === mot.label} />
              ))}
            </div>
          </div>
        )}

        {/* Paso 4: Combustible (si procede) */}
        {formData.carVersion && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">4. Combustible</h3>
            <div className="flex flex-wrap gap-3">
              {['gasolina', 'diésel', 'híbrido', 'phev', 'eléctrico'].map((fuel) => (
                <SelectionButton key={fuel} label={fuel} onClick={() => handleFuel(fuel)} isActive={formData.tipoCombustible === fuel} />
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
