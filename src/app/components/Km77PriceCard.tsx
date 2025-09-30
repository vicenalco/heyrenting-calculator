'use client';

import { Km77Result } from '@/lib/km77';
import { PriceIntegrationResult } from '@/lib/priceIntegration';

interface Km77PriceCardProps {
  integrationResult: PriceIntegrationResult;
  showDetails?: boolean;
}

export default function Km77PriceCard({ integrationResult, showDetails = false }: Km77PriceCardProps) {
  const { trim, km77Results, lowestPrice, averagePrice, priceAccuracy, priceDifference } = integrationResult;

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'exact': return 'text-green-600';
      case 'close': return 'text-yellow-600';
      case 'different': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getAccuracyIcon = (accuracy: string) => {
    switch (accuracy) {
      case 'exact': return '✅';
      case 'close': return '⚠️';
      case 'different': return '❌';
      default: return '❓';
    }
  };

  const getAccuracyText = (accuracy: string) => {
    switch (accuracy) {
      case 'exact': return 'Precio exacto';
      case 'close': return 'Precio cercano';
      case 'different': return 'Precio diferente';
      default: return 'Sin datos';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{trim.name}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm">{getAccuracyIcon(priceAccuracy)}</span>
          <span className={`text-sm font-medium ${getAccuracyColor(priceAccuracy)}`}>
            {getAccuracyText(priceAccuracy)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Precio Airtable</p>
          <p className="text-lg font-bold text-blue-600">
            {trim.price ? `${trim.price.toLocaleString()} €` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Precio km77</p>
          <p className="text-lg font-bold text-green-600">
            {lowestPrice ? `${lowestPrice.toLocaleString()} €` : 'N/A'}
          </p>
        </div>
      </div>

      {priceDifference !== null && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Diferencia</p>
          <p className={`text-lg font-bold ${priceDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {priceDifference > 0 ? '+' : ''}{priceDifference.toLocaleString()} €
          </p>
        </div>
      )}

      {averagePrice && averagePrice !== lowestPrice && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Precio promedio km77</p>
          <p className="text-lg font-bold text-gray-700">
            {averagePrice.toLocaleString()} €
          </p>
        </div>
      )}

      {showDetails && km77Results.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Resultados detallados ({km77Results.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {km77Results.map((result, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{result.motorization}</p>
                    <p className="text-gray-600 text-xs">{result.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{result.price.toLocaleString()} €</p>
                    <p className="text-xs text-gray-500">{result.power} CV</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {km77Results.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            No se encontraron resultados en km77 para esta motorización
          </p>
        </div>
      )}
    </div>
  );
}
