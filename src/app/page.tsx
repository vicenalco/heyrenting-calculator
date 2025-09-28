'use client';

import { useState, useEffect } from 'react';
import Slider from './components/ui/Slider';
import SelectionButton from './components/ui/SelectionButton';

export default function Home() {
  // Estados principales de la calculadora
  const [kmsAnuales, setKmsAnuales] = useState(20000);
  const [aniosFinanciacion, setAniosFinanciacion] = useState(5);
  const [precioCoche, setPrecioCoche] = useState(25000);
  const [tipoCombustible, setTipoCombustible] = useState('gasolina');

  // Función de cálculo principal (esqueleto por ahora)
  const calculateOwnershipCost = (kms: number, anios: number, precio: number, combustible: string) => {
    console.log('=== CÁLCULO DE COSTES ===');
    console.log('Kilómetros anuales:', kms);
    console.log('Años de financiación:', anios);
    console.log('Precio del coche:', precio);
    console.log('Tipo de combustible:', combustible);
    console.log('========================');
  };

  // useEffect para recalcular automáticamente cuando cambien los estados
  // Se ejecuta cada vez que cambia cualquiera de los valores de entrada
  useEffect(() => {
    calculateOwnershipCost(kmsAnuales, aniosFinanciacion, precioCoche, tipoCombustible);
  }, [kmsAnuales, aniosFinanciacion, precioCoche, tipoCombustible]);

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

          {/* Sliders para configurar la calculadora */}
          <div className="space-y-8">
            {/* Slider para Kilómetros Anuales */}
            <Slider
              label="Kilómetros Anuales"
              min={5000}
              max={50000}
              step={1000}
              value={kmsAnuales}
              onChange={setKmsAnuales}
              unit="km"
            />

            {/* Slider para Años de Financiación */}
            <Slider
              label="Años de Financiación"
              min={1}
              max={8}
              step={1}
              value={aniosFinanciacion}
              onChange={setAniosFinanciacion}
              unit="años"
            />

            {/* Slider para Precio del Coche */}
            <Slider
              label="Precio del Coche"
              min={10000}
              max={80000}
              step={1000}
              value={precioCoche}
              onChange={setPrecioCoche}
              unit="€"
            />

            {/* Selección de Tipo de Combustible */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Tipo de Combustible</h3>
              <div className="flex gap-4">
                <SelectionButton
                  label="Gasolina"
                  onClick={() => setTipoCombustible('gasolina')}
                  isActive={tipoCombustible === 'gasolina'}
                />
                <SelectionButton
                  label="Diésel"
                  onClick={() => setTipoCombustible('diésel')}
                  isActive={tipoCombustible === 'diésel'}
                />
              </div>
            </div>

            {/* Información adicional mostrada en tiempo real */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Resumen de Configuración
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                <div>
                  <strong>Kilómetros anuales:</strong> {kmsAnuales.toLocaleString('es-ES')} km
                </div>
                <div>
                  <strong>Financiación:</strong> {aniosFinanciacion} años
                </div>
                <div>
                  <strong>Precio:</strong> {precioCoche.toLocaleString('es-ES')} €
                </div>
                <div>
                  <strong>Combustible:</strong> {tipoCombustible}
                </div>
              </div>
              {kmsAnuales > 30000 && tipoCombustible === 'gasolina' && (
                <div className="mt-4 p-3 bg-orange-100 border-l-4 border-orange-500 rounded">
                  <p className="text-orange-700 text-sm">
                    💡 Con este kilometraje, considera un vehículo diésel para mayor eficiencia.
                  </p>
                </div>
              )}
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
