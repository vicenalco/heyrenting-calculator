import { NextResponse } from 'next/server';
import { searchKm77Prices, Km77SearchParams, getLowestPrice, getAveragePrice } from '@/lib/km77';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const fuel = searchParams.get('fuel');
    const power = searchParams.get('power');
    const transmission = searchParams.get('transmission');

    // Validar parámetros requeridos
    if (!brand || !model || !fuel || !power || !transmission) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: brand, model, fuel, power, transmission' },
        { status: 400 }
      );
    }

    const searchParams_km77: Km77SearchParams = {
      brand,
      model,
      fuel,
      power: parseInt(power),
      transmission,
    };

    // Realizar búsqueda en km77
    const searchResponse = await searchKm77Prices(searchParams_km77);

    // Calcular precios estadísticos
    const lowestPrice = getLowestPrice(searchResponse.results);
    const averagePrice = getAveragePrice(searchResponse.results);

    return NextResponse.json({
      success: true,
      data: {
        searchParams: searchParams_km77,
        results: searchResponse.results,
        totalResults: searchResponse.totalResults,
        searchUrl: searchResponse.searchUrl,
        priceStats: {
          lowest: lowestPrice,
          average: averagePrice,
        },
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { brand, model, fuel, power, transmission } = body;

    // Validar parámetros requeridos
    if (!brand || !model || !fuel || !power || !transmission) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: brand, model, fuel, power, transmission' },
        { status: 400 }
      );
    }

    const searchParams: Km77SearchParams = {
      brand,
      model,
      fuel,
      power: parseInt(power),
      transmission,
    };
    
    // Realizar búsqueda en km77
    const searchResponse = await searchKm77Prices(searchParams);

    // Calcular precios estadísticos
    const lowestPrice = getLowestPrice(searchResponse.results);
    const averagePrice = getAveragePrice(searchResponse.results);

    return NextResponse.json({
      success: true,
      data: {
        searchParams,
        results: searchResponse.results,
        totalResults: searchResponse.totalResults,
        searchUrl: searchResponse.searchUrl,
        priceStats: {
          lowest: lowestPrice,
          average: averagePrice,
        },
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
