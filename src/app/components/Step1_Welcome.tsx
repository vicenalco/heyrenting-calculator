'use client';

import Icon from './Icon';

interface Step1_WelcomeProps {
  onSelectPath: (path: 'knowsCar' | 'inspireMe') => void;
}

export default function Step1_Welcome({ onSelectPath }: Step1_WelcomeProps) {
  return (
    <div className="text-center max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 tracking-tight">
        Descubre el coste oculto del coche que quieres
        </h1>
        <p className="text-lg text-gray-500">
          Descubre cuánto cuesta realmente tener un coche en España
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <div
          className="group bg-white rounded-2xl shadow-lg p-4 md:p-8 flex-1 cursor-pointer border-2 border-gray-300 hover:border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-green-50"
          onClick={() => onSelectPath('knowsCar')}
        >
          <div className="mb-3 md:mb-6">
            <Icon name="bullseye" className="w-10 h-10 md:w-16 md:h-16 text-green-500 mx-auto transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
            Ya sé qué coche quiero
          </h3>
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            <span className="mr-1">→</span>
            Seleccionar
          </div>
          {/*
          <p className="text-gray-600 group-hover:text-white group-active:text-white">
            Tengo claro el modelo y quiero calcular todos los gastos reales (compra, financiación, mantenimiento, etc.)
          </p>
          */}
        </div>

        <div
          className="group bg-white rounded-2xl shadow-lg p-4 md:p-8 flex-1 cursor-pointer border-2 border-gray-300 hover:border-orange-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-orange-50"
          onClick={() => onSelectPath('inspireMe')}
        >
          <div className="mb-3 md:mb-6">
            <Icon name="magnifyingGlass" className="w-10 h-10 md:w-16 md:h-16 text-yellow-500 mx-auto transition-transform duration-300 group-hover:scale-110" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
            Quiero que me ayudes a elegir
          </h3>
          <div className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
            <span className="mr-1">→</span>
            Seleccionar
          </div>
          {/*
          <p className="text-gray-600 group-hover:text-white group-active:text-white">
            No tengo claro qué coche necesito, ayúdame a encontrar la mejor opción para mi presupuesto
          </p>*/}
        </div>
      </div>
    </div>
  );
}
