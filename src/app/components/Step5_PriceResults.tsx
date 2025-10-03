'use client';

import { useState } from 'react';

interface Step5_PriceResultsProps {
  formData: {
    carBrand: string;
    carModel: string;
    carVersion: string;
    carYear: number[];
    precioNuevo: number | null;
    precioSegundaMano: number | null;
    precioKm0: number | null;
  };
  onPreviousStep: () => void;
}

export default function Step5_PriceResults({ formData, onPreviousStep }: Step5_PriceResultsProps) {
  const [selectedPrice, setSelectedPrice] = useState<'nuevo' | 'segundaMano' | 'km0' | null>(null);

  const formatPrice = (price: number | null) => {
    if (price === null) return 'No disponible';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatYears = (years: number[]) => {
    if (years.length === 0) return '';
    if (years.length === 1) return years[0].toString();
    const min = Math.min(...years);
    const max = Math.max(...years);
    return `${min} - ${max}`;
  };

  const priceCards = [
    {
      id: 'nuevo' as const,
      title: 'Vehículo Nuevo',
      icon: '🆕',
      price: formData.precioNuevo,
      description: 'Precio de venta de un vehículo 0 km',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      selectedBorder: 'border-blue-500',
    },
    {
      id: 'segundaMano' as const,
      title: 'Segunda Mano',
      icon: '🚗',
      price: formData.precioSegundaMano,
      description: 'Precio promedio en el mercado de segunda mano',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBorder: 'hover:border-green-400',
      selectedBorder: 'border-green-500',
    },
    {
      id: 'km0' as const,
      title: 'KM0',
      icon: '✨',
      price: formData.precioKm0,
      description: 'Vehículo seminuevo con muy pocos kilómetros',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400',
      selectedBorder: 'border-purple-500',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Precios de Mercado 💰
        </h2>
        <p className="text-xl text-gray-600 mb-2">
          <strong>{formData.carBrand} {formData.carModel}</strong>
        </p>
        <p className="text-lg text-gray-500">
          {formData.carVersion}
        </p>
        {formData.carYear.length > 0 && (
          <p className="text-md text-gray-500 mt-2">
            Años: {formatYears(formData.carYear)}
          </p>
        )}
      </div>
      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {priceCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setSelectedPrice(card.id)}
            className={`
              relative cursor-pointer rounded-2xl border-3 transition-all duration-300 transform
              ${selectedPrice === card.id ? `${card.selectedBorder} scale-105 shadow-2xl` : `${card.borderColor} ${card.hoverBorder} hover:scale-102 shadow-lg hover:shadow-xl`}
              ${card.bgColor}
              ${card.price === null ? 'opacity-60' : ''}
            `}
          >
            {/* Badge de seleccionado */}
            {selectedPrice === card.id && (
              <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                <span className="text-lg">✓</span>
              </div>
            )}

            {/* Header con gradiente */}
            <div className={`bg-gradient-to-r ${card.color} text-white p-6 rounded-t-2xl`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl">{card.icon}</span>
                {card.price !== null && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-xs font-medium">Disponible</span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold">{card.title}</h3>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                {card.description}
              </p>
              
              {/* Precio */}
              <div className="text-center py-4">
                {card.price !== null ? (
                  <>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {formatPrice(card.price)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Precio promedio
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-semibold text-gray-400 mb-1">
                      No hay modelos disponibles en el mercado
                    </div>
                  </>
                )}
              </div>

              {/* Indicador de ahorro (solo para segunda mano y km0) */}
              {card.price !== null && formData.precioNuevo !== null && card.id !== 'nuevo' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center text-sm">
                    <span className="text-green-600 font-semibold">
                      Ahorro: {formatPrice(formData.precioNuevo - card.price)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {((1 - card.price / formData.precioNuevo) * 100).toFixed(0)}% menos que nuevo
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Información sobre los precios
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Los precios mostrados son promedios basados en ofertas reales del mercado actual</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Los precios de segunda mano y km0 pueden variar según el estado, kilometraje y equipamiento</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Los datos se actualizan en tiempo real desde fuentes de mercado verificadas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparativa visual (si hay al menos 2 precios disponibles) */}
      {[formData.precioNuevo, formData.precioSegundaMano, formData.precioKm0].filter(p => p !== null).length >= 2 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Comparativa de Precios
          </h4>
          <div className="space-y-4">
            {priceCards.map((card) => {
              if (card.price === null) return null;
              const maxPrice = Math.max(
                formData.precioNuevo || 0,
                formData.precioSegundaMano || 0,
                formData.precioKm0 || 0
              );
              const percentage = (card.price / maxPrice) * 100;

              return (
                <div key={card.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="mr-2">{card.icon}</span>
                      {card.title}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(card.price)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${card.color} transition-all duration-500 ease-out rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

       {/* Botones de navegación */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={onPreviousStep}
          className="flex items-center px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
        >
          <span className="mr-2">←</span>
          Volver
        </button>
        
        <button
          className="flex items-center px-8 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Continuar con el Análisis
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}

