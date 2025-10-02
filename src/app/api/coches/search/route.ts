import { NextResponse } from 'next/server';
import { searchAllCochesPrices, CochesSearchParams } from '@/lib/coches';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 API coches.com recibió petición POST:', body);
    
    const { brand, model, fuel, power, years } = body;

    // Validar parámetros requeridos
    if (!brand || !model || !fuel || !power) {
      console.log('❌ Faltan parámetros:', { brand, model, fuel, power });
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

    console.log('🔍 Iniciando búsqueda en coches.com con parámetros:', searchParams);
    
    // Realizar búsqueda en coches.com
    const searchResponse = await searchAllCochesPrices(searchParams);
    console.log('📊 Resultados de búsqueda coches.com:', searchResponse);

    return NextResponse.json({
      success: true,
      data: {
        searchParams,
        segundaMano: searchResponse.segundaMano,
        km0: searchResponse.km0,
      },
    });

  } catch (error) {
    console.error('Error en API coches.com POST:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

