// Calculation functions based on Excel formulas
import { CalculatorInputs, CalculatedOutputs, Parameters } from './types';

export function calculateQuote(
  inputs: CalculatorInputs,
  parameters: Parameters
): CalculatedOutputs {
  // 1. Calculate dimensions
  const area = inputs.width * inputs.height;
  const perimeter = inputs.width * 2 + inputs.height * 2;
  const totalWithWaste = perimeter * (1 + parameters.cuttingWaste);
  const totalMeters = totalWithWaste / 100;

  // 2. Calculate frame cost
  const frameCostPerMeter = getFrameCostPerMeter(
    inputs.woodType,
    inputs.frameType,
    parameters
  );
  const frameCost = frameCostPerMeter * totalMeters;

  // 3. Calculate treatment cost
  const treatmentKey = inputs.woodType === 'walnut' ? 'hardwood' : inputs.woodType;
  const treatmentCost = inputs.treated
    ? parameters.treatmentCosts[treatmentKey]
    : 0;

  // 4. Calculate hardware/materials cost
  let hardwareCost = 0;
  let printMaterialsCost = 0;

  // Calculate mountboard cost (applies to both canvas and print when not 'none')
  const isSmall = totalWithWaste <= parameters.sizeThreshold;
  const sizedMaterials = isSmall
    ? parameters.printMaterials.small
    : parameters.printMaterials.large;

  let mountboardCost = 0;
  const mountboard = inputs.mountboard || (inputs.artType === 'canvas' ? 'none' : 'single');
  if (mountboard === 'single') {
    mountboardCost = sizedMaterials.mountboard;
  } else if (mountboard === 'double') {
    mountboardCost = sizedMaterials.mountboard * 2;
  } else if (mountboard === 'premium') {
    mountboardCost = isSmall
      ? parameters.premiumMountboard.small
      : parameters.premiumMountboard.large;
  }
  // 'none' = 0

  if (inputs.artType === 'canvas') {
    hardwareCost =
      parameters.canvasHardware.clips +
      parameters.canvasHardware.hanger +
      parameters.canvasHardware.wire;
    // Add mountboard cost if manually selected on canvas
    printMaterialsCost = mountboardCost;
  } else if (inputs.artType === 'print') {
    printMaterialsCost =
      mountboardCost +
      sizedMaterials.backingboard +
      sizedMaterials.glass +
      sizedMaterials.tapeHanging;
  }

  // 5. Calculate materials total
  const rawMaterialsSubtotal =
    frameCost + treatmentCost + hardwareCost + printMaterialsCost;
  const materialsTotal = rawMaterialsSubtotal * parameters.materialsMultiplier;

  // 6. Calculate labor cost
  const laborCost = parameters.hourlyRate * inputs.laborHours;

  // 7. Calculate subtotal and final total
  const subtotal = laborCost + materialsTotal;
  const total = subtotal * (1 - inputs.discountPercent / 100);

  // 8. Size warning
  let sizeWarning = '';
  if (totalWithWaste > parameters.maxSizeWarning) {
    sizeWarning = 'NOTE: TOO LARGE, CUSTOM SIZE/PRICING';
  }

  return {
    area,
    perimeter,
    totalWithWaste,
    frameCost,
    treatmentCost,
    hardwareCost,
    printMaterialsCost,
    rawMaterialsSubtotal,
    materialsTotal,
    laborCost,
    subtotal,
    total,
    sizeWarning,
  };
}

function getFrameCostPerMeter(
  woodType: string,
  frameType: string,
  parameters: Parameters
): number {
  const costs = parameters.frameMaterialCosts[frameType as 'classic' | 'premium'];
  return costs?.[woodType as 'softwood' | 'hardwood' | 'walnut'] ?? 0;
}

export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export function formatCurrency(value: number): string {
  return `£${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value}%`;
}
