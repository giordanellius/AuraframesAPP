'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calculator, Settings, Save, RotateCcw, FileText } from 'lucide-react';
import { Parameters } from '@/lib/types';
import { loadParameters, saveParameters, resetParameters } from '@/lib/storage';
import { DEFAULT_PARAMETERS } from '@/lib/default-parameters';

export default function SettingsPage() {
  const [parameters, setParameters] = useState<Parameters>(DEFAULT_PARAMETERS);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const params = loadParameters();
    setParameters(params);
  }, []);

  const handleSave = () => {
    saveParameters(parameters);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default values?')) {
      const defaults = resetParameters();
      setParameters(defaults);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const updateParameter = (path: string, value: number) => {
    setParameters((prev) => {
      const newParams = { ...prev };
      const keys = path.split('.');
      let current: any = newParams;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      saveParameters(newParams);
      return newParams;
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <Link href="/" className="tab-button">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Calculator
          </Link>
          <div className="tab-button active">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Settings
          </div>
          <Link href="/custom-quote" className="tab-button">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Custom Quote
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Parameters */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Basic Parameters
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate (£)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.hourlyRate || ''}
                onChange={(e) =>
                  updateParameter('hourlyRate', Number(e.target.value))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials Multiplier
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={parameters.materialsMultiplier || ''}
                onChange={(e) =>
                  updateParameter('materialsMultiplier', Number(e.target.value))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cutting Waste (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={(parameters.cuttingWaste * 100) || ''}
                onChange={(e) =>
                  updateParameter('cuttingWaste', Number(e.target.value) / 100)
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Frame Material Costs */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Frame Material Costs (£/meter)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Wood
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Classic
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Softwood</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={parameters.frameMaterialCosts.classic.softwood || ''}
                      onChange={(e) =>
                        updateParameter(
                          'frameMaterialCosts.classic.softwood',
                          Number(e.target.value)
                        )
                      }
                      className="input-field"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={parameters.frameMaterialCosts.premium.softwood || ''}
                      onChange={(e) =>
                        updateParameter(
                          'frameMaterialCosts.premium.softwood',
                          Number(e.target.value)
                        )
                      }
                      className="input-field"
                    />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Hardwood</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={parameters.frameMaterialCosts.classic.hardwood || ''}
                      onChange={(e) =>
                        updateParameter(
                          'frameMaterialCosts.classic.hardwood',
                          Number(e.target.value)
                        )
                      }
                      className="input-field"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={parameters.frameMaterialCosts.premium.hardwood || ''}
                      onChange={(e) =>
                        updateParameter(
                          'frameMaterialCosts.premium.hardwood',
                          Number(e.target.value)
                        )
                      }
                      className="input-field"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Walnut</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={parameters.frameMaterialCosts.classic.walnut || ''}
                      onChange={(e) =>
                        updateParameter(
                          'frameMaterialCosts.classic.walnut',
                          Number(e.target.value)
                        )
                      }
                      className="input-field"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={parameters.frameMaterialCosts.premium.walnut || ''}
                      onChange={(e) =>
                        updateParameter(
                          'frameMaterialCosts.premium.walnut',
                          Number(e.target.value)
                        )
                      }
                      className="input-field"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Treatment Costs */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Treatment Costs (£)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Softwood Finish
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.treatmentCosts.softwood || ''}
                onChange={(e) =>
                  updateParameter(
                    'treatmentCosts.softwood',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hardwood / Walnut Finish
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.treatmentCosts.hardwood || ''}
                onChange={(e) =>
                  updateParameter(
                    'treatmentCosts.hardwood',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Premium Mountboard */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Premium Mountboard Costs (£)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Small (≤ threshold)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.premiumMountboard.small || ''}
                onChange={(e) =>
                  updateParameter('premiumMountboard.small', Number(e.target.value))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Large (&gt; threshold)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.premiumMountboard.large || ''}
                onChange={(e) =>
                  updateParameter('premiumMountboard.large', Number(e.target.value))
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Canvas Hardware */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Canvas Hardware Costs (£)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clips
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.canvasHardware.clips || ''}
                onChange={(e) =>
                  updateParameter('canvasHardware.clips', Number(e.target.value))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hanger
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.canvasHardware.hanger || ''}
                onChange={(e) =>
                  updateParameter('canvasHardware.hanger', Number(e.target.value))
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wire
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.canvasHardware.wire || ''}
                onChange={(e) =>
                  updateParameter('canvasHardware.wire', Number(e.target.value))
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Print Materials - Small */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Print Materials - Small (≤150cm) (£)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mountboard
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.printMaterials.small.mountboard || ''}
                onChange={(e) =>
                  updateParameter(
                    'printMaterials.small.mountboard',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backingboard
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.printMaterials.small.backingboard || ''}
                onChange={(e) =>
                  updateParameter(
                    'printMaterials.small.backingboard',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Glass
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.printMaterials.small.glass || ''}
                onChange={(e) =>
                  updateParameter(
                    'printMaterials.small.glass',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tape/Hanging
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.printMaterials.small.tapeHanging || ''}
                onChange={(e) =>
                  updateParameter(
                    'printMaterials.small.tapeHanging',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Print Materials - Large */}
        <div className="section-card">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Print Materials - Large (&gt;150cm) (£)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mountboard
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.printMaterials.large.mountboard || ''}
                onChange={(e) =>
                  updateParameter(
                    'printMaterials.large.mountboard',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backingboard
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.printMaterials.large.backingboard || ''}
                onChange={(e) =>
                  updateParameter(
                    'printMaterials.large.backingboard',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Glass
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.printMaterials.large.glass || ''}
                onChange={(e) =>
                  updateParameter(
                    'printMaterials.large.glass',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tape/Hanging
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parameters.printMaterials.large.tapeHanging || ''}
                onChange={(e) =>
                  updateParameter(
                    'printMaterials.large.tapeHanging',
                    Number(e.target.value)
                  )
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button onClick={handleSave} className="btn-primary flex-1">
            {isSaved ? (
              <>
                <span className="inline-block w-5 h-5 mr-2">✓</span>
                Saved!
              </>
            ) : (
              <>
                <Save className="inline-block w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
          <button onClick={handleReset} className="btn-secondary">
            <RotateCcw className="inline-block w-5 h-5 mr-2" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}