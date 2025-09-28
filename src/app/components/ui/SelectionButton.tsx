'use client';

import React from 'react';

// Definición de las props del componente SelectionButton
interface SelectionButtonProps {
  label: string;           // Texto que se muestra en el botón
  onClick: () => void;     // Función que se ejecuta al hacer clic
  isActive: boolean;       // Indica si el botón está actualmente seleccionado
}

/**
 * Componente SelectionButton reutilizable para seleccionar opciones
 * Ideal para elegir tipo de combustible, tipo de financiación, etc.
 */
const SelectionButton: React.FC<SelectionButtonProps> = ({
  label,
  onClick,
  isActive
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
        transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }
      `}
    >
      {label}
    </button>
  );
};

export default SelectionButton;
