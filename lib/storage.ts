// LocalStorage utilities for persisting parameters and inputs
import { Parameters, CalculatorInputs } from './types';
import { DEFAULT_PARAMETERS, DEFAULT_INPUTS } from './default-parameters';

const STORAGE_KEY = 'aura_framing_parameters';
const INPUTS_KEY = 'aura_framing_inputs';
const CUSTOM_QUOTE_KEY = 'aura_framing_custom_quote';

export function loadParameters(): Parameters {
  if (typeof window === 'undefined') return DEFAULT_PARAMETERS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return { ...DEFAULT_PARAMETERS, ...parsed };
    }
  } catch (error) {
    console.error('Error loading parameters:', error);
  }

  return DEFAULT_PARAMETERS;
}

export function saveParameters(parameters: Parameters): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parameters));
  } catch (error) {
    console.error('Error saving parameters:', error);
  }
}

export function resetParameters(): Parameters {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_PARAMETERS;
}

// --- Input persistence across tabs ---

export function loadInputs(): CalculatorInputs {
  if (typeof window === 'undefined') return DEFAULT_INPUTS;
  try {
    const stored = localStorage.getItem(INPUTS_KEY);
    if (stored) {
      return { ...DEFAULT_INPUTS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading inputs:', error);
  }
  return DEFAULT_INPUTS;
}

export function saveInputs(inputs: CalculatorInputs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INPUTS_KEY, JSON.stringify(inputs));
  } catch (error) {
    console.error('Error saving inputs:', error);
  }
}

export interface CustomQuoteData {
  materialCost: number;
  laborCost: number;
  others: { title: string; amount: number; enabled: boolean }[];
}

export function loadCustomQuoteData(): CustomQuoteData | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CUSTOM_QUOTE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading custom quote data:', error);
  }
  return null;
}

export function saveCustomQuoteData(data: CustomQuoteData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_QUOTE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving custom quote data:', error);
  }
}
