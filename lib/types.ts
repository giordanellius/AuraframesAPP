// Type definitions for Aura Framing Calculator

export type ArtType = 'canvas' | 'print';
export type WoodType = 'softwood' | 'hardwood' | 'walnut';
export type FrameType = 'classic' | 'premium';
export type MountboardType = 'none' | 'single' | 'double' | 'premium';

export interface CalculatorInputs {
  artType: ArtType;
  width: number;
  height: number;
  woodType: WoodType;
  frameType: FrameType;
  mountboard: MountboardType;
  treated: boolean;
  laborHours: number;
  discountPercent: number;
}

export interface CalculatedOutputs {
  area: number;
  perimeter: number;
  totalWithWaste: number;
  frameCost: number;
  treatmentCost: number;
  hardwareCost: number;
  printMaterialsCost: number;
  rawMaterialsSubtotal: number;
  materialsTotal: number;
  laborCost: number;
  subtotal: number;
  total: number;
  sizeWarning: string;
}

export interface FrameMaterialCosts {
  classic: { softwood: number; hardwood: number; walnut: number };
  premium: { softwood: number; hardwood: number; walnut: number };
}

export interface Parameters {
  hourlyRate: number;
  materialsMultiplier: number;
  cuttingWaste: number;
  frameMaterialCosts: FrameMaterialCosts;
  canvasHardware: {
    clips: number;
    hanger: number;
    wire: number;
  };
  printMaterials: {
    small: {
      mountboard: number;
      backingboard: number;
      glass: number;
      tapeHanging: number;
    };
    large: {
      mountboard: number;
      backingboard: number;
      glass: number;
      tapeHanging: number;
    };
  };
  treatmentCosts: {
    softwood: number;
    hardwood: number;
  };
  premiumMountboard: {
    small: number;
    large: number;
  };
  sizeThreshold: number;
  maxSizeWarning: number;
}
