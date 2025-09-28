'use client';

import { useState } from 'react';
import CarCard from './CarCard';

interface Step2b_DiscoveryProps {
  formData: {
    kmsAnuales: number;
    aniosFinanciacion: number;
    precioCoche: number;
    tipoCombustible: string;
  };
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

export default function Step2b_Discovery({ formData, onUpdate, onNext }: Step2b_DiscoveryProps) {
  const [selectedUse, setSelectedUse] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  const useCases = [
    { id: 'city', label: 'Ciudad', description: 'Trayectos cortos, parking fácil', icon: '🏙️' },
    { id: 'highway', label: 'Carretera', description: 'Viajes largos, autopista', icon: '🛣️' },
    { id: 'mixed', label: 'Mixto', description: 'Ciudad y carretera', icon: '🔄' },
    { id: 'family', label: 'Familiar', description: 'Espacioso, seguro', icon: '👨‍👩‍👧‍👦' },
  ];

  const budgetRanges = [
    { id: 'economy', label: 'Económico', range: '15.000 - 25.000€', icon: '💰' },
    { id: 'mid', label: 'Gama Media', range: '25.000 - 40.000€', icon: '🚗' },
    { id: 'premium', label: 'Premium', range: '40.000 - 60.000€', icon: '⭐' },
    { id: 'luxury', label: 'Lujo', range: '60.000€+', icon: '💎' },
  ];

  const handleUseSelect = (use: string) => {
    setSelectedUse(use);
    // Auto-configurar algunos valores basados en el uso
    if (use === 'city') {
      onUpdate({ kmsAnuales: 15000, tipoCombustible: 'gasolina' });
    } else if (use === 'highway') {
      onUpdate({ kmsAnuales: 35000, tipoCombustible: 'diésel' });
    } else if (use === 'mixed') {
      onUpdate({ kmsAnuales: 25000, tipoCombustible: 'gasolina' });
    } else if (use === 'family') {
      onUpdate({ kmsAnuales: 20000, tipoCombustible: 'gasolina' });
    }
  };

  const handleBudgetSelect = (budget: string) => {
    setSelectedBudget(budget);
    // Auto-configurar precio basado en el presupuesto
    if (budget === 'economy') {
      onUpdate({ precioCoche: 20000 });
    } else if (budget === 'mid') {
      onUpdate({ precioCoche: 32000 });
    } else if (budget === 'premium') {
      onUpdate({ precioCoche: 50000 });
    } else if (budget === 'luxury') {
      onUpdate({ precioCoche: 70000 });
    }
  };

  const handleNext = () => {
    if (selectedUse && selectedBudget) {
      setShowRecommendations(true);
    }
  };

  const handleAnalyzeCar = (carName: string, price: number) => {
    onUpdate({ 
      carModel: carName,
      precioCoche: price,
      carVersion: 'Recomendado'
    });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Cuéntanos sobre tu uso 💭
        </h2>
        <p className="text-gray-600">
          Te ayudamos a encontrar el vehículo perfecto y calcular sus gastos reales
        </p>
      </div>

      {/* Selección de tipo de uso */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">¿Cómo usarás principalmente el vehículo?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCases.map((use) => (
            <div
              key={use.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedUse === use.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleUseSelect(use.id)}
            >
              <div className="text-2xl mb-2">{use.icon}</div>
              <h4 className="font-semibold text-gray-800">{use.label}</h4>
              <p className="text-sm text-gray-600">{use.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selección de presupuesto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">¿Cuál es tu rango de presupuesto?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetRanges.map((budget) => (
            <div
              key={budget.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedBudget === budget.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleBudgetSelect(budget.id)}
            >
              <div className="text-2xl mb-2">{budget.icon}</div>
              <h4 className="font-semibold text-gray-800">{budget.label}</h4>
              <p className="text-sm text-gray-600">{budget.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de configuración automática */}
      {selectedUse && selectedBudget && (
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✨ Configuración automática aplicada
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-700">
            <div>
              <strong>Kilómetros anuales:</strong> {formData.kmsAnuales.toLocaleString('es-ES')} km
            </div>
            <div>
              <strong>Precio estimado:</strong> {formData.precioCoche.toLocaleString('es-ES')} €
            </div>
            <div>
              <strong>Combustible recomendado:</strong> {formData.tipoCombustible}
            </div>
            <div>
              <strong>Financiación:</strong> {formData.aniosFinanciacion} años
            </div>
          </div>
        </div>
      )}

      {/* Botón de siguiente */}
      {!showRecommendations && (
        <div className="text-center">
          <button 
            onClick={handleNext}
            disabled={!selectedUse || !selectedBudget}
            className={`font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg ${
              selectedUse && selectedBudget
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Ver Recomendaciones →
          </button>
        </div>
      )}

      {/* Sección de recomendaciones */}
      {showRecommendations && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Recomendaciones para ti ✨
            </h3>
            <p className="text-gray-600">
              Basado en tu uso y presupuesto, estos son los vehículos que mejor se adaptan a ti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CarCard
              image="https://via.placeholder.com/150"
              name="Seat Ateca"
              tags={selectedUse === 'family' ? ['Familiar', 'Espacioso'] : ['Versátil', 'Práctico']}
              price={selectedBudget === 'economy' ? 25000 : selectedBudget === 'mid' ? 32000 : 45000}
              onAnalyze={() => handleAnalyzeCar('Seat Ateca', selectedBudget === 'economy' ? 25000 : selectedBudget === 'mid' ? 32000 : 45000)}
            />
            <CarCard
              image="https://via.placeholder.com/150"
              name="Volkswagen Golf"
              tags={selectedUse === 'city' ? ['Urbano', 'Compacto'] : ['Versátil', 'Eficiente']}
              price={selectedBudget === 'economy' ? 22000 : selectedBudget === 'mid' ? 28000 : 40000}
              onAnalyze={() => handleAnalyzeCar('Volkswagen Golf', selectedBudget === 'economy' ? 22000 : selectedBudget === 'mid' ? 28000 : 40000)}
            />
            <CarCard
              image="https://via.placeholder.com/150"
              name="BMW Serie 3"
              tags={selectedUse === 'highway' ? ['Deportivo', 'Autopista'] : ['Premium', 'Tecnología']}
              price={selectedBudget === 'premium' ? 45000 : selectedBudget === 'luxury' ? 60000 : 35000}
              onAnalyze={() => handleAnalyzeCar('BMW Serie 3', selectedBudget === 'premium' ? 45000 : selectedBudget === 'luxury' ? 60000 : 35000)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
