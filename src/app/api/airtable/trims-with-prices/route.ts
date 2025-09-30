import { NextResponse } from 'next/server';
import { integrateKm77PricesForTrims } from '@/lib/priceIntegration';
import { fetchBrands, fetchModels, fetchTrims } from '@/lib/airtable';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const modelId = searchParams.get('modelId');

    if (!brandId || !modelId) {
      return NextResponse.json(
        { error: 'Se requieren brandId y modelId' },
        { status: 400 }
      );
    }

    // Obtener datos de Airtable
    const [brands, models, trims] = await Promise.all([
      fetchBrands(''),
      fetchModels(brandId),
      fetchTrims(modelId),
    ]);

    const brand = brands.find(b => b.id === brandId);
    const model = models.find(m => m.id === modelId);

    if (!brand || !model) {
      return NextResponse.json(
        { error: 'Marca o modelo no encontrado' },
        { status: 404 }
      );
    }

    // Integrar precios de km77
    const integrationResults = await integrateKm77PricesForTrims(brand, model, trims);

    return NextResponse.json({
      success: true,
      data: {
        brand,
        model,
        trims: integrationResults,
        summary: {
          totalTrims: trims.length,
          withKm77Data: integrationResults.filter(r => r.km77Results.length > 0).length,
          accuratePrices: integrationResults.filter(r => r.priceAccuracy === 'exact' || r.priceAccuracy === 'close').length,
        },
      },
    });

  } catch (error) {
    console.error('Error en API trims-with-prices:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandId, modelId } = body;

    if (!brandId || !modelId) {
      return NextResponse.json(
        { error: 'Se requieren brandId y modelId' },
        { status: 400 }
      );
    }

    // Obtener datos de Airtable
    const [brands, models, trims] = await Promise.all([
      fetchBrands(''),
      fetchModels(brandId),
      fetchTrims(modelId),
    ]);

    const brand = brands.find(b => b.id === brandId);
    const model = models.find(m => m.id === modelId);

    if (!brand || !model) {
      return NextResponse.json(
        { error: 'Marca o modelo no encontrado' },
        { status: 404 }
      );
    }

    // Integrar precios de km77
    const integrationResults = await integrateKm77PricesForTrims(brand, model, trims);

    return NextResponse.json({
      success: true,
      data: {
        brand,
        model,
        trims: integrationResults,
        summary: {
          totalTrims: trims.length,
          withKm77Data: integrationResults.filter(r => r.km77Results.length > 0).length,
          accuratePrices: integrationResults.filter(r => r.priceAccuracy === 'exact' || r.priceAccuracy === 'close').length,
        },
      },
    });

  } catch (error) {
    console.error('Error en API trims-with-prices POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
