'use client';

import { useState, useEffect, useCallback } from 'react';
import ResultCard from './components/ui/ResultCard';
import Step1_Welcome from './components/Step1_Welcome';
import Step2a_CarSelection from './components/Step2a_CarSelection';
import Step2b_Discovery from './components/Step2b_Discovery';
import Step3_DriverProfile from './components/Step3_DriverProfile';
import Step4_FinancialProfile from './components/Step4_FinancialProfile';
import Step5_PriceResults from './components/Step5_PriceResults';
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
    lugarAparcamiento: '', // 'garaje', 'calle'
    filosofiaMantenimiento: '', // 'rajatabla', 'cuando_pide', 'equilibrio'
    anosSinParte: '', // 'novel', '1-5', '5+'
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
  const [scrapingState, setScrapingState] = useState<{
    isScraping: boolean;
    progress: number;
    currentStep: string;
    error: string | null;
    completed: boolean;
    precioNuevo?: number | null;
    precioSegundaMano?: number | null;
    precioKm0?: number | null;
  }>({
    isScraping: false,
    progress: 0,
    currentStep: '',
    error: null,
    completed: false,
  });

  // Función para actualizar el formData de forma segura
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // useEffect para guardar precios cuando el scraping proporcione datos
  useEffect(() => {
    // Guardar precios tan pronto como estén disponibles (no esperar a completed)
    if (scrapingState.precioNuevo !== undefined || 
        scrapingState.precioSegundaMano !== undefined || 
        scrapingState.precioKm0 !== undefined) {
      
      // Solo actualizar si al menos uno de los precios es diferente de null
      if (scrapingState.precioNuevo !== null || 
          scrapingState.precioSegundaMano !== null || 
          scrapingState.precioKm0 !== null) {
        updateFormData({
          precioNuevo: scrapingState.precioNuevo ?? formData.precioNuevo,
          precioSegundaMano: scrapingState.precioSegundaMano ?? formData.precioSegundaMano,
          precioKm0: scrapingState.precioKm0 ?? formData.precioKm0,
        });
      }
    }
  }, [scrapingState.precioNuevo, scrapingState.precioSegundaMano, scrapingState.precioKm0]);

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

        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <img 
            src="/heycalculator-logo.png" 
            alt="HEYcalculator Logo" 
            className="h-12 sm:h-16 w-auto"
          />
        </div>

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
            <>
              {/* Mostrar animación de scraping si está activo */}
              {scrapingState.isScraping && (
                <div className="mb-8">
                  <PriceScrapingProgress
                    isScraping={scrapingState.isScraping}
                    progress={scrapingState.progress}
                    currentStep={scrapingState.currentStep}
                    error={scrapingState.error}
                    completed={scrapingState.completed}
                  />
                </div>
              )}

              {/* Mostrar resultados de precios */}
              {!scrapingState.isScraping && (
                <Step5_PriceResults
                  formData={formData}
                  onPreviousStep={() => {
                    setIsNavigatingBack(true);
                    setStep(4);
                  }}
                />
              )}
            </>
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
