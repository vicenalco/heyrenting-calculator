# Integración con km77.com

Esta funcionalidad permite integrar precios actualizados de km77.com con los datos de Airtable para obtener precios más precisos de las motorizaciones.

## Características

- **Búsqueda automática**: Construye URLs de km77 basándose en marca, modelo, combustible y potencia
- **Scraping inteligente**: Extrae precios específicos de motorizaciones
- **Comparación de precios**: Compara precios de Airtable vs km77
- **Validación de precisión**: Indica la precisión de los precios con iconos de estado
- **Estadísticas**: Resumen de precisión de precios por marca/modelo

## Archivos Creados

### Librerías
- `src/lib/km77.ts` - Servicio principal para km77
- `src/lib/priceIntegration.ts` - Integración con Airtable

### APIs
- `src/app/api/km77/search/route.ts` - API para búsquedas directas en km77
- `src/app/api/airtable/trims-with-prices/route.ts` - API integrada con Airtable

### Componentes
- `src/app/components/Km77PriceCard.tsx` - Tarjeta de precios
- `src/app/components/PriceIntegrationSummary.tsx` - Resumen de integración

### Página de Prueba
- `src/app/test-km77/page.tsx` - Página para probar la funcionalidad

## Uso

### 1. Búsqueda Directa en km77

```typescript
import { searchKm77Prices } from '@/lib/km77';

const results = await searchKm77Prices({
  brand: 'Alfa Romeo',
  model: 'Junior',
  fuel: 'hibrido',
  power: 145,
  transmission: 'automatico'
});
```

### 2. Integración con Airtable

```typescript
import { fetchTrimsWithKm77Prices } from '@/lib/airtable';

const results = await fetchTrimsWithKm77Prices(brandId, modelId);
```

### 3. Página de Prueba

Visita `/test-km77` para probar la funcionalidad con una interfaz gráfica.

## Mapeo de Datos

### Combustible
- `gasolina` → `gasolina`
- `diesel` → `diesel`
- `hibrido` → `hibrido_no_enchufable`
- `hibrido_enchufable` → `hibrido_enchufable`
- `electrico` → `electrico`

### Transmisión
- `manual` → `manual`
- `automatico` → `automatico`
- `cvt` → `automatico`

## Estados de Precisión

- ✅ **Exacto**: Diferencia < 5%
- ⚠️ **Cercano**: Diferencia < 15%
- ❌ **Diferente**: Diferencia > 15%
- ❓ **Sin datos**: No se encontraron resultados en km77

## Ejemplo de URL Generada

```
https://www.km77.com/buscador/datos?grouped=0&order=price-asc&markets[]=current&nqls[]=ve:car:alfa-romeo:junior&fuel_categories[]=hibrido_no_enchufable&gearboxes[]=automatico
```

## Limitaciones

- **Rate limiting**: Se incluye una pausa de 1 segundo entre peticiones
- **Dependencia de km77**: La funcionalidad depende de la estructura de km77
- **Scraping**: Puede requerir ajustes si km77 cambia su estructura

## Próximos Pasos

1. **Mejorar extracción de motorización**: Extraer automáticamente la motorización específica
2. **Cache de resultados**: Implementar cache para evitar peticiones repetidas
3. **Actualización automática**: Programar actualizaciones periódicas de precios
4. **Alertas**: Notificar cuando los precios difieren significativamente

## Testing

Para probar la funcionalidad:

1. Ejecuta `npm run dev`
2. Visita `http://localhost:3000/test-km77`
3. Selecciona una marca y modelo
4. Haz clic en "Buscar Precios"
5. Revisa los resultados y la precisión de los precios
