'use client';

import { useState } from 'react';

interface Step4_FinancialProfileProps {
  formData: {
    planPago: string;
    desembolso30PorCiento: string;
    porcentajeIngresos: string;
  };
  onUpdate: (updates: Partial<Step4_FinancialProfileProps['formData']>) => void;
  onNext: () => void;
  onPreviousStep?: () => void;
  onNextStep?: () => void;
  isCurrentStepComplete?: boolean;
}

export default function Step4_FinancialProfile({ formData, onUpdate, onNext, onPreviousStep, onNextStep, isCurrentStepComplete = false }: Step4_FinancialProfileProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showSecondQuestion, setShowSecondQuestion] = useState(formData.planPago === 'contado');

  // Verificar si todas las preguntas han sido respondidas
  const isComplete = formData.planPago && 
                   formData.porcentajeIngresos && 
                   (formData.planPago !== 'contado' || formData.desembolso30PorCiento);

  // Manejar la selección del plan de pago
  const handlePlanPago = (plan: string) => {
    onUpdate({ planPago: plan });
    if (plan === 'contado') {
      setShowSecondQuestion(true);
    } else {
      setShowSecondQuestion(false);
      onUpdate({ desembolso30PorCiento: '' }); // Limpiar la respuesta condicional
    }
    setTimeout(() => {
      setCurrentQuestion(2);
      // Scroll automático al top de la página después del cambio
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 100);
    }, 300);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const totalQuestions = showSecondQuestion ? 3 : 2;

  return (
    <div className="space-y-8">
       {/* Indicador de progreso */}
       <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {[1, 2, 3].map((questionNumber) => {
            if (!showSecondQuestion && questionNumber === 3) return null;
            return (
              <div
                key={questionNumber}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  questionNumber <= currentQuestion ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Pregunta 1: Plan de pago */}
      {currentQuestion === 1 && (
        <div className="space-y-6" data-question="1">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
              ¿Cuál es tu plan para pagar el coche?
            </h2>
            <p className="text-lg text-gray-600">Selecciona la opción que mejor se adapte a tu situación</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => handlePlanPago('contado')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.planPago === 'contado'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">
                  <i className="fa-solid fa-coins text-green-500"></i>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Pagarlo al contado</h4>
                <p className="text-sm text-gray-600">
                  Tengo el dinero disponible para pagar el vehículo completo
                </p>
              </div>
            </div>

            <div
              onClick={() => handlePlanPago('entrada_financiar')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.planPago === 'entrada_financiar'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">
                  <i className="fa-solid fa-money-bill-wave text-blue-500"></i>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Dar una entrada y financiar el resto</h4>
                <p className="text-sm text-gray-600">
                  Pagar una parte inicial y financiar el resto del importe
                </p>
              </div>
            </div>

            <div
              onClick={() => handlePlanPago('financiar_100')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.planPago === 'financiar_100'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">📄</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Financiarlo al 100% sin entrada</h4>
                <p className="text-sm text-gray-600">
                  Financiar todo el importe del vehículo sin entrada inicial
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pregunta 2: Condicional - Solo si se elige "Al contado" */}
      {currentQuestion === 2 && showSecondQuestion && (
        <div className="space-y-6" data-question="2">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
              ¿Pagar al contado supondría usar más del 30% de tus ahorros?
            </h2>
            <p className="text-lg text-gray-600">Esta información nos ayuda a evaluar el impacto en tu patrimonio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => {
                onUpdate({ desembolso30PorCiento: 'no' });
                setTimeout(() => {
                  setCurrentQuestion(3);
                  // Scroll automático al top de la página después del cambio
                  setTimeout(() => {
                    window.scrollTo({ 
                      top: 0, 
                      behavior: 'smooth' 
                    });
                  }, 100);
                }, 300);
              }}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.desembolso30PorCiento === 'no'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">
                  <i className="fa-solid fa-check text-green-500"></i>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">No, tengo un colchón financiero cómodo</h4>
                <p className="text-sm text-gray-600">
                  El desembolso no afectaría significativamente mis ahorros
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                onUpdate({ desembolso30PorCiento: 'si' });
                setTimeout(() => {
                  setCurrentQuestion(3);
                  // Scroll automático al top de la página después del cambio
                  setTimeout(() => {
                    window.scrollTo({ 
                      top: 0, 
                      behavior: 'smooth' 
                    });
                  }, 100);
                }, 300);
              }}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.desembolso30PorCiento === 'si'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">
                  <i className="fa-solid fa-exclamation-triangle text-yellow-500"></i>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Sí, sería un desembolso importante para mí</h4>
                <p className="text-sm text-gray-600">
                  El desembolso representaría una parte significativa de mis ahorros
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pregunta 3: Porcentaje de ingresos */}
      {((currentQuestion === 2 && !showSecondQuestion) || (currentQuestion === 3 && showSecondQuestion)) && (
        <div className="space-y-6" data-question="3">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
              ¿Qué porcentaje de tus ingresos mensuales se llevaría el coche?
            </h2>
            <p className="text-lg text-gray-600">
              Considerando el coste mensual total que estamos calculando.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => {
                onUpdate({ porcentajeIngresos: 'menos_15' });
                setTimeout(() => onNext(), 500);
              }}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.porcentajeIngresos === 'menos_15'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🟢</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Menos del 15%</h4>
                <p className="text-xs text-gray-500 mt-2">
                  Una proporción muy cómoda que no afecta tu capacidad de ahorro
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                onUpdate({ porcentajeIngresos: '15_25' });
                setTimeout(() => onNext(), 500);
              }}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.porcentajeIngresos === '15_25'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🟡</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Entre el 15% y el 25%</h4>
                <p className="text-xs text-gray-500 mt-2">
                  Una proporción razonable, pero requiere planificación financiera
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                onUpdate({ porcentajeIngresos: 'mas_25' });
                setTimeout(() => onNext(), 500);
              }}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.porcentajeIngresos === 'mas_25'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🔴</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Más del 25%</h4>
                <p className="text-xs text-gray-500 mt-2">
                  Una proporción alta que puede comprometer tu estabilidad financiera
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen del perfil financiero */}
      {isComplete && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border-2 border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            <span className="mr-2">
              <i className="fa-solid fa-lightbulb text-yellow-500"></i>
            </span>Análisis Financiero Completado
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>Plan de pago:</strong> {
                formData.planPago === 'contado' ? 'Al contado' :
                formData.planPago === 'entrada_financiar' ? 'Entrada + Financiación' :
                'Financiación 100%'
              }
            </div>
            {formData.planPago === 'contado' && formData.desembolso30PorCiento && (
              <div>
                <strong>Impacto en ahorros:</strong> {
                  formData.desembolso30PorCiento === 'no' ? 'Bajo impacto' : 'Alto impacto'
                }
              </div>
            )}
            <div>
              <strong>Proporción de ingresos:</strong> {
                formData.porcentajeIngresos === 'menos_15' ? 'Menos del 15%' :
                formData.porcentajeIngresos === '15_25' ? '15-25%' :
                'Más del 25%'
              }
            </div>
          </div>
        </div>
      )}

      {/* Navegación interna */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mt-8">
        <div className="text-center mb-4 sm:hidden">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200">
            <span className="text-sm text-gray-500">Pregunta</span>
            <span className="text-base font-semibold text-gray-700 ml-2">{currentQuestion} de {totalQuestions}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
          <button 
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 1}
            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] order-2 sm:order-1"
          >
            <span className="mr-2">←</span>
            Anterior
          </button>
          <div className="hidden sm:flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 sm:order-2">
            <span className="text-sm text-gray-500">Pregunta</span>
            <span className="text-base font-semibold text-gray-700 ml-2">{currentQuestion} de {totalQuestions}</span>
          </div>
          <div className="min-h-[48px] order-1 sm:order-3" />
        </div>
      </div>

      {/* Botones de navegación adicionales */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <div className="text-center mb-6 sm:hidden">
          <div className="text-sm font-medium text-gray-600 mb-2">Navegación rápida</div>
          <div className="text-xs text-gray-500">Usa los botones para saltar entre pasos</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <button
            onClick={onPreviousStep}
            disabled={!onPreviousStep}
            className="flex items-center justify-center px-6 py-4 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            <span className="mr-2">←</span>
            Paso 3
          </button>
          <div className="hidden sm:block text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">Navegación rápida</div>
            <div className="text-xs text-gray-500">Usa los botones para saltar entre pasos</div>
          </div>
          <button
            onClick={onNextStep}
            disabled={!onNextStep || !isCurrentStepComplete}
            className="flex items-center justify-center px-6 py-4 text-base font-medium text-green-600 bg-white border-2 border-green-600 rounded-lg hover:bg-green-50 hover:border-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            Ver Resultados
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
