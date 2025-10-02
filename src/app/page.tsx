'use client';

import { useState, useEffect, useCallback } from 'react';
import ResultCard from './components/ui/ResultCard';
import Step1_Welcome from './components/Step1_Welcome';
import Step2a_CarSelection from './components/Step2a_CarSelection';
import Step2b_Discovery from './components/Step2b_Discovery';
import Step3_DriverProfile from './components/Step3_DriverProfile';
import Step4_FinancialProfile from './components/Step4_FinancialProfile';
import PriceScrapingProgress from './components/PriceScrapingProgress';
import { calculateFinancialAutopsy } from '../lib/calculations';
import Icon from './components/Icon';

export default function Home() {
  // Estado para controlar el paso actual del wizard
  const [step, setStep] = useState(1);
  
  // Estado para controlar si el usuario está modificando datos (no debe avanzar automáticamente)
  const [isModifying, setIsModifying] = useState(false);
  
  // Estado para controlar si el usuario está navegando manualmente hacia atrás
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  
  // Estado unificado para todos los datos del formulario
  const [formData, setFormData] = useState({
    userPath: '', // 'knowsCar' o 'inspireMe'
    carBrand: '',
    carModel: '',
    carVersion: '',
    carYear: [] as number[], // array de años seleccionados
    kmsAnuales: 20000,
    aniosFinanciacion: 5,
    precioCoche: 25000,
    tipoCombustible: 'gasolina',
    codigoPostal: '',
    provincia: '',
    // Campos adicionales que podremos necesitar
    nombre: '',
    email: '',
    telefono: '',
    // IDs internos para integraciones (Airtable)
    brandId: '',
    modelId: '',
    // Campos adicionales del paso 5 (legacy - se mantienen para compatibilidad)
    usoVehiculo: '',
    estiloConduccion: '',
    frecuenciaUso: '',
    presupuesto: '',
    experiencia: '',
    // Nuevos campos para el diagnóstico detallado (Paso 3)
    habitatVehiculo: [] as string[], // ['urbano', 'carretera', 'rural']
    temperamentoVolante1: '', // 'calmado', 'agresivo', 'normal'
    temperamentoVolante2: '', // 'fluido', 'deportivo', 'tranquilo'
    misionVehiculo: '', // 'ligero', 'cargado', 'mixto_carga'
    // Nuevos campos para el perfil financiero (Paso 4)
    planPago: '', // 'contado', 'entrada_financiar', 'financiar_100'
    desembolso30PorCiento: '', // 'si', 'no' (solo si planPago === 'contado')
    porcentajeIngresos: '', // 'menos_15', '15_25', 'mas_25'
    // Precios obtenidos del scraping
    precioNuevo: null as number | null, // Precio de km77
    precioSegundaMano: null as number | null, // Precio de coches.com segunda mano
    precioKm0: null as number | null, // Precio de coches.com km0
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

  // Estado para el scraping de precios
  const [scrapingState, setScrapingState] = useState({
    isScraping: false,
    progress: 0,
    currentStep: '',
    error: null as string | null,
    completed: false,
  });

  // Función para actualizar el formData de forma segura
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Funciones para verificar si cada paso está completo
  const isStep2Complete = formData.carBrand && formData.carModel && formData.carVersion && formData.carYear.length > 0;
  const isStep3Complete = formData.habitatVehiculo && formData.habitatVehiculo.length > 0 && 
                          formData.temperamentoVolante1 && 
                          formData.temperamentoVolante2 && 
                          formData.misionVehiculo;
  const isStep4Complete = formData.planPago && 
                          (formData.planPago !== 'contado' || formData.desembolso30PorCiento) && 
                          formData.porcentajeIngresos;

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

  // useEffect desactivado para navegación automática desde selección de años
  // El usuario debe hacer clic en "Siguiente paso" manualmente después de seleccionar años
  // useEffect(() => {
  //   if (step === 2 && !isModifying && !isNavigatingBack && formData.carBrand && formData.carModel && formData.carVersion && formData.carYear.length > 0) {
  //     const timer = setTimeout(() => {
  //       setStep(3);
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [step, isModifying, isNavigatingBack, formData.carBrand, formData.carModel, formData.carVersion, formData.carYear]);

  // Función para manejar la selección de ruta del usuario
  const handlePathSelection = (path: 'knowsCar' | 'inspireMe') => {
    updateFormData({ userPath: path });
    setStep(2);
  };

  // Función para avanzar al siguiente paso
  const handleNext = () => {
    setIsNavigatingBack(false); // Resetear el flag cuando el usuario avanza manualmente
    setStep(step + 1);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-6 lg:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full pt-6 sm:pt-12">

        {/* Contenedor principal del wizard */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
          {/* Indicador de progreso */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-1 sm:space-x-4">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-base font-semibold ${
                    step >= stepNumber 
                      ? 'text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`} style={step >= stepNumber ? { backgroundColor: '#52bf31' } : {}}>
                    {stepNumber}
                  </div>
                  {stepNumber < 5 && (
                    <div className={`w-3 sm:w-16 h-1 mx-1 sm:mx-2 ${
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
              isModifying={isModifying}
              onFinishModifying={() => {
                setIsModifying(false);
                setIsNavigatingBack(false);
                setStep(3);
              }}
              onScrapingStateChange={setScrapingState}
              onPreviousStep={() => setStep(1)}
              onNextStep={() => {
                setIsNavigatingBack(false);
                setStep(3);
              }}
              isCurrentStepComplete={!!isStep2Complete}
            />
          )}

          {step === 2 && formData.userPath === 'inspireMe' && (
            <Step2b_Discovery 
              formData={formData} 
              onUpdate={updateFormData} 
              onNext={handleNext}
            />
          )}

          {step === 3 && formData.userPath === 'knowsCar' && (
            <Step3_DriverProfile 
              formData={formData} 
              onUpdate={updateFormData} 
              onNext={handleNext}
              onPreviousStep={() => {
                setIsNavigatingBack(true);
                setStep(2);
              }}
              onNextStep={() => {
                setIsNavigatingBack(false);
                setStep(4);
              }}
              isCurrentStepComplete={!!isStep3Complete}
            />
          )}

          {step === 4 && formData.userPath === 'knowsCar' && (
            <Step4_FinancialProfile 
              formData={formData} 
              onUpdate={updateFormData} 
              onNext={handleNext}
              onPreviousStep={() => {
                setIsNavigatingBack(true);
                setStep(3);
              }}
              onNextStep={() => {
                setIsNavigatingBack(false);
                setStep(5);
              }}
            />
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Gastos Reales del Vehículo 📊
                </h2>
                <p className="text-gray-600">
                  Aquí tienes el desglose completo de todos los costes reales
                </p>
              </div>

              {/* Mostrar animación de scraping si está activo */}
              {scrapingState.isScraping && (
                <PriceScrapingProgress
                  isScraping={scrapingState.isScraping}
                  progress={scrapingState.progress}
                  currentStep={scrapingState.currentStep}
                  error={scrapingState.error}
                  completed={scrapingState.completed}
                />
              )}
              
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
                      Recuerda que la depreciación es un coste oculto pero real que afecta el valor del vehículo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de navegación para el paso 5 */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    setIsModifying(true);
                    setIsNavigatingBack(true);
                    setStep(2);
                  }}
                  className="flex items-center justify-center px-6 py-3 text-white bg-gray-600 hover:bg-gray-700 font-semibold rounded-lg transition-colors duration-200"
                >
                  <span className="mr-2">←</span>
                  Modificar Datos
                </button>
                <button 
                  onClick={() => {
                    setStep(1);
                    setFormData({
                      userPath: '',
                      carBrand: '',
                      carModel: '',
                      carVersion: '',
                      carYear: [] as number[],
                      kmsAnuales: 20000,
                      aniosFinanciacion: 5,
                      precioCoche: 25000,
                      tipoCombustible: 'gasolina',
                      codigoPostal: '',
                      provincia: '',
                      nombre: '',
                      email: '',
                      telefono: '',
                      brandId: '',
                      modelId: '',
                      usoVehiculo: '',
                      estiloConduccion: '',
                      frecuenciaUso: '',
                      presupuesto: '',
                      experiencia: '',
                      habitatVehiculo: [],
                      temperamentoVolante1: '',
                      temperamentoVolante2: '',
                      misionVehiculo: '',
                      planPago: '',
                      desembolso30PorCiento: '',
                      porcentajeIngresos: '',
                      precioNuevo: null,
                      precioSegundaMano: null,
                      precioKm0: null,
                    });
                  }}
                  className="flex items-center justify-center px-6 py-3 text-white bg-green-600 hover:bg-green-700 font-semibold rounded-lg transition-colors duration-200"
                >
                  <span className="mr-2">🏠</span>
                  Empezar de Nuevo
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
