'use client';

import { PriceIntegrationResult } from '@/lib/priceIntegration';

interface PriceIntegrationSummaryProps {
  results: PriceIntegrationResult[];
  brand: string;
  model: string;
}

export default function PriceIntegrationSummary({ results, brand, model }: PriceIntegrationSummaryProps) {
  const totalTrims = results.length;
  const withKm77Data = results.filter(r => r.km77Results.length > 0).length;
  const accuratePrices = results.filter(r => r.priceAccuracy === 'exact' || r.priceAccuracy === 'close').length;
  const differentPrices = results.filter(r => r.priceAccuracy === 'different').length;
  const noData = results.filter(r => r.priceAccuracy === 'no_data').length;

  const accuracyPercentage = totalTrims > 0 ? Math.round((accuratePrices / totalTrims) * 100) : 0;
  const dataPercentage = totalTrims > 0 ? Math.round((withKm77Data / totalTrims) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Resumen de Precios - {brand} {model}
        </h2>
        <div className="text-sm text-gray-500">
          {totalTrims} motorizaciones
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{dataPercentage}%</div>
          <div className="text-sm text-gray-600">Con precios actualizados</div>
          <div className="text-xs text-gray-500">{withKm77Data}/{totalTrims}</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{accuracyPercentage}%</div>
          <div className="text-sm text-gray-600">Precios precisos</div>
          <div className="text-xs text-gray-500">{accuratePrices}/{totalTrims}</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{differentPrices}</div>
          <div className="text-sm text-gray-600">Precios diferentes</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-500">{noData}</div>
          <div className="text-sm text-gray-600">Sin datos</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">📊</span>
            <span className="text-sm font-medium text-blue-800">Precios actualizados</span>
          </div>
          <span className="text-sm text-blue-600 font-semibold">
            {withKm77Data} de {totalTrims} motorizaciones
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <span className="text-sm font-medium text-green-800">Precios precisos</span>
          </div>
          <span className="text-sm text-green-600 font-semibold">
            {accuratePrices} de {totalTrims} motorizaciones
          </span>
        </div>

        {differentPrices > 0 && (
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-sm font-medium text-red-800">Precios diferentes</span>
            </div>
            <span className="text-sm text-red-600 font-semibold">
              {differentPrices} motorizaciones
            </span>
          </div>
        )}

        {noData > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">❓</span>
              <span className="text-sm font-medium text-gray-800">Sin precios actualizados</span>
            </div>
            <span className="text-sm text-gray-600 font-semibold">
              {noData} motorizaciones
            </span>
          </div>
        )}
      </div>

      {accuracyPercentage < 50 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-sm font-medium text-yellow-800">
              Recomendación: Revisar los precios de Airtable
            </span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Solo el {accuracyPercentage}% de los precios coinciden con los datos actualizados. 
            Considera actualizar los precios en Airtable.
          </p>
        </div>
      )}
    </div>
  );
}
