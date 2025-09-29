'use client';

import Slider from './ui/Slider';
import SelectionButton from './ui/SelectionButton';
import { useState } from 'react';

interface Step2a_CarSelectionProps {
  formData: {
    carBrand: string;
    carModel: string;
    carVersion: string; // usaremos para "motorización"
    kmsAnuales: number;
    aniosFinanciacion: number;
    precioCoche: number;
    tipoCombustible: string;
  };
  onUpdate: (updates: Partial<Step2a_CarSelectionProps['formData']>) => void;
  onNext: () => void;
}

export default function Step2a_CarSelection({ formData, onUpdate, onNext }: Step2a_CarSelectionProps) {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);

  // Datos simulados
  const brands = ['Seat', 'Volkswagen', 'BMW'];
  const modelsByBrand: Record<string, string[]> = {
    Seat: ['León', 'Ateca', 'Ibiza'],
    Volkswagen: ['Golf', 'Tiguan', 'Polo'],
    BMW: ['Serie 1', 'Serie 3', 'X1'],
  };
  const motorByModel: Record<string, { label: string; price: number; fuel?: 'gasolina' | 'diésel' | 'híbrido' | 'phev' | 'eléctrico' }[]> = {
    León: [
      { label: '1.0 TSI 110', price: 23000, fuel: 'gasolina' },
      { label: '2.0 TDI 150', price: 28000, fuel: 'diésel' },
      { label: '1.4 e-HYBRID 204', price: 36000, fuel: 'phev' },
    ],
    Ateca: [
      { label: '1.5 TSI 150', price: 30000, fuel: 'gasolina' },
      { label: '2.0 TDI 150', price: 32000, fuel: 'diésel' },
    ],
    Ibiza: [
      { label: '1.0 MPI 80', price: 18000, fuel: 'gasolina' },
    ],
    Golf: [
      { label: '1.5 TSI', price: 29000, fuel: 'gasolina' },
      { label: '2.0 TDI', price: 32000, fuel: 'diésel' },
      { label: 'eHybrid', price: 39000, fuel: 'phev' },
    ],
    Tiguan: [
      { label: '1.5 TSI', price: 35000, fuel: 'gasolina' },
      { label: '2.0 TDI', price: 38000, fuel: 'diésel' },
    ],
    Polo: [
      { label: '1.0 TSI', price: 21000, fuel: 'gasolina' },
    ],
    'Serie 1': [
      { label: '118i', price: 32000, fuel: 'gasolina' },
      { label: '118d', price: 34000, fuel: 'diésel' },
    ],
    'Serie 3': [
      { label: '320i', price: 42000, fuel: 'gasolina' },
      { label: '320d', price: 44000, fuel: 'diésel' },
      { label: '330e', price: 52000, fuel: 'phev' },
    ],
    X1: [
      { label: 'sDrive18i', price: 41000, fuel: 'gasolina' },
      { label: 'sDrive18d', price: 43000, fuel: 'diésel' },
      { label: 'xDrive30e', price: 56000, fuel: 'phev' },
    ],
  };

  const needsFuelChoice = (fuel?: string) => !fuel || fuel === 'híbrido';

  const handleSelectBrand = (brand: string) => {
    onUpdate({ carBrand: brand, carModel: '', carVersion: '', precioCoche: formData.precioCoche });
    setStage(2);
  };

  const handleSelectModel = (model: string) => {
    onUpdate({ carModel: model, carVersion: '', precioCoche: formData.precioCoche });
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
    if (formData.carBrand && formData.carModel && formData.carVersion) {
      onNext();
    }
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
        {stage >= 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">1. Marca</h3>
            <div className="flex flex-wrap gap-3">
              {brands.map((b) => (
                <SelectionButton key={b} label={b} onClick={() => handleSelectBrand(b)} isActive={formData.carBrand === b} />
              ))}
            </div>
          </div>
        )}

        {/* Paso 2: Modelo */}
        {formData.carBrand && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">2. Modelo</h3>
            <div className="flex flex-wrap gap-3">
              {(modelsByBrand[formData.carBrand] || []).map((m) => (
                <SelectionButton key={m} label={m} onClick={() => handleSelectModel(m)} isActive={formData.carModel === m} />
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Motorización */}
        {formData.carModel && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">3. Motorización</h3>
            <div className="flex flex-wrap gap-3">
              {(motorByModel[formData.carModel] || []).map((mot) => (
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
