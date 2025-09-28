'use client';

import Slider from './ui/Slider';
import SelectionButton from './ui/SelectionButton';
import { useState } from 'react';

interface Step2a_CarSelectionProps {
  formData: {
    carModel: string;
    carVersion: string;
    kmsAnuales: number;
    aniosFinanciacion: number;
    precioCoche: number;
    tipoCombustible: string;
  };
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

export default function Step2a_CarSelection({ formData, onUpdate, onNext }: Step2a_CarSelectionProps) {
  const [carSearch, setCarSearch] = useState('');
  const [showVersions, setShowVersions] = useState(false);

  const handleCarSearch = (value: string) => {
    setCarSearch(value);
    onUpdate({ carModel: value });
    // Simular que encontramos el coche y mostrar versiones
    if (value.length > 3) {
      setShowVersions(true);
    }
  };

  const handleVersionSelect = (version: string, price: number) => {
    onUpdate({ carVersion: version, precioCoche: price });
  };

  const handleNext = () => {
    // Validar que tenemos los datos mínimos necesarios
    if (formData.precioCoche > 0 && formData.aniosFinanciacion > 0 && formData.kmsAnuales > 0) {
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
          Busca tu coche y ajusta los parámetros para calcular todos los gastos reales
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. Búsqueda de coche */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">1. Escribe la marca y modelo de tu coche</h3>
          <input
            type="text"
            value={carSearch}
            onChange={(e) => handleCarSearch(e.target.value)}
            placeholder="Ej: Seat León, Volkswagen Golf, BMW Serie 3..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* 2. Selección de versión */}
        {showVersions && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">2. Selecciona la versión</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectionButton
                label="1.5 TSI Style"
                onClick={() => handleVersionSelect('1.5 TSI Style', 28000)}
                isActive={formData.carVersion === '1.5 TSI Style'}
              />
              <SelectionButton
                label="2.0 TDI FR"
                onClick={() => handleVersionSelect('2.0 TDI FR', 32000)}
                isActive={formData.carVersion === '2.0 TDI FR'}
              />
              <SelectionButton
                label="1.4 e-HYBRID"
                onClick={() => handleVersionSelect('1.4 e-HYBRID', 40000)}
                isActive={formData.carVersion === '1.4 e-HYBRID'}
              />
            </div>
          </div>
        )}

        {/* 3. Ajuste de uso */}
        {formData.carVersion && (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-gray-800">3. Ajusta tu uso</h3>
            
            {/* Slider para Kilómetros Anuales */}
            <Slider
              label="Kilómetros Anuales"
              min={5000}
              max={50000}
              step={1000}
              value={formData.kmsAnuales}
              onChange={(value) => onUpdate({ kmsAnuales: value })}
              unit="km"
            />

            {/* Slider para Años de Financiación */}
            <Slider
              label="Años de Financiación"
              min={1}
              max={8}
              step={1}
              value={formData.aniosFinanciacion}
              onChange={(value) => onUpdate({ aniosFinanciacion: value })}
              unit="años"
            />

            {/* Selección de Tipo de Combustible */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-800">Tipo de Combustible</h4>
              <div className="flex gap-4">
                <SelectionButton
                  label="Gasolina"
                  onClick={() => onUpdate({ tipoCombustible: 'gasolina' })}
                  isActive={formData.tipoCombustible === 'gasolina'}
                />
                <SelectionButton
                  label="Diésel"
                  onClick={() => onUpdate({ tipoCombustible: 'diésel' })}
                  isActive={formData.tipoCombustible === 'diésel'}
                />
              </div>
            </div>

            {/* Resumen de configuración */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-4">
                Resumen de tu selección
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                <div>
                  <strong>Vehículo:</strong> {formData.carModel} {formData.carVersion}
                </div>
                <div>
                  <strong>Precio:</strong> {formData.precioCoche.toLocaleString('es-ES')} €
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
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
