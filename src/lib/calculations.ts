/**
 * Lógica centralizada de cálculos financieros para la calculadora HEYrenting
 * Contiene todas las fórmulas y algoritmos para comparar propiedad vs renting
 */

// Interfaces para tipado fuerte
export interface CalculationInputs {
  precioCoche: number;
  aniosFinanciacion: number;
  kmsAnuales: number;
}

export interface CalculationResults {
  totalOwnershipCost: number;
  rentingCost: number;
  breakdown: {
    financiero: number;
    depreciacion: number;
    seguro: number;
    mantenimiento: number;
    neumaticos: number;
    impuestos: number;
    imprevistos: number;
  };
}

/**
 * Función principal de cálculo financiero
 * Realiza un "autopsia financiera" completa del coste de propiedad vs renting
 * 
 * @param inputs - Objeto con los inputs del usuario
 * @returns Objeto con el desglose completo de costes
 */
export const calculateFinancialAutopsy = (inputs: CalculationInputs): CalculationResults => {
  const { precioCoche, aniosFinanciacion, kmsAnuales } = inputs;
  const mesesFinanciacion = aniosFinanciacion * 12;

  // === CÁLCULO DE COSTES DE PROPIEDAD ===
  
  // 1. Coste financiero mensual (con 8% de interés simple)
  const financiero = (precioCoche / mesesFinanciacion) * 1.08;
  
  // 2. Depreciación mensual (más realista: 18% anual + 10% por cada año de financiación)
  const depreciacion = (precioCoche * 0.18) / 12 + (precioCoche * 0.10 * (aniosFinanciacion / 5)) / 12;
  
  // 3. Seguro mensual (fijo: 840€/año = 70€/mes)
  const seguro = 70;
  
  // 4. Mantenimiento mensual (revisión de 350€ cada 15.000km)
  const mantenimiento = (kmsAnuales / 15000) * (350 / 12);
  
  // 5. Neumáticos mensual (juego de 600€ cada 45.000km)
  const neumaticos = (kmsAnuales / 45000) * (600 / 12);
  
  // 6. Impuestos mensual (144€/año de media)
  const impuestos = 12;
  
  // 7. Fondo de imprevistos (30-50€/mes según valor del vehículo)
  const imprevistos = precioCoche > 40000 ? 50 : 30;

  // Coste total de propiedad
  const totalOwnershipCost = financiero + depreciacion + seguro + mantenimiento + neumaticos + impuestos + imprevistos;

  // === CÁLCULO DE COSTE DE RENTING ===
  // Fórmula mejorada: precio/55 + kms/1100
  const rentingCost = (precioCoche / 55) + (kmsAnuales / 1100);

  return {
    totalOwnershipCost: Math.round(totalOwnershipCost),
    rentingCost: Math.round(rentingCost),
    breakdown: {
      financiero: Math.round(financiero),
      depreciacion: Math.round(depreciacion),
      seguro: Math.round(seguro),
      mantenimiento: Math.round(mantenimiento),
      neumaticos: Math.round(neumaticos),
      impuestos: Math.round(impuestos),
      imprevistos: Math.round(imprevistos),
    },
  };
};

/**
 * Función auxiliar para calcular el porcentaje de ahorro
 * @param ownershipCost - Coste total de propiedad
 * @param rentingCost - Coste total de renting
 * @returns Porcentaje de ahorro (positivo si renting es más barato)
 */
export const calculateSavingsPercentage = (ownershipCost: number, rentingCost: number): number => {
  if (ownershipCost === 0) return 0;
  return Math.round(((ownershipCost - rentingCost) / ownershipCost) * 100);
};

/**
 * Función auxiliar para calcular el ahorro mensual absoluto
 * @param ownershipCost - Coste total de propiedad
 * @param rentingCost - Coste total de renting
 * @returns Ahorro mensual en euros
 */
export const calculateMonthlySavings = (ownershipCost: number, rentingCost: number): number => {
  return Math.round(ownershipCost - rentingCost);
};
