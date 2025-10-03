'use client';

import Icon from './Icon';

interface Step1_WelcomeProps {
  onSelectPath: (path: 'knowsCar' | 'inspireMe') => void;
}

export default function Step1_Welcome({ onSelectPath }: Step1_WelcomeProps) {
  return (
    <div className="text-center max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
          ¡Bienvenido a la Calculadora de Gastos Reales!
        </h1>
        <p className="text-lg text-gray-500">
          Descubre cuánto cuesta realmente tener un coche en España
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div
          className="group bg-white rounded-2xl shadow-sm p-8 flex-1 cursor-pointer border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => onSelectPath('knowsCar')}
        >
          <div className="mb-6">
            <Icon name="bullseye" className="w-16 h-16 text-green-500 mx-auto transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ya sé qué coche quiero
          </h3>
          {/*
          <p className="text-gray-600 group-hover:text-white group-active:text-white">
            Tengo claro el modelo y quiero calcular todos los gastos reales (compra, financiación, mantenimiento, etc.)
          </p>
          */}
        </div>

        <div
          className="group bg-white rounded-2xl shadow-sm p-8 flex-1 cursor-pointer border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => onSelectPath('inspireMe')}
        >
          <div className="mb-6">
            <Icon name="magnifyingGlass" className="w-16 h-16 text-yellow-500 mx-auto transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
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
