# Sistema de Validación de Precios

Esta funcionalidad permite validar y actualizar precios de coches NUEVOS comparándolos con fuentes externas de datos.

## Características

- **Validación automática**: Obtiene precios actualizados basándose en marca, modelo, combustible y potencia
- **Extracción inteligente**: Extrae TODOS los precios del modelo/motorización especificada
- **Cálculo de promedio global**: Calcula la media de precios de TODAS las variantes encontradas (diferentes paquetes de equipamiento del mismo modelo/motorización)
- **Comparación de precios**: Compara precios de Airtable vs datos actualizados (coches nuevos)
- **Validación de precisión**: Indica la precisión de los precios con iconos de estado
- **Estadísticas**: Resumen de precisión de precios por marca/modelo

## ⚠️ IMPORTANTE

- **Precios de coches NUEVOS**: Esta funcionalidad obtiene precios de coches nuevos únicamente
- **Cálculo de promedio global**: Se calcula la media de precios de TODAS las variantes encontradas, independientemente del paquete de equipamiento. Esto proporciona un precio más representativo ya que el mismo modelo/motorización puede tener diferentes precios según el nivel de equipamiento.
- **Sin filtrado por nombre exacto**: No se requiere coincidencia exacta del nombre de la motorización, se obtienen todos los vehículos que coincidan con los filtros de combustible, transmisión y potencia.
- **Confidencialidad**: La fuente de datos externos no se muestra en la interfaz de usuario
- **Futuras funcionalidades**: Los precios de segunda mano, km0 y renting se implementarán en pasos posteriores

## Archivos Creados

### Librerías
- `src/lib/km77.ts` - Servicio principal para validación de precios
- `src/lib/priceIntegration.ts` - Integración con Airtable

### APIs
- `src/app/api/km77/search/route.ts` - API para validación directa de precios
- `src/app/api/airtable/trims-with-prices/route.ts` - API integrada con Airtable

### Componentes
- `src/app/components/Km77PriceCard.tsx` - Tarjeta de validación de precios
- `src/app/components/PriceIntegrationSummary.tsx` - Resumen de validación

### Página de Prueba
- `src/app/test-km77/page.tsx` - Página para probar la funcionalidad

## Uso

### 1. Validación Directa de Precios

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

### 3. Página de Validación

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

**Nota**: Esta URL se genera internamente y no se muestra al usuario.

## Limitaciones

- **Rate limiting**: Se incluye una pausa de 1 segundo entre peticiones
- **Dependencia de fuentes externas**: La funcionalidad depende de la estructura de las fuentes externas
- **Scraping**: Puede requerir ajustes si las fuentes externas cambian su estructura

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
4. Haz clic en "Validar Precios"
5. Revisa los resultados y la precisión de los precios

**Nota**: La interfaz no muestra la fuente de los datos externos para mantener la confidencialidad.
