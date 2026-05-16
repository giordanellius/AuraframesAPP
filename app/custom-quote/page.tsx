'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator, Settings, Download, FileText, Plus, Trash2 } from 'lucide-react';
import { CalculatorInputs, Parameters, MountboardType } from '@/lib/types';
import { formatCurrency, roundToHalf } from '@/lib/calculations';
import { DEFAULT_INPUTS } from '@/lib/default-parameters';
import { loadParameters, loadInputs, saveInputs, loadCustomQuoteData, saveCustomQuoteData } from '@/lib/storage';

interface OtherItem {
  title: string;
  amount: number;
  enabled: boolean;
}

const DEFAULT_OTHER: OtherItem = { title: 'Other', amount: 0, enabled: false };

export default function CustomQuotePage() {
  const [inputs, setInputs] = useState<CalculatorInputs>({ ...DEFAULT_INPUTS, discountPercent: 0 });
  const [parameters, setParameters] = useState<Parameters | null>(null);
  const [materialCost, setMaterialCost] = useState<number>(0);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [others, setOthers] = useState<OtherItem[]>([
    { title: 'Other 1', amount: 0, enabled: false },
    { title: 'Other 2', amount: 0, enabled: false },
  ]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    const params = loadParameters();
    setParameters(params);
    // Load shared inputs (selections shared with calculator tab)
    const saved = loadInputs();
    setInputs((prev) => ({ ...prev, ...saved }));
    // Load custom-quote-specific data
    const cqData = loadCustomQuoteData();
    if (cqData) {
      setMaterialCost(cqData.materialCost);
      setOthers(cqData.others);
    }
  }, []);

  // Recalculate labor when hours or params change
  useEffect(() => {
    if (parameters) {
      setLaborCost(parameters.hourlyRate * inputs.laborHours);
    }
  }, [inputs.laborHours, parameters]);

  const updateInput = (field: keyof CalculatorInputs, value: any) => {
    setInputs((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'artType') {
        updated.mountboard = value === 'canvas' ? 'none' : 'single';
      }
      saveInputs(updated);
      return updated;
    });
  };

  const updateOther = (index: number, field: keyof OtherItem, value: any) => {
    setOthers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      saveCustomQuoteData({ materialCost, laborCost, others: updated });
      return updated;
    });
  };

  // Calculate totals with rounding
  const multiplier = parameters?.materialsMultiplier ?? 2;
  const roundedMaterialMultiplied = roundToHalf(materialCost * multiplier);
  const roundedLabor = roundToHalf(laborCost);
  const activeOthers = others.filter((o) => o.enabled);
  const othersTotal = activeOthers.reduce((sum, o) => sum + o.amount, 0);
  const roundedMaterialAndLabour = roundToHalf(
    roundedMaterialMultiplied + roundedLabor + othersTotal
  );
  const roundedSubtotal = roundedMaterialAndLabour;
  const disc = inputs.discountPercent ?? 0;
  const roundedTotal = disc > 0
    ? roundToHalf(roundedSubtotal * (1 - disc / 100))
    : roundedSubtotal;

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Build others for PDF — only include changed items
      const pdfOthers = others
        .filter((o) => o.enabled && (o.title !== 'Other 1' && o.title !== 'Other 2' || o.amount !== 0))
        .filter((o) => o.title.trim() !== '' || o.amount !== 0)
        .map((o) => ({ title: o.title, amount: o.amount }));

      const response = await fetch('/api/generate-custom-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs,
          materialCost,
          laborCost,
          others: pdfOthers,
          discountPercent: inputs.discountPercent,
          materialsMultiplier: multiplier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Aura_Custom_Quote_${new Date().toISOString().split('T')[0]}.pdf`;
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

  if (!parameters) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B2635] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <Link href="/" className="tab-button">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Calculator
          </Link>
          <Link href="/settings" className="tab-button">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Settings
          </Link>
          <div className="tab-button active">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Custom Quote
          </div>
        </div>
      </div>

      {/* Form */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
              <input
                type="number"
                min="1"
                value={inputs.width || ''}
                onChange={(e) => updateInput('width', Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
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
          <h2 className="text-lg font-bold text-gray-800 mb-4">Treated/Hand Finish</h2>
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

        {/* Costs Section */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Costs (£)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Cost (Raw)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={materialCost || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaterialCost(val);
                  saveCustomQuoteData({ materialCost: val, laborCost, others });
                }}
                className="input-field"
                placeholder="Enter material cost"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Labor Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={inputs.laborHours || ''}
                onChange={(e) => updateInput('laborHours', Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={inputs.discountPercent || ''}
                onChange={(e) => updateInput('discountPercent', Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Other Items */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Other Items</h2>
          <div className="space-y-4">
            {others.map((item, index) => (
              <div key={index} className={`p-3 rounded-lg border-2 transition-colors ${
                item.enabled ? 'border-[#8B2635] bg-[#8B2635]/5' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => updateOther(index, 'enabled', !item.enabled)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      item.enabled
                        ? 'bg-[#8B2635] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {item.enabled ? 'Included' : 'Excluded'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Item Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateOther(index, 'title', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Item name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount (£)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.amount || ''}
                      onChange={(e) => updateOther(index, 'amount', Number(e.target.value))}
                      className="input-field text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Summary */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quote Summary</h2>
          <div className="space-y-3">
            <div className="output-card flex justify-between items-center">
              <span className="text-gray-700">Material (multiplied)</span>
              <span className="font-semibold">{formatCurrency(roundedMaterialMultiplied)}</span>
            </div>
            <div className="output-card flex justify-between items-center">
              <span className="text-gray-700">Labour</span>
              <span className="font-semibold">{formatCurrency(roundedLabor)}</span>
            </div>
            {activeOthers.map((o, i) => (
              <div key={i} className="output-card flex justify-between items-center">
                <span className="text-gray-700">{o.title || 'Other'}</span>
                <span className="font-semibold">{formatCurrency(roundToHalf(o.amount))}</span>
              </div>
            ))}
            {disc > 0 && (
              <>
                <div className="output-card flex justify-between items-center">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(roundedSubtotal)}</span>
                </div>
                <div className="output-card flex justify-between items-center">
                  <span className="text-gray-700">Discount ({disc}%)</span>
                  <span className="font-semibold">-{formatCurrency(roundedSubtotal - roundedTotal)}</span>
                </div>
              </>
            )}
            <div className="output-card bg-[#8B2635] text-white flex justify-between items-center border-[#8B2635]">
              <span className="font-bold text-lg">TOTAL</span>
              <span className="font-bold text-xl">{formatCurrency(roundedTotal)}</span>
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
              Download Custom Quote
            </>
          )}
        </button>
      </div>
    </div>
  );
}
