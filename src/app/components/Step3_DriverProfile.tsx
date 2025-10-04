'use client';

import { useState } from 'react';

interface Step3_DriverProfileProps {
  formData: {
    habitatVehiculo: string[];
    temperamentoVolante1: string;
    temperamentoVolante2: string;
    misionVehiculo: string;
    lugarAparcamiento: string;
    filosofiaMantenimiento: string;
    anosSinParte: string;
  };
  onUpdate: (updates: Partial<Step3_DriverProfileProps['formData']>) => void;
  onNext: () => void;
  onPreviousStep?: () => void;
  onNextStep?: () => void;
  isCurrentStepComplete?: boolean;
}

export default function Step3_DriverProfile({ formData, onUpdate, onNext, onPreviousStep, onNextStep, isCurrentStepComplete = false }: Step3_DriverProfileProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1);

  // Verificar si todas las preguntas han sido respondidas
  const isComplete = formData.habitatVehiculo && formData.habitatVehiculo.length > 0 && 
                   formData.temperamentoVolante1 && 
                   formData.temperamentoVolante2 && 
                   formData.misionVehiculo &&
                   formData.lugarAparcamiento &&
                   formData.filosofiaMantenimiento &&
                   formData.anosSinParte;

  // Función para avanzar a la siguiente pregunta
  const handleNextQuestion = () => {
    if (currentQuestion < 7) {
      setCurrentQuestion(currentQuestion + 1);
      // Scroll automático al top de la página después del cambio
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 100);
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
      {/* Indicador de progreso */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5, 6, 7].map((questionNumber) => (
            <div
              key={questionNumber}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                questionNumber <= currentQuestion ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Pregunta 1: El Hábitat del Vehículo */}
      {currentQuestion === 1 && (
        <div className="space-y-6" data-question="1">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
              ¿Cómo usarás principalmente el coche?
            </h2>
            <p className="text-lg text-gray-600">Selecciona el tipo de conducción que harás más a menudo</p>
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
                <div className="text-4xl mb-3">
                  <i className="fa-solid fa-city text-blue-500"></i>
                </div>
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
                <div className="text-4xl mb-3">
                  <i className="fa-solid fa-road text-green-500"></i>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Autovía y Carretera</h4>
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
                <div className="text-4xl mb-3">
                  <i className="fa-solid fa-mountain text-orange-500"></i>
                </div>
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
        <div className="space-y-6" data-question="2">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
              ¿Cómo conduces en los semáforos?
            </h2>
            <p className="text-lg text-gray-600">Selecciona la opción que mejor describe tu comportamiento</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Cuando el semáforo se pone en verde, tú...
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => {
                  onUpdate({ temperamentoVolante1: 'calmado' });
                  setTimeout(() => handleNextQuestion(), 500);
                }}
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
                onClick={() => {
                  onUpdate({ temperamentoVolante1: 'agresivo' });
                  setTimeout(() => handleNextQuestion(), 500);
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.temperamentoVolante1 === 'agresivo'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    <i className="fa-solid fa-car text-red-500"></i>
                  </div>
                  <p className="text-sm text-gray-700">Buscas ser el primero, con una aceleración decidida.</p>
                </div>
              </div>

              <div
                onClick={() => {
                  onUpdate({ temperamentoVolante1: 'normal' });
                  setTimeout(() => handleNextQuestion(), 500);
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.temperamentoVolante1 === 'normal'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    <i className="fa-solid fa-balance-scale text-blue-500"></i>
                  </div>
                  <p className="text-sm text-gray-700">Te adaptas al tráfico, un ritmo normal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pregunta 3: Temperamento al Volante - Pregunta 2 */}
      {currentQuestion === 3 && (
        <div className="space-y-6" data-question="3">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
              ¿Cómo conduces en las curvas?
            </h2>
            <p className="text-lg text-gray-600">Selecciona la opción que mejor describe tu estilo</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              En una carretera con curvas, tu enfoque es...
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => {
                  onUpdate({ temperamentoVolante2: 'fluido' });
                  setTimeout(() => handleNextQuestion(), 500);
                }}
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
                onClick={() => {
                  onUpdate({ temperamentoVolante2: 'deportivo' });
                  setTimeout(() => handleNextQuestion(), 500);
                }}
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
                onClick={() => {
                  onUpdate({ temperamentoVolante2: 'tranquilo' });
                  setTimeout(() => handleNextQuestion(), 500);
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.temperamentoVolante2 === 'tranquilo'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    <i className="fa-solid fa-car text-green-500"></i>
                  </div>
                  <p className="text-sm text-gray-700">Un ritmo normal, disfrutando del paisaje.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pregunta 4: La Misión del Vehículo */}
      {currentQuestion === 4 && (
        <div className="space-y-6" data-question="4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
            ¿Cuál es la carga habitual del coche?
            </h2>
            <p className="text-lg text-gray-600">Selecciona la opción que mejor describe el uso del vehículo</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Normalmente, el coche va...
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => {
                  onUpdate({ misionVehiculo: 'ligero' });
                  setTimeout(() => onNext(), 500);
                }}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.misionVehiculo === 'ligero'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">👤</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Casi vacío</h4>
                  <p className="text-sm text-gray-600">
                  Voy solo o con un pasajero la mayor parte del tiempo.
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  onUpdate({ misionVehiculo: 'cargado' });
                  setTimeout(() => onNext(), 500);
                }}
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
                onClick={() => {
                  onUpdate({ misionVehiculo: 'mixto_carga' });
                  setTimeout(() => onNext(), 500);
                }}
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

      {/* Pregunta 5: Lugar de Aparcamiento */}
      {currentQuestion === 5 && (
        <div className="space-y-6" data-question="5">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
              ¿Dónde aparcas habitualmente?
            </h2>
            <p className="text-lg text-gray-600">El lugar donde descansa tu coche influye en su seguro y conservación.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => {
                onUpdate({ lugarAparcamiento: 'garaje' });
                setTimeout(() => handleNextQuestion(), 500);
              }}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.lugarAparcamiento === 'garaje'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🏠</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">En un garaje privado o comunitario</h4>
                <p className="text-sm text-gray-600">
                  Protegido del clima y más seguro.
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                onUpdate({ lugarAparcamiento: 'calle' });
                setTimeout(() => handleNextQuestion(), 500);
              }}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.lugarAparcamiento === 'calle'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🅿️</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">En la calle</h4>
                <p className="text-sm text-gray-600">
                  Aparcamiento público o en la vía.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pregunta 6: Filosofía de Mantenimiento */}
      {currentQuestion === 6 && (
        <div className="space-y-6" data-question="6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
              ¿Cuál es tu filosofía de mantenimiento?
            </h2>
            <p className="text-lg text-gray-600">Tu enfoque hacia el cuidado del coche nos dice mucho sobre su fiabilidad futura.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => {
                  onUpdate({ filosofiaMantenimiento: 'rajatabla' });
                  setTimeout(() => handleNextQuestion(), 500);
                }}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.filosofiaMantenimiento === 'rajatabla'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">A rajatabla</h4>
                  <p className="text-sm text-gray-600">
                    Sigo el libro de mantenimiento oficial sin saltarme una sola revisión.
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  onUpdate({ filosofiaMantenimiento: 'cuando_pide' });
                  setTimeout(() => handleNextQuestion(), 500);
                }}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.filosofiaMantenimiento === 'cuando_pide'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">🔧</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Cuando &quot;pide algo&quot;</h4>
                  <p className="text-sm text-gray-600">
                    Voy al taller cuando oigo un ruido raro o toca la ITV.
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  onUpdate({ filosofiaMantenimiento: 'equilibrio' });
                  setTimeout(() => handleNextQuestion(), 500);
                }}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  formData.filosofiaMantenimiento === 'equilibrio'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">⚖️</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Buscando el equilibrio</h4>
                  <p className="text-sm text-gray-600">
                    Hago las revisiones importantes, pero puedo estirar los plazos si el coche va bien.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pregunta 7: Años sin Parte */}
      {currentQuestion === 7 && (
        <div className="space-y-6" data-question="7">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
              ¿Cuántos años llevas sin dar un parte con culpa?
            </h2>
            <p className="text-lg text-gray-600">Esta información nos ayuda a calcular tu prima de seguro.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => {
                onUpdate({ anosSinParte: 'novel' });
                setTimeout(() => onNext(), 500);
              }}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.anosSinParte === 'novel'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🆕</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Soy un conductor novel / He dado un parte en el último año</h4>
                <p className="text-sm text-gray-600">
                  Sin experiencia o con siniestros recientes.
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                onUpdate({ anosSinParte: '1-5' });
                setTimeout(() => onNext(), 500);
              }}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.anosSinParte === '1-5'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">📅</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Entre 1 y 5 años</h4>
                <p className="text-sm text-gray-600">
                  Conducción responsable con algunos años de experiencia.
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                onUpdate({ anosSinParte: '5+' });
                setTimeout(() => onNext(), 500);
              }}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                formData.anosSinParte === '5+'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-green-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Más de 5 años (Bonificación máxima)</h4>
                <p className="text-sm text-gray-600">
                  Conductor experimentado sin siniestros.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen del perfil */}
      {isComplete && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            <span className="mr-2">
              <i className="fa-solid fa-check text-green-500"></i>
            </span>Perfil completado
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

      {/* Navegación interna - Diseño mejorado */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mt-8">
        {/* Contador de preguntas móvil - solo visible en móvil */}
        <div className="text-center mb-4 sm:hidden">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200">
            <span className="text-sm text-gray-500">Pregunta</span>
            <span className="text-base font-semibold text-gray-700 ml-2">{currentQuestion} de 7</span>
          </div>
        </div>

        {/* Botones de navegación - responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
          <button 
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 1}
            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] order-2 sm:order-1"
          >
            <span className="mr-2">←</span>
            Anterior
          </button>

          {/* Contador de preguntas desktop - solo visible en desktop */}
          <div className="hidden sm:flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 sm:order-2">
            <span className="text-sm text-gray-500">Pregunta</span>
            <span className="text-base font-semibold text-gray-700 ml-2">{currentQuestion} de 7</span>
          </div>

          {currentQuestion < 7 ? (
            <button 
              onClick={handleNextQuestion}
              disabled={
                (currentQuestion === 1 && (!formData.habitatVehiculo || formData.habitatVehiculo.length === 0)) ||
                (currentQuestion === 2 && !formData.temperamentoVolante1) ||
                (currentQuestion === 3 && !formData.temperamentoVolante2) ||
                (currentQuestion === 4 && !formData.misionVehiculo) ||
                (currentQuestion === 5 && !formData.lugarAparcamiento) ||
                (currentQuestion === 6 && !formData.filosofiaMantenimiento)
              }
              className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] order-1 sm:order-3"
            >
              Siguiente
              <span className="ml-2">→</span>
            </button>
          ) : (
            <div className="min-h-[48px] order-1 sm:order-3" />
          )}
        </div>
      </div>

      {/* Botones de navegación adicionales */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        {/* Texto móvil - solo visible en móvil */}
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
            Paso 2
          </button>

          {/* Texto desktop - solo visible en desktop */}
          <div className="hidden sm:block text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">Navegación rápida</div>
            <div className="text-xs text-gray-500">Usa los botones para saltar entre pasos</div>
          </div>

          <button
            onClick={onNextStep}
            disabled={!onNextStep || !isCurrentStepComplete}
            className="flex items-center justify-center px-6 py-4 text-base font-medium text-green-600 bg-white border-2 border-green-600 rounded-lg hover:bg-green-50 hover:border-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px]"
          >
            Paso 4
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}