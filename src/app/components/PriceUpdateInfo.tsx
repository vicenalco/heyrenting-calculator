'use client';

interface PriceUpdateInfoProps {
  totalTrims: number;
  updatedTrims: number;
  accuracyPercentage: number;
}

export default function PriceUpdateInfo({ totalTrims, updatedTrims, accuracyPercentage }: PriceUpdateInfoProps) {
  if (updatedTrims === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-blue-600">📊</span>
        <h4 className="text-sm font-semibold text-blue-800">
          Precios Actualizados
        </h4>
      </div>
      <div className="text-sm text-blue-700">
        <p>
          Se han actualizado {updatedTrims} de {totalTrims} motorizaciones con precios actuales.
        </p>
        <p className="mt-1">
          Precisión: {accuracyPercentage}% de los precios coinciden con datos actualizados.
        </p>
      </div>
    </div>
  );
}
