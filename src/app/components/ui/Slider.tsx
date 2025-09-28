'use client';

import React from 'react';

// Definición de las props del componente Slider
interface SliderProps {
  label: string;           // Etiqueta que se muestra encima del slider
  min: number;             // Valor mínimo del rango
  max: number;             // Valor máximo del rango
  step: number;            // Incremento del slider
  value: number;           // Valor actual del slider (controlado)
  onChange: (value: number) => void;  // Función que se ejecuta al cambiar el valor
  unit?: string;           // Unidad opcional (ej. "km", "€")
}

/**
 * Componente Slider reutilizable para la calculadora HEYrenting
 * Permite seleccionar valores numéricos con una interfaz visual intuitiva
 */
const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit = ''
}) => {
  // Función para formatear números con puntos para los miles
  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-ES');
  };

  // Función que maneja el cambio del slider
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange(newValue);
  };

  return (
    <div className="w-full space-y-3">
      {/* Etiqueta del slider */}
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {/* Valor actual formateado con unidad */}
        <span className="text-lg font-semibold text-blue-600">
          {formatNumber(value)}
          {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
        </span>
      </div>

      {/* Contenedor del slider */}
      <div className="relative">
        {/* Input range nativo con estilos personalizados */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Indicadores de valor mínimo y máximo */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatNumber(min)}</span>
          <span>{formatNumber(max)}</span>
        </div>
      </div>
    </div>
  );
};

export default Slider;
