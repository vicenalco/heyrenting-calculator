'use client';

import { useState } from 'react';

interface Step3_DriverProfileProps {
  formData: {
    habitatVehiculo: string[];
    temperamentoVolante1: string;
    temperamentoVolante2: string;
    misionVehiculo: string;
  };
  onUpdate: (updates: Partial<Step3_DriverProfileProps['formData']>) => void;
  onNext: () => void;
  onPreviousStep?: () => void;
  onNextStep?: () => void;
}

export default function Step3_DriverProfile({ formData, onUpdate, onNext, onPreviousStep, onNextStep }: Step3_DriverProfileProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1);

  // Verificar si todas las preguntas han sido respondidas
  const isComplete = formData.habitatVehiculo && formData.habitatVehiculo.length > 0 && 
                   formData.temperamentoVolante1 && 
                   formData.temperamentoVolante2 && 
                   formData.misionVehiculo;

  // Función para avanzar a la siguiente pregunta
  const handleNextQuestion = () => {
    if (currentQuestion < 4) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Función para retroceder a la pregunta anterior
  const handlePreviousQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Función para manejar selección múltiple del hábitat
  const handleHabitatSelection = (habitat: string) => {
    const currentSelection = formData.habitatVehiculo || [];
    let newSelection;
    
    if (currentSelection.includes(habitat)) {
      // Si ya está seleccionado, lo quitamos
      newSelection = currentSelection.filter(h => h !== habitat);
    } else {
      // Si no está seleccionado, lo añadimos
      newSelection = [...currentSelection, habitat];
    }
    
    onUpdate({ habitatVehiculo: newSelection });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🧠 Perfil del Conductor
        </h2>
        <p className="text-gray-600">
          Cuéntanos sobre tu estilo de conducción y uso del vehículo para un diagnóstico más preciso
        </p>
        
        {/* Indicador de progreso */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((questionNumber) => (
              <div
                key={questionNumber}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  questionNumber <= currentQuestion ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pregunta 1: El Hábitat del Vehículo */}
      {currentQuestion === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Cómo usarás principalmente el coche?
            </h3>
            <p className="text-gray-600">Selecciona el tipo de conducción que harás más a menudo</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              <span className="mr-1">✓</span>
              Puedes seleccionar varias opciones
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
            {/* Opción A: Ciudad */}
            <div
              onClick={() => handleHabitatSelection('urbano')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.habitatVehiculo?.includes('urbano')
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🏙️</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Ciudad</h4>
                <p className="text-sm text-gray-600">
                  Principalmente ciudad, con atascos, semáforos frecuentes y trayectos cortos (menos de 15 min).
                </p>
                {formData.habitatVehiculo?.includes('urbano') && (
                  <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    <span className="mr-1">✓</span>
                    Seleccionado
                  </div>
                )}
              </div>
            </div>

            {/* Opción B: Carretera */}
            <div
              onClick={() => handleHabitatSelection('carretera')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.habitatVehiculo?.includes('carretera')
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🛣️</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Carretera</h4>
                <p className="text-sm text-gray-600">
                  Casi todo autovía y carretera, a velocidad de crucero y con pocos cambios de ritmo.
                </p>
                {formData.habitatVehiculo?.includes('carretera') && (
                  <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    <span className="mr-1">✓</span>
                    Seleccionado
                  </div>
                )}
              </div>
            </div>

            {/* Opción C: Rural */}
            <div
              onClick={() => handleHabitatSelection('rural')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg md:col-span-2 md:justify-self-center md:max-w-sm ${
                formData.habitatVehiculo?.includes('rural')
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🏞️</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Rural</h4>
                <p className="text-sm text-gray-600">
                  Carreteras secundarias, a menudo con firmes irregulares, y algún camino ocasional.
                </p>
                {formData.habitatVehiculo?.includes('rural') && (
                  <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    <span className="mr-1">✓</span>
                    Seleccionado
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Pregunta 2: Temperamento al Volante - Pregunta 1 */}
      {currentQuestion === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Cómo conduces en los semáforos?
            </h3>
            <p className="text-gray-600">Selecciona la opción que mejor describe tu comportamiento</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Cuando el semáforo se pone en verde, tú...
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => onUpdate({ temperamentoVolante1: 'calmado' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.temperamentoVolante1 === 'calmado'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🧘</div>
                  <p className="text-sm text-gray-700">Sales con calma, sin prisas. La eficiencia es tu lema.</p>
                </div>
              </div>

              <div
                onClick={() => onUpdate({ temperamentoVolante1: 'agresivo' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.temperamentoVolante1 === 'agresivo'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🏎️</div>
                  <p className="text-sm text-gray-700">Buscas ser el primero, con una aceleración decidida.</p>
                </div>
              </div>

              <div
                onClick={() => onUpdate({ temperamentoVolante1: 'normal' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.temperamentoVolante1 === 'normal'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">⚖️</div>
                  <p className="text-sm text-gray-700">Te adaptas al tráfico, un ritmo normal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pregunta 3: Temperamento al Volante - Pregunta 2 */}
      {currentQuestion === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Cómo conduces en las curvas?
            </h3>
            <p className="text-gray-600">Selecciona la opción que mejor describe tu estilo</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              En una carretera con curvas, tu enfoque es...
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => onUpdate({ temperamentoVolante2: 'fluido' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.temperamentoVolante2 === 'fluido'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🌊</div>
                  <p className="text-sm text-gray-700">Trazar con fluidez, anticipando y frenando suavemente.</p>
                </div>
              </div>

              <div
                onClick={() => onUpdate({ temperamentoVolante2: 'deportivo' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.temperamentoVolante2 === 'deportivo'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <p className="text-sm text-gray-700">Apurar la frenada y tomar las curvas con energía.</p>
                </div>
              </div>

              <div
                onClick={() => onUpdate({ temperamentoVolante2: 'tranquilo' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.temperamentoVolante2 === 'tranquilo'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🚗</div>
                  <p className="text-sm text-gray-700">Un ritmo normal, disfrutando del paisaje.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pregunta 4: La Misión del Vehículo */}
      {currentQuestion === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Cuánta gente suele viajar contigo?
            </h3>
            <p className="text-gray-600">Selecciona la opción que mejor describe el uso del vehículo</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Normalmente, el coche va...
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => onUpdate({ misionVehiculo: 'ligero' })}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.misionVehiculo === 'ligero'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">👤</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Solo o con 1 persona</h4>
                  <p className="text-sm text-gray-600">
                    Voy solo o con un pasajero la mayor parte del tiempo.
                  </p>
                </div>
              </div>

              <div
                onClick={() => onUpdate({ misionVehiculo: 'cargado' })}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.misionVehiculo === 'cargado'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Con familia o amigos</h4>
                  <p className="text-sm text-gray-600">
                    Familia, amigos, equipaje... siempre bien cargado.
                  </p>
                </div>
              </div>

              <div
                onClick={() => onUpdate({ misionVehiculo: 'mixto_carga' })}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.misionVehiculo === 'mixto_carga'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🎒</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Depende del día</h4>
                  <p className="text-sm text-gray-600">
                    Ligero entre semana, cargado en los viajes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen del perfil */}
      {isComplete && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            <span className="mr-2">✅</span>Perfil completado
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>Uso principal:</strong> {
                formData.habitatVehiculo?.map(habitat => {
                  switch(habitat) {
                    case 'urbano': return 'Ciudad';
                    case 'carretera': return 'Carretera';
                    case 'rural': return 'Rural';
                    default: return habitat;
                  }
                }).join(', ') || 'No seleccionado'
              }
            </div>
            <div>
              <strong>Estilo:</strong> {
                formData.temperamentoVolante1 === 'calmado' ? 'Calmado' :
                formData.temperamentoVolante1 === 'agresivo' ? 'Agresivo' :
                'Normal'
              } + {
                formData.temperamentoVolante2 === 'fluido' ? 'Fluido' :
                formData.temperamentoVolante2 === 'deportivo' ? 'Deportivo' :
                'Tranquilo'
              }
            </div>
            <div>
              <strong>Ocupación:</strong> {
                formData.misionVehiculo === 'ligero' ? 'Solo o con 1 persona' :
                formData.misionVehiculo === 'cargado' ? 'Con familia o amigos' :
                'Depende del día'
              }
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <button 
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 1}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
            currentQuestion === 1 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          ← Anterior
        </button>

        <div className="text-sm text-gray-500">
          Pregunta {currentQuestion} de 4
        </div>

        {currentQuestion < 4 ? (
          <button 
            onClick={handleNextQuestion}
            disabled={
              (currentQuestion === 1 && !formData.habitatVehiculo) ||
              (currentQuestion === 2 && !formData.temperamentoVolante1) ||
              (currentQuestion === 3 && !formData.temperamentoVolante2)
            }
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              (currentQuestion === 1 && !formData.habitatVehiculo) ||
              (currentQuestion === 2 && !formData.temperamentoVolante1) ||
              (currentQuestion === 3 && !formData.temperamentoVolante2)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Siguiente →
          </button>
        ) : (
          <button 
            onClick={onNext}
            disabled={!isComplete}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              isComplete
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isComplete ? 'Continuar al Análisis Financiero →' : 'Responde todas las preguntas para continuar'}
          </button>
        )}
      </div>

      {/* Botones de navegación adicionales */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPreviousStep}
          disabled={!onPreviousStep}
          className="flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="mr-2">←</span>
          Paso 2
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
          Paso 4
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}