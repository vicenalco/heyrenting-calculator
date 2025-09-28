'use client';

interface Step1_WelcomeProps {
  onSelectPath: (path: 'knowsCar' | 'inspireMe') => void;
}

export default function Step1_Welcome({ onSelectPath }: Step1_WelcomeProps) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Bienvenido a la Calculadora de Gastos Reales! 🚗
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Descubre cuánto cuesta realmente tener un coche en España
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-green-300 transition-all duration-200 cursor-pointer"
             onClick={() => onSelectPath('knowsCar')}>
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Ya sé qué coche quiero
          </h3>
          <p className="text-gray-600">
            Tengo claro el modelo y quiero calcular todos los gastos reales (compra, financiación, mantenimiento, etc.)
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-green-300 transition-all duration-200 cursor-pointer"
             onClick={() => onSelectPath('inspireMe')}>
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            Quiero que me ayudes a elegir
          </h3>
          <p className="text-gray-600">
            No tengo claro qué coche necesito, ayúdame a encontrar la mejor opción para mi presupuesto
          </p>
        </div>
      </div>
    </div>
  );
}
