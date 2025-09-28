'use client';

import { useState, useEffect } from 'react';
import Slider from './components/ui/Slider';
import SelectionButton from './components/ui/SelectionButton';
import ResultCard from './components/ui/ResultCard';
import { calculateFinancialAutopsy, calculateMonthlySavings, calculateSavingsPercentage } from '../lib/calculations';

export default function Home() {
  // Estados principales de la calculadora
  const [kmsAnuales, setKmsAnuales] = useState(20000);
  const [aniosFinanciacion, setAniosFinanciacion] = useState(5);
  const [precioCoche, setPrecioCoche] = useState(25000);
  const [tipoCombustible, setTipoCombustible] = useState('gasolina');
  
  // Estado para almacenar los resultados del cálculo
  const [results, setResults] = useState({ 
    totalOwnershipCost: 0, 
    rentingCost: 0,
    breakdown: {
      financiero: 0,
      depreciacion: 0,
      seguro: 0,
      mantenimiento: 0,
      neumaticos: 0,
      impuestos: 0,
      imprevistos: 0,
    }
  });

  // Función de cálculo principal usando la lógica centralizada
  const calculateOwnershipCost = (kms: number, anios: number, precio: number, combustible: string) => {
    // Usar la función centralizada de cálculos
    const calculationResults = calculateFinancialAutopsy({
      precioCoche: precio,
      aniosFinanciacion: anios,
      kmsAnuales: kms
    });
    
    // Actualizar el estado con los resultados detallados
    setResults(calculationResults);
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

        {/* Sección de Comparativa Financiera */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Comparativa Financiera Mensual
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tarjeta de Coste en Propiedad */}
            <ResultCard
              title="Coste en Propiedad"
              monthlyCost={results.totalOwnershipCost}
              isFeatured={false}
            >
              <h4 className="font-semibold mb-2 text-gray-700">Desglose mensual estimado:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>💸 Financiación e Intereses</span>
                  <strong>{results.breakdown.financiero.toFixed(0)} €</strong>
                </li>
                <li className="flex justify-between">
                  <span>📉 Depreciación (coste oculto)</span>
                  <strong>{results.breakdown.depreciacion.toFixed(0)} €</strong>
                </li>
                <li className="flex justify-between">
                  <span>🛡️ Seguro y Tasas</span>
                  <strong>{(results.breakdown.seguro + results.breakdown.impuestos).toFixed(0)} €</strong>
                </li>
                <li className="flex justify-between">
                  <span>🔧 Mantenimiento y Neumáticos</span>
                  <strong>{(results.breakdown.mantenimiento + results.breakdown.neumaticos).toFixed(0)} €</strong>
                </li>
                <li className="flex justify-between border-t pt-2 mt-2 border-dashed">
                  <span>🚨 Fondo para Imprevistos</span>
                  <strong>{results.breakdown.imprevistos.toFixed(0)} €</strong>
                </li>
              </ul>
            </ResultCard>

            {/* Tarjeta de Renting HEYrenting */}
            <ResultCard
              title="Renting HEYrenting"
              monthlyCost={results.rentingCost}
              isFeatured={true}
            >
              <h4 className="font-semibold mb-2">Todo Incluido:</h4>
              <ul className="space-y-1">
                <li>• Vehículo nuevo siempre</li>
                <li>• Seguro a todo riesgo</li>
                <li>• Mantenimiento completo</li>
                <li>• ITV y revisiones</li>
                <li>• Asistencia en carretera</li>
                <li>• Sin sorpresas ni costes extra</li>
              </ul>
            </ResultCard>
          </div>

          {/* Resumen de ahorro */}
          {results.rentingCost < results.totalOwnershipCost && (
            <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-green-500 text-2xl">💰</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-green-800">
                    ¡Ahorra con HEYrenting!
                  </h3>
                  <p className="text-green-700">
                    Con renting ahorras <strong>{calculateMonthlySavings(results.totalOwnershipCost, results.rentingCost)} €/mes</strong> 
                    ({calculateSavingsPercentage(results.totalOwnershipCost, results.rentingCost)}% menos)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer informativo */}
        <div className="text-center mt-8 text-gray-600">
          <p>Calculadora creada por HEYrenting</p>
        </div>
      </div>
    </div>
  );
}
