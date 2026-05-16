// Default parameters based on Excel audit report
import { Parameters } from './types';

export const DEFAULT_PARAMETERS: Parameters = {
  hourlyRate: 25,
  materialsMultiplier: 2,
  cuttingWaste: 0.2, // 20%
  frameMaterialCosts: {
    classic: {
      softwood: 2.50,
      hardwood: 4.00,
      walnut: 10.00,
    },
    premium: {
      softwood: 4.60,
      hardwood: 9.00,
      walnut: 15.00,
    },
  },
  canvasHardware: {
    clips: 2.00,
    hanger: 1.00,
    wire: 1.00,
  },
  printMaterials: {
    small: {
      mountboard: 2.00,
      backingboard: 1.00,
      glass: 7.00,
      tapeHanging: 3.00,
    },
    large: {
      mountboard: 3.00,
      backingboard: 2.00,
      glass: 12.00,
      tapeHanging: 3.00,
    },
  },
  treatmentCosts: {
    softwood: 3.00,
    hardwood: 2.00,
  },
  premiumMountboard: {
    small: 5.00,
    large: 8.00,
  },
  sizeThreshold: 150, // cm - threshold for small vs large print materials
  maxSizeWarning: 300, // cm - display warning above this
};

export const DEFAULT_INPUTS = {
  artType: 'print' as const,
  width: 30,
  height: 35,
  woodType: 'softwood' as const,
  frameType: 'classic' as const,
  mountboard: 'single' as const,
  treated: true,
  laborHours: 1.5,
  discountPercent: 10,
};
