'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator, Settings, Download, AlertCircle, FileText } from 'lucide-react';
import { CalculatorInputs, CalculatedOutputs, Parameters } from '@/lib/types';
import { calculateQuote, formatCurrency, roundToHalf } from '@/lib/calculations';
import { DEFAULT_INPUTS } from '@/lib/default-parameters';
import { loadParameters, loadInputs, saveInputs } from '@/lib/storage';

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [parameters, setParameters] = useState<Parameters | null>(null);
  const [outputs, setOutputs] = useState<CalculatedOutputs | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Load parameters and persisted inputs on mount
  useEffect(() => {
    const params = loadParameters();
    setParameters(params);
    const saved = loadInputs();
    setInputs(saved);
  }, []);

  // Recalculate when inputs or parameters change
  useEffect(() => {
    if (parameters) {
      const results = calculateQuote(inputs, parameters);
      setOutputs(results);
    }
  }, [inputs, parameters]);

  const updateInput = (field: keyof CalculatorInputs, value: any) => {
    setInputs((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-set mountboard default when art type changes
      if (field === 'artType') {
        updated.mountboard = value === 'canvas' ? 'none' : 'single';
      }
      saveInputs(updated);
      return updated;
    });
  };

  const handleDownloadPDF = async () => {
    if (!outputs) return;

    setIsGeneratingPDF(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, outputs }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Aura_Framing_Quote_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!parameters || !outputs) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B2635] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calculator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <div className="tab-button active">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Calculator
          </div>
          <Link href="/settings" className="tab-button">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Settings
          </Link>
          <Link href="/custom-quote" className="tab-button">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Custom Quote
          </Link>
        </div>
      </div>

      {/* Calculator Form */}
      <div className="space-y-6">
        {/* Art Type */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Art Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateInput('artType', 'canvas')}
              className={`radio-option ${inputs.artType === 'canvas' ? 'active' : ''}`}
            >
              Canvas
            </button>
            <button
              onClick={() => updateInput('artType', 'print')}
              className={`radio-option ${inputs.artType === 'print' ? 'active' : ''}`}
            >
              Print
            </button>
          </div>
        </div>

        {/* Dimensions */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Dimensions (cm)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width
              </label>
              <input
                type="number"
                min="1"
                value={inputs.width || ''}
                onChange={(e) => updateInput('width', Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height
              </label>
              <input
                type="number"
                min="1"
                value={inputs.height || ''}
                onChange={(e) => updateInput('height', Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Wood Type */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Wood Type</h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => updateInput('woodType', 'softwood')}
              className={`radio-option ${inputs.woodType === 'softwood' ? 'active' : ''}`}
            >
              Softwood
            </button>
            <button
              onClick={() => updateInput('woodType', 'hardwood')}
              className={`radio-option ${inputs.woodType === 'hardwood' ? 'active' : ''}`}
            >
              Hardwood
            </button>
            <button
              onClick={() => updateInput('woodType', 'walnut')}
              className={`radio-option ${inputs.woodType === 'walnut' ? 'active' : ''}`}
            >
              Walnut
            </button>
          </div>
        </div>

        {/* Frame Type */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Frame Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateInput('frameType', 'classic')}
              className={`radio-option ${inputs.frameType === 'classic' ? 'active' : ''}`}
            >
              Classic
            </button>
            <button
              onClick={() => updateInput('frameType', 'premium')}
              className={`radio-option ${inputs.frameType === 'premium' ? 'active' : ''}`}
            >
              Premium/Canvas
            </button>
          </div>
        </div>

        {/* Mountboard */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Mountboard</h2>
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => updateInput('mountboard', 'none')}
              className={`radio-option ${inputs.mountboard === 'none' ? 'active' : ''}`}
            >
              None
            </button>
            <button
              onClick={() => updateInput('mountboard', 'single')}
              className={`radio-option ${inputs.mountboard === 'single' ? 'active' : ''}`}
            >
              Single
            </button>
            <button
              onClick={() => updateInput('mountboard', 'double')}
              className={`radio-option ${inputs.mountboard === 'double' ? 'active' : ''}`}
            >
              Double
            </button>
            <button
              onClick={() => updateInput('mountboard', 'premium')}
              className={`radio-option ${inputs.mountboard === 'premium' ? 'active' : ''}`}
            >
              Premium
            </button>
          </div>
        </div>

        {/* Treatment */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Treated/Hand Finish
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateInput('treated', true)}
              className={`radio-option ${inputs.treated ? 'active' : ''}`}
            >
              Yes
            </button>
            <button
              onClick={() => updateInput('treated', false)}
              className={`radio-option ${!inputs.treated ? 'active' : ''}`}
            >
              No
            </button>
          </div>
        </div>

        {/* Labor & Discount */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Labor & Discount
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labor Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={inputs.laborHours || ''}
                onChange={(e) =>
                  updateInput('laborHours', Number(e.target.value))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={inputs.discountPercent || ''}
                onChange={(e) =>
                  updateInput('discountPercent', Number(e.target.value))
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Size Warning */}
        {outputs?.sizeWarning && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-amber-800 font-medium">{outputs.sizeWarning}</p>
            </div>
          </div>
        )}

        {/* Calculated Outputs */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Calculated Results
          </h2>
          <div className="space-y-3">
            <div className="output-card flex justify-between items-center">
              <span className="text-gray-700">Area</span>
              <span className="font-semibold">{outputs?.area?.toFixed(0) ?? 0} cm²</span>
            </div>
            <div className="output-card flex justify-between items-center">
              <span className="text-gray-700">Frame Total</span>
              <span className="font-semibold">
                {outputs?.totalWithWaste?.toFixed(1) ?? 0} cm
              </span>
            </div>
            <div className="output-card flex justify-between items-center">
              <span className="text-gray-700">Labor Cost</span>
              <span className="font-semibold">
                {formatCurrency(roundToHalf(outputs?.laborCost ?? 0))}
              </span>
            </div>
            <div className="output-card flex justify-between items-center">
              <span className="text-gray-700">Materials Cost</span>
              <span className="font-semibold">
                {formatCurrency(roundToHalf(outputs?.materialsTotal ?? 0))}
              </span>
            </div>
            <div className="output-card flex justify-between items-center">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-semibold">
                {formatCurrency(roundToHalf(outputs?.subtotal ?? 0))}
              </span>
            </div>
            <div className="output-card bg-[#8B2635] text-white flex justify-between items-center border-[#8B2635]">
              <span className="font-bold text-lg">TOTAL</span>
              <span className="font-bold text-xl">
                {(() => {
                  const roundedSub = roundToHalf(outputs?.subtotal ?? 0);
                  const disc = inputs.discountPercent ?? 0;
                  return formatCurrency(disc > 0 ? roundToHalf(roundedSub * (1 - disc / 100)) : roundedSub);
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="btn-primary w-full flex items-center justify-center text-lg"
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Download Quote
            </>
          )}
        </button>
      </div>
    </div>
  );
}