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
}

export default function Step4_FinancialProfile({ formData, onUpdate, onNext, onPreviousStep, onNextStep }: Step4_FinancialProfileProps) {
  const [showSecondQuestion, setShowSecondQuestion] = useState(false);

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
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          💰 Análisis Financiero y de Honestidad
        </h2>
        <p className="text-gray-600">
          Evaluemos tu situación financiera para darte el mejor consejo
        </p>
      </div>

      {/* Pregunta 1: Plan de pago */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            💳 ¿Respecto al pago del coche, ¿cuál es tu plan?
          </h3>
          <p className="text-gray-600">Selecciona la opción que mejor se adapte a tu situación</p>
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
              <div className="text-4xl mb-3">💰</div>
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
              <div className="text-4xl mb-3">💸</div>
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

      {/* Pregunta 2: Condicional - Solo si se elige "Al contado" */}
      {showSecondQuestion && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ⚠️ ¿Ese desembolso supondría utilizar más del 30% de tus ahorros e inversiones líquidas?
            </h3>
            <p className="text-gray-600">Esta información nos ayuda a evaluar el impacto en tu patrimonio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => onUpdate({ desembolso30PorCiento: 'no' })}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.desembolso30PorCiento === 'no'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">✅</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">No, tengo un colchón financiero cómodo</h4>
                <p className="text-sm text-gray-600">
                  El desembolso no afectaría significativamente mis ahorros
                </p>
              </div>
            </div>

            <div
              onClick={() => onUpdate({ desembolso30PorCiento: 'si' })}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.desembolso30PorCiento === 'si'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">⚠️</div>
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
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            📊 ¿Qué porcentaje de tus ingresos mensuales netos representaría la cuota de la financiación?
          </h3>
          <p className="text-gray-600">
            {formData.planPago === 'contado' 
              ? 'O el coste mensual total que estamos calculando' 
              : 'O el coste mensual total que estamos calculando'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onUpdate({ porcentajeIngresos: 'menos_15' })}
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
            onClick={() => onUpdate({ porcentajeIngresos: '15_25' })}
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
            onClick={() => onUpdate({ porcentajeIngresos: 'mas_25' })}
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

      {/* Resumen del perfil financiero */}
      {isComplete && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border-2 border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            <span className="mr-2">💡</span>Análisis Financiero Completado
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

      {/* Botón de siguiente */}
      <div className="text-center">
        <button 
          onClick={onNext}
          disabled={!isComplete}
          className={`font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg ${
            isComplete
              ? 'text-white hover:opacity-90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          style={isComplete ? { backgroundColor: '#52bf31' } : {}}
        >
          {isComplete ? 'Ver Resultados del Análisis →' : 'Responde todas las preguntas para continuar'}
        </button>
      </div>

      {/* Botones de navegación adicionales */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPreviousStep}
          disabled={!onPreviousStep}
          className="flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="mr-2">←</span>
          Paso 3
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Navegación rápida</div>
          <div className="text-xs text-gray-400">Usa los botones para saltar entre pasos</div>
        </div>

        <button
          onClick={onNextStep}
          disabled={!onNextStep}
          className="flex items-center px-6 py-3 text-base font-medium text-white bg-green-600 border-2 border-green-600 rounded-lg hover:bg-green-700 hover:border-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ver Resultados
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}
