'use client';

import React from 'react';

// Definición de las props del componente ResultCard
interface ResultCardProps {
  title: string;                    // Título de la tarjeta
  monthlyCost: number;              // Coste mensual a mostrar
  isFeatured?: boolean;             // Si la tarjeta debe tener estilo destacado
  children?: React.ReactNode;       // Contenido adicional (desglose)
}

/**
 * Componente ResultCard para mostrar resultados de costes mensuales
 * Ideal para comparar diferentes opciones de financiación
 */
const ResultCard: React.FC<ResultCardProps> = ({
  title,
  monthlyCost,
  isFeatured = false,
  children
}) => {
  // Función para formatear números como moneda
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('es-ES', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })} €/mes`;
  };

  return (
    <div className={`
      p-6 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl
      ${isFeatured 
        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-2 border-blue-500' 
        : 'bg-white text-gray-800 border border-gray-200'
      }
    `}>
      {/* Título de la tarjeta */}
      <h3 className={`
        text-lg font-semibold mb-4
        ${isFeatured ? 'text-white' : 'text-gray-800'}
      `}>
        {title}
      </h3>

      {/* Coste mensual destacado */}
      <div className="text-center mb-6">
        <div className={`
          text-4xl font-bold
          ${isFeatured ? 'text-white' : 'text-blue-600'}
        `}>
          {formatCurrency(monthlyCost)}
        </div>
        <p className={`
          text-sm mt-2
          ${isFeatured ? 'text-blue-100' : 'text-gray-600'}
        `}>
          Coste mensual total
        </p>
      </div>

      {/* Contenido adicional (desglose) */}
      {children && (
        <div className={`
          text-sm space-y-2
          ${isFeatured ? 'text-blue-100' : 'text-gray-600'}
        `}>
          {children}
        </div>
      )}

      {/* Indicador visual para tarjetas destacadas */}
      {isFeatured && (
        <div className="mt-4 flex items-center justify-center">
          <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
            ⭐ Recomendado
          </span>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
