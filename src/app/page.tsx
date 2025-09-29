'use client';

import { useState, useEffect, useCallback } from 'react';
import ResultCard from './components/ui/ResultCard';
import Step1_Welcome from './components/Step1_Welcome';
import Step2a_CarSelection from './components/Step2a_CarSelection';
import Step2b_Discovery from './components/Step2b_Discovery';
import { calculateFinancialAutopsy } from '../lib/calculations';

export default function Home() {
  // Estado para controlar el paso actual del wizard
  const [step, setStep] = useState(1);
  
  // Estado unificado para todos los datos del formulario
  const [formData, setFormData] = useState({
    userPath: '', // 'knowsCar' o 'inspireMe'
    carBrand: '',
    carModel: '',
    carVersion: '',
    kmsAnuales: 20000,
    aniosFinanciacion: 5,
    precioCoche: 25000,
    tipoCombustible: 'gasolina',
    codigoPostal: '',
    // Campos adicionales que podremos necesitar
    nombre: '',
    email: '',
    telefono: '',
    // IDs internos para integraciones (Airtable)
    brandId: '',
    modelId: '',
    // Campos adicionales del paso 5
    usoVehiculo: '',
    estiloConduccion: '',
    frecuenciaUso: '',
    presupuesto: '',
    experiencia: '',
  });
  
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

  // Función para actualizar el formData de forma segura
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Función de cálculo principal usando la lógica centralizada
  const calculateOwnershipCost = useCallback(() => {
    // Usar la función centralizada de cálculos
    const calculationResults = calculateFinancialAutopsy({
      precioCoche: formData.precioCoche,
      aniosFinanciacion: formData.aniosFinanciacion,
      kmsAnuales: formData.kmsAnuales
    });
    
    // Actualizar el estado con los resultados detallados
    setResults(calculationResults);
  }, [formData.precioCoche, formData.aniosFinanciacion, formData.kmsAnuales]);

  // useEffect para recalcular automáticamente cuando cambien los datos del formulario
  useEffect(() => {
    if (formData.precioCoche > 0 && formData.aniosFinanciacion > 0 && formData.kmsAnuales > 0) {
      calculateOwnershipCost();
    }
  }, [calculateOwnershipCost, formData.precioCoche, formData.aniosFinanciacion, formData.kmsAnuales]);

  // Función para manejar la selección de ruta del usuario
  const handlePathSelection = (path: 'knowsCar' | 'inspireMe') => {
    updateFormData({ userPath: path });
    setStep(2);
  };

  // Función para avanzar al siguiente paso
  const handleNext = () => {
    setStep(step + 1);
  };

  // Función para retroceder al paso anterior
  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Función para resetear al inicio (salida de emergencia)
  const handleResetToStart = () => {
    setStep(1);
    setFormData({
      userPath: '',
      carBrand: '',
      carModel: '',
      carVersion: '',
      kmsAnuales: 20000,
      aniosFinanciacion: 5,
      precioCoche: 25000,
      tipoCombustible: 'gasolina',
      codigoPostal: '',
      nombre: '',
      email: '',
      telefono: '',
      brandId: '',
      modelId: '',
      // Campos adicionales del paso 5
      usoVehiculo: '',
      estiloConduccion: '',
      frecuenciaUso: '',
      presupuesto: '',
      experiencia: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header común a todos los pasos */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚗 Calculadora de Gastos Reales
          </h1>
          <p className="text-lg text-gray-600">
            Descubre cuánto cuesta realmente tener un coche en España
          </p>
        </div>

        {/* Contenedor principal del wizard */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Indicador de progreso */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepNumber 
                      ? 'text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`} style={step >= stepNumber ? { backgroundColor: '#52bf31' } : {}}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-gray-200' : 'bg-gray-200'
                    }`} style={step > stepNumber ? { backgroundColor: '#52bf31' } : {}} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Renderizado condicional de pasos */}
          {step === 1 && (
            <Step1_Welcome onSelectPath={handlePathSelection} />
          )}

          {step === 2 && formData.userPath === 'knowsCar' && (
            <Step2a_CarSelection 
              formData={formData} 
              onUpdate={updateFormData} 
              onNext={handleNext}
            />
          )}

          {step === 2 && formData.userPath === 'inspireMe' && (
            <Step2b_Discovery 
              formData={formData} 
              onUpdate={updateFormData} 
              onNext={handleNext}
            />
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Gastos Reales de tu Vehículo 📊
                </h2>
                <p className="text-gray-600">
                  Aquí tienes el desglose completo de todos los costes reales
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tarjeta de Coste Total Real */}
                <ResultCard
                  title="Coste Total Real Mensual"
                  monthlyCost={results.totalOwnershipCost}
                  isFeatured={true}
                >
                  <h4 className="font-semibold mb-2 text-gray-700">Desglose completo de gastos:</h4>
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

                {/* Tarjeta de Alternativas */}
                <ResultCard
                  title="Otras Opciones"
                  monthlyCost={results.rentingCost}
                  isFeatured={false}
                >
                  <h4 className="font-semibold mb-2">Compara con otras opciones:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex justify-between">
                      <span>🚗 Renting (todo incluido)</span>
                      <strong>{results.rentingCost.toFixed(0)} €</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>🛒 Compra de segunda mano</span>
                      <strong>{(results.totalOwnershipCost * 0.7).toFixed(0)} €</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>🆕 Compra de KM0</span>
                      <strong>{(results.totalOwnershipCost * 0.85).toFixed(0)} €</strong>
                    </li>
                    <li className="flex justify-between border-t pt-2 mt-2 border-dashed">
                      <span>💳 Leasing operativo</span>
                      <strong>{(results.rentingCost * 1.1).toFixed(0)} €</strong>
                    </li>
                  </ul>
                </ResultCard>
              </div>

              {/* Resumen informativo */}
              <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: '#f0f9f0', borderLeft: '4px solid #52bf31' }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold" style={{ color: '#2d5a2d' }}>
                      Información Importante
                    </h3>
                    <p style={{ color: '#2d5a2d' }}>
                      Estos cálculos incluyen todos los gastos reales: financiación, depreciación, seguro, mantenimiento, impuestos e imprevistos. 
                      Recuerda que la depreciación es un coste oculto pero real que afecta el valor de tu vehículo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          {step > 1 && (
            <div className="flex justify-between mt-8">
              <div className="flex gap-4">
                <button 
                  onClick={handlePrevious}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  ← Atrás
                </button>
                <button 
                  onClick={handleResetToStart}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  🏠 Inicio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer informativo */}
        <div className="text-center mt-8 text-gray-600">
          <p>Calculadora de gastos reales para vehículos en España</p>
        </div>
      </div>
    </div>
  );
}
