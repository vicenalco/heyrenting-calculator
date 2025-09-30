'use client';

interface PriceScrapingProgressProps {
  isScraping: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  completed: boolean;
}

export default function PriceScrapingProgress({
  isScraping,
  progress,
  currentStep,
  error,
  completed,
}: PriceScrapingProgressProps) {
  if (!isScraping && !completed && !error) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex-shrink-0">
          {isScraping ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600"></div>
          ) : completed ? (
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          ) : error ? (
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✗</span>
            </div>
          ) : null}
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-800">
            {isScraping ? 'Obteniendo precios actualizados...' : 
             completed ? 'Precios obtenidos correctamente' :
             error ? 'Error al obtener precios' : ''}
          </h4>
          <p className="text-sm text-blue-700 mt-1">
            {currentStep}
          </p>
        </div>
      </div>

      {isScraping && (
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Los precios se obtendrán de la base de datos local.
          </p>
        </div>
      )}

      {completed && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <strong>✓ Completado:</strong> Los precios han sido actualizados con datos externos.
          </p>
        </div>
      )}
    </div>
  );
}
