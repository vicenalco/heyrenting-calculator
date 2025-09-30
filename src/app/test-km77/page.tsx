'use client';

import { useState, useEffect } from 'react';
import { fetchBrands, fetchModels, fetchTrimsWithKm77Prices } from '@/lib/airtable';
import { Brand, Model } from '@/lib/airtable';
import Km77PriceCard from '@/app/components/Km77PriceCard';
import PriceIntegrationSummary from '@/app/components/PriceIntegrationSummary';

export default function TestKm77Page() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [integrationResults, setIntegrationResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar marcas al montar el componente
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandsData = await fetchBrands('');
        setBrands(brandsData);
      } catch (err) {
        setError('Error cargando marcas');
      }
    };
    loadBrands();
  }, []);

  // Cargar modelos cuando se selecciona una marca
  useEffect(() => {
    if (selectedBrand) {
      const loadModels = async () => {
        try {
          const modelsData = await fetchModels(selectedBrand);
          setModels(modelsData);
          setSelectedModel(''); // Reset modelo seleccionado
        } catch (err) {
          setError('Error cargando modelos');
        }
      };
      loadModels();
    } else {
      setModels([]);
      setSelectedModel('');
    }
  }, [selectedBrand]);

  const handleSearch = async () => {
    if (!selectedBrand || !selectedModel) {
      setError('Selecciona una marca y modelo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await fetchTrimsWithKm77Prices(selectedBrand, selectedModel);
      setIntegrationResults(results);
    } catch (err) {
      setError('Error en la búsqueda de precios');
    } finally {
      setLoading(false);
    }
  };

  const selectedBrandName = brands.find(b => b.id === selectedBrand)?.name || '';
  const selectedModelName = models.find(m => m.id === selectedModel)?.name || '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prueba de Integración km77
          </h1>
          <p className="text-gray-600">
            Busca precios actualizados de motorizaciones en km77.com
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una marca</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Selecciona un modelo</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!selectedBrand || !selectedModel || loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Buscando...' : 'Buscar Precios'}
              </button>
            </div>
          </div>
        </div>

        {/* Mostrar error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">❌</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Mostrar resultados */}
        {integrationResults && (
          <div className="space-y-8">
            {/* Resumen */}
            <PriceIntegrationSummary
              results={integrationResults.data.trims}
              brand={selectedBrandName}
              model={selectedModelName}
            />

            {/* Tarjetas de precios */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Motorizaciones y Precios
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {integrationResults.data.trims.map((result: any, index: number) => (
                  <Km77PriceCard
                    key={index}
                    integrationResult={result}
                    showDetails={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instrucciones */}
        {!integrationResults && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Instrucciones de uso
            </h3>
            <ul className="text-blue-700 space-y-2">
              <li>• Selecciona una marca y modelo de la lista</li>
              <li>• Haz clic en "Buscar Precios" para obtener datos de km77</li>
              <li>• Los resultados mostrarán la comparación entre precios de Airtable y km77</li>
              <li>• Se indicará la precisión de los precios con iconos de estado</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
