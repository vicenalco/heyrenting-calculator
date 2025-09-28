'use client';

import { useState } from 'react';
import Slider from './components/ui/Slider';

export default function Home() {
  // Estado para controlar el valor del slider
  const [kilometrosAnuales, setKilometrosAnuales] = useState(15000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚗 HEYrenting Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculadora financiera para tu próximo vehículo
          </p>
        </div>

        {/* Contenedor principal de la calculadora */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
            Configuración del Vehículo
          </h2>

          {/* Ejemplo de uso del componente Slider */}
          <div className="space-y-8">
            <Slider
              label="Kilómetros Anuales"
              min={5000}
              max={50000}
              step={1000}
              value={kilometrosAnuales}
              onChange={setKilometrosAnuales}
              unit="km"
            />

            {/* Información adicional mostrada en tiempo real */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Información del Vehículo
              </h3>
              <p className="text-blue-700">
                Has seleccionado <strong>{kilometrosAnuales.toLocaleString('es-ES')} km</strong> anuales.
                {kilometrosAnuales > 30000 && (
                  <span className="block mt-2 text-sm text-orange-600">
                    ⚠️ Con este kilometraje, considera un vehículo con motor diésel para mayor eficiencia.
                  </span>
                )}
              </p>
            </div>

            {/* Botón de acción (placeholder) */}
            <div className="text-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg">
                Calcular Financiación
              </button>
            </div>
          </div>
        </div>

        {/* Footer informativo */}
        <div className="text-center mt-8 text-gray-600">
          <p>Componente Slider creado con React, TypeScript y Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
