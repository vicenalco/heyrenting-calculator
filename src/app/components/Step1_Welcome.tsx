'use client';

import Icon from './Icon';

interface Step1_WelcomeProps {
  onSelectPath: (path: 'knowsCar' | 'inspireMe') => void;
}

export default function Step1_Welcome({ onSelectPath }: Step1_WelcomeProps) {
  return (
    <div className="text-center">
      <div className="mb-10 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          <Icon name="car" className="w-8 h-8 mr-3 text-green-600 inline-block" />¡Bienvenido a la Calculadora de Gastos Reales!
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
          Descubre cuánto cuesta realmente tener un coche en España
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
        <div
          className="group bg-white rounded-xl shadow-lg p-8 sm:p-10 border-2 border-[#52bf31] transition-all duration-150 cursor-pointer hover:bg-[#52bf31] active:bg-[#52bf31] hover:shadow-xl active:shadow-inner active:translate-y-0.5 flex-1 min-h-[200px] flex flex-col justify-center"
          onClick={() => onSelectPath('knowsCar')}
        >
          <div className="text-4xl mb-6">
            <Icon name="bullseye" className="w-16 h-16 text-green-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 group-hover:text-white group-active:text-white leading-tight">
            Ya sé qué coche quiero
          </h3>
          {/*
          <p className="text-gray-600 group-hover:text-white group-active:text-white">
            Tengo claro el modelo y quiero calcular todos los gastos reales (compra, financiación, mantenimiento, etc.)
          </p>
          */}
        </div>

        <div
          className="group bg-white rounded-xl shadow-lg p-8 sm:p-10 border-2 border-[#52bf31] transition-all duration-150 cursor-pointer hover:bg-[#52bf31] active:bg-[#52bf31] hover:shadow-xl active:shadow-inner active:translate-y-0.5 flex-1 min-h-[200px] flex flex-col justify-center"
          onClick={() => onSelectPath('inspireMe')}
        >
          <div className="text-4xl mb-6">
            <Icon name="lightbulb" className="w-16 h-16 text-yellow-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 group-hover:text-white group-active:text-white leading-tight">
            Quiero que me ayudes a elegir
          </h3>
          {/*
          <p className="text-gray-600 group-hover:text-white group-active:text-white">
            No tengo claro qué coche necesito, ayúdame a encontrar la mejor opción para mi presupuesto
          </p>*/}
        </div>
      </div>
    </div>
  );
}
