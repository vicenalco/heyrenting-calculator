import { NextResponse } from 'next/server';
import { searchAllCochesPrices, CochesSearchParams } from '@/lib/coches';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { brand, model, fuel, power, years } = body;

    // Validar parámetros requeridos
    if (!brand || !model || !fuel || !power) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: brand, model, fuel, power' },
        { status: 400 }
      );
    }

    const searchParams: CochesSearchParams = {
      brand,
      model,
      fuel,
      power: parseInt(power),
      years: years || [],
    };
    
    // Realizar búsqueda en coches.com
    const searchResponse = await searchAllCochesPrices(searchParams);

    return NextResponse.json({
      success: true,
      data: {
        searchParams,
        segundaMano: searchResponse.segundaMano,
        km0: searchResponse.km0,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

