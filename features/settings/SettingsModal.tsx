import type React from 'react';
import { useEffect, useState } from 'react';
import { Cpu, KeyRound, Monitor, MonitorUp, Printer, Receipt, RefreshCw, Search, Volume2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MOCK_PRODUCTS, TRANSLATIONS } from '../../constants';
import type { HardwareConfig } from '../../types';
import { Button } from '../../components/ui/Button';
import { printReceipt } from '../../utils/hardware';
import {
  clearOpenRouterKey,
  filterModels,
  loadOpenRouterSettings,
  OPENROUTER_MODELS_URL,
  type OpenRouterModel,
  parseModelCatalog,
  saveOpenRouterKey,
  saveOpenRouterModel
} from '../ai/openrouter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const priceLabel = (price: string) => {
  const value = Number(price);
  return Number.isFinite(value) ? `$${(value * 1_000_000).toFixed(value === 0 ? 0 : 3)}/M` : 'N/A';
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { lang, hardwareConfig, updateHardwareConfig } = useStore();
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [manualModel, setManualModel] = useState('');
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [modelSearch, setModelSearch] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [catalogStatus, setCatalogStatus] = useState('');
  const [keyStatus, setKeyStatus] = useState('');
  const [loadingModels, setLoadingModels] = useState(false);

  const refreshModels = async () => {
    setLoadingModels(true);
    setCatalogStatus('');
    try {
      const response = await fetch(OPENROUTER_MODELS_URL);
      if (!response.ok) throw new Error(`Model catalog request failed (${response.status}).`);
      const parsed = parseModelCatalog(await response.json());
      setModels(parsed);
      setCatalogStatus(`${parsed.length} live models loaded.`);
    } catch (error: unknown) {
      setCatalogStatus(error instanceof Error ? error.message : 'Could not load the OpenRouter model catalog.');
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const settings = loadOpenRouterSettings(localStorage);
    setApiKey(settings.apiKey);
    setSelectedModel(settings.modelId);
    setManualModel(settings.modelId);
    setKeyStatus('');
    void refreshModels();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggle = (key: keyof HardwareConfig) => {
    updateHardwareConfig({ ...hardwareConfig, [key]: !hardwareConfig[key] });
  };

  const selectModel = (modelId: string) => {
    saveOpenRouterModel(localStorage, modelId);
    setSelectedModel(modelId.trim());
    setManualModel(modelId.trim());
  };

  const saveKey = () => {
    try {
      saveOpenRouterKey(localStorage, apiKey);
      setKeyStatus('Saved only in this browser.');
    } catch (error: unknown) {
      setKeyStatus(error instanceof Error ? error.message : 'Could not save the key.');
    }
  };

  const clearKey = () => {
    clearOpenRouterKey(localStorage);
    setApiKey('');
    setKeyStatus('Browser key cleared.');
  };

  const openCustomerDisplay = () => {
    window.open(`${window.location.origin}${window.location.pathname}?mode=customer`, 'LuminaCustomerDisplay', 'width=800,height=600,menubar=no,toolbar=no');
  };

  const handleTestPrint = () => {
    const dummyOrder: any = {
      id: 'TEST-001',
      items: [
        { product: MOCK_PRODUCTS[0], quantity: 1, selectedVariants: [] },
        { product: MOCK_PRODUCTS[1], quantity: 2, selectedVariants: [] }
      ],
      subtotal: 12.50,
      discountAmount: 0,
      total: 12.50,
      createdAt: Date.now()
    };
    printReceipt(dummyOrder, hardwareConfig, lang);
  };

  const visibleModels = filterModels(models, modelSearch, freeOnly);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Monitor className="text-lumina-500" /> Settings
          </h2>
          <button onClick={onClose} aria-label="Close Settings" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <section className="space-y-4" aria-labelledby="openrouter-settings-heading">
            <h3 id="openrouter-settings-heading" className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Cpu size={16} /> OpenRouter BYOK
            </h3>
            <p className="text-xs text-gray-500">Your key stays in this browser and is sent directly to OpenRouter. Lumina has no app key or proxy.</p>

            <div className="space-y-2">
              <label htmlFor="openrouter-key" className="text-sm font-semibold flex items-center gap-2"><KeyRound size={15} /> Browser key</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="openrouter-key"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Paste your OpenRouter key"
                  className="flex-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                />
                <Button size="sm" onClick={saveKey}>Save key</Button>
                <Button size="sm" variant="secondary" onClick={clearKey}>Clear key</Button>
              </div>
              {keyStatus && <p className="text-xs text-gray-500" role="status">{keyStatus}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={modelSearch}
                    onChange={(event) => setModelSearch(event.target.value)}
                    placeholder="Search model name or ID"
                    className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg">
                  <input type="checkbox" checked={freeOnly} onChange={(event) => setFreeOnly(event.target.checked)} /> Free only
                </label>
                <Button size="sm" variant="secondary" onClick={() => void refreshModels()} disabled={loadingModels}>
                  <RefreshCw size={15} className={loadingModels ? 'animate-spin mr-1' : 'mr-1'} /> Refresh models
                </Button>
              </div>
              <p className="text-xs text-gray-500" role="status">{loadingModels ? 'Loading live OpenRouter models…' : catalogStatus}</p>

              <div className="max-h-56 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
                {visibleModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => selectModel(model.id)}
                    aria-label={`Select ${model.id}`}
                    className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedModel === model.id ? 'bg-lumina-50 dark:bg-lumina-950 border-l-4 border-lumina-500' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate">{model.name}</div>
                        <div className="font-mono text-xs text-gray-500 break-all">{model.id}</div>
                      </div>
                      {model.isFree && <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-1 rounded">Free</span>}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      Context: {model.contextLength?.toLocaleString() || 'N/A'} · Input {priceLabel(model.promptPrice)} · Output {priceLabel(model.completionPrice)}
                    </div>
                  </button>
                ))}
                {!loadingModels && visibleModels.length === 0 && <p className="p-4 text-sm text-gray-500">No returned models match this filter.</p>}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={manualModel}
                  onChange={(event) => setManualModel(event.target.value)}
                  placeholder="Manual model ID"
                  className="flex-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono"
                />
                <Button size="sm" variant="secondary" onClick={() => selectModel(manualModel)}>Use model ID</Button>
              </div>
              <p className="text-xs text-gray-500">Selected model: <span className="font-mono">{selectedModel || 'None — selection required'}</span></p>
            </div>
          </section>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Printer size={16} /> Printer & Drawer</h3>
            <div className="flex items-center justify-between">
              <span>{TRANSLATIONS.autoPrint[lang]}</span>
              <input type="checkbox" checked={hardwareConfig.autoPrintReceipt} onChange={() => toggle('autoPrintReceipt')} className="w-5 h-5 accent-lumina-500" />
            </div>
            <div className="flex items-center justify-between">
              <span>{TRANSLATIONS.kickDrawer[lang]}</span>
              <input type="checkbox" checked={hardwareConfig.kickDrawer} onChange={() => toggle('kickDrawer')} className="w-5 h-5 accent-lumina-500" />
            </div>
            <div className="flex items-center justify-between">
              <span>{TRANSLATIONS.printerWidth[lang]}</span>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['58mm', '80mm'] as const).map((width) => (
                  <button key={width} onClick={() => updateHardwareConfig({ ...hardwareConfig, printerWidth: width })} className={`px-3 py-1 rounded text-xs font-bold ${hardwareConfig.printerWidth === width ? 'bg-white dark:bg-gray-700 shadow-sm' : 'opacity-50'}`}>{width}</button>
                ))}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleTestPrint} className="w-full"><Receipt size={16} className="mr-2" /> {TRANSLATIONS.testPrint[lang]}</Button>
          </section>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><MonitorUp size={16} /> UX & Display</h3>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Volume2 size={16} /> {TRANSLATIONS.soundEffects[lang]}</span>
              <input type="checkbox" checked={hardwareConfig.soundEnabled} onChange={() => toggle('soundEnabled')} className="w-5 h-5 accent-lumina-500" />
            </div>
            <div className="flex items-center justify-between">
              <span>{TRANSLATIONS.customerDisplay[lang]}</span>
              <input type="checkbox" checked={hardwareConfig.showCustomerDisplay} onChange={() => toggle('showCustomerDisplay')} className="w-5 h-5 accent-lumina-500" />
            </div>
            <Button variant="primary" onClick={openCustomerDisplay} className="w-full">{TRANSLATIONS.openDisplay[lang]}</Button>
            <p className="text-xs text-gray-500 text-center">Opens a new window. Drag to secondary screen.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
