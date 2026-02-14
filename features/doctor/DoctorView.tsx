
import React, { useState, useMemo } from 'react';
import { Search, User, Stethoscope, FileText, Send, Trash2, Plus, Pill, X, Edit3, Check, History as HistoryIcon, Clock, Calendar, ChevronDown, RefreshCcw, Filter, XCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { TRANSLATIONS } from '../../constants';
import { Button } from '../../components/ui/Button';
import { CustomerSelectionModal } from '../pos/components/CustomerSelectionModal';
import { Customer, Product, PrescriptionItem, Prescription } from '../../types';

// Constants for Dosage Selection
const FREQUENCIES = ["Once", "Twice", "3 Times", "4 Times", "Every 4h", "Every 6h", "Every 8h", "Every 12h"];
const PERIODS = ["Daily", "Weekly", "Monthly", "As Needed"];
const TIMINGS = ["No Timing", "Before Meal", "After Meal", "With Food", "At Bedtime", "Morning", "Evening"];
const DURATIONS = ["3 Days", "5 Days", "7 Days", "10 Days", "14 Days", "1 Month", "3 Months", "Ongoing"];

export const DoctorView: React.FC = () => {
  const { lang, products, addPrescription, prescriptions, customers } = useStore();
  
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  // New Rx State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([]);
  const [doctorName, setDoctorName] = useState('Dr. Smith');
  const [rxNote, setRxNote] = useState('');

  // History Filter State
  const [historySearch, setHistorySearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'filled' | 'cancelled'>('all');
  const [doctorFilter, setDoctorFilter] = useState('all');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.nameAr.includes(productSearch) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Derive unique doctors for filter dropdown
  const doctors = useMemo(() => Array.from(new Set(prescriptions.map(p => p.doctorName))).sort(), [prescriptions]);

  const filteredHistory = useMemo(() => {
    return prescriptions.filter(rx => {
      // 1. Text Search
      const searchMatch = 
        rx.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
        rx.id.includes(historySearch) ||
        (rx.notes && rx.notes.toLowerCase().includes(historySearch.toLowerCase()));
      
      // 2. Status Filter
      const statusMatch = statusFilter === 'all' || rx.status === statusFilter;

      // 3. Doctor Filter
      const doctorMatch = doctorFilter === 'all' || rx.doctorName === doctorFilter;

      // 4. Date Filter
      let dateMatch = true;
      const rxDate = new Date(rx.createdAt);
      if (dateRange.start) {
          const start = new Date(dateRange.start);
          // Set to beginning of day
          start.setHours(0,0,0,0); 
          if (rxDate < start) dateMatch = false;
      }
      if (dateRange.end) {
          const end = new Date(dateRange.end);
          // Set to end of day
          end.setHours(23,59,59,999);
          if (rxDate > end) dateMatch = false;
      }

      return searchMatch && statusMatch && doctorMatch && dateMatch;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [prescriptions, historySearch, statusFilter, doctorFilter, dateRange]);

  const clearFilters = () => {
    setHistorySearch('');
    setDateRange({ start: '', end: '' });
    setStatusFilter('all');
    setDoctorFilter('all');
  };

  const addItem = (product: Product) => {
    const existing = rxItems.find(i => i.productId === product.id);
    if (existing) return;

    setRxItems([...rxItems, {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      dosage: 'Once Daily for 5 Days',
      dosageDetails: {
        frequency: 'Once',
        period: 'Daily',
        timing: 'No Timing',
        duration: '5 Days'
      }
    }]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setRxItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeItem = (productId: string) => {
    setRxItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateDosageDetail = (productId: string, field: keyof NonNullable<PrescriptionItem['dosageDetails']>, value: string) => {
    setRxItems(prev => prev.map(item => {
      if (item.productId !== productId) return item;
      
      const currentDetails = item.dosageDetails || { frequency: 'Once', period: 'Daily', timing: 'No Timing', duration: '5 Days' };
      const newDetails = { ...currentDetails, [field]: value };
      
      // Construct readable string
      let readable = `${newDetails.frequency} ${newDetails.period}`;
      if (newDetails.timing && newDetails.timing !== 'No Timing') readable += ` ${newDetails.timing}`;
      if (newDetails.duration) readable += ` for ${newDetails.duration}`;

      return {
        ...item,
        dosage: readable,
        dosageDetails: newDetails
      };
    }));
  };

  const handleSave = () => {
    if (!selectedCustomer) {
      alert('Please select a patient.');
      return;
    }
    if (rxItems.length === 0) {
      alert('Prescription is empty.');
      return;
    }

    const newRx: Prescription = {
      id: Date.now().toString(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      doctorName: doctorName,
      items: rxItems,
      status: 'pending',
      createdAt: Date.now(),
      notes: rxNote
    };

    addPrescription(newRx);
    alert(TRANSLATIONS.rxSent[lang]);
    
    // Reset
    setSelectedCustomer(null);
    setRxItems([]);
    setRxNote('');
    setProductSearch('');
  };

  const handleRefill = (rx: Prescription) => {
    // Attempt to find the full customer object
    const originalCustomer = customers.find(c => c.id === rx.customerId);
    
    // Set customer (create partial fallback if deleted from CRM)
    setSelectedCustomer(originalCustomer || {
      id: rx.customerId,
      name: rx.customerName,
      phone: 'Unknown',
      points: 0,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: Date.now(),
      joinedAt: Date.now()
    });

    // Clone items deeply to avoid reference issues
    setRxItems(rx.items.map(item => ({...item, dosageDetails: item.dosageDetails ? {...item.dosageDetails} : undefined})));
    setRxNote(rx.notes || '');
    
    // Switch to edit tab
    setActiveTab('new');
  };

  const SelectInput = ({ value, options, onChange, label }: { value: string, options: string[], onChange: (val: string) => void, label: string }) => (
    <div className="relative group">
      <label className="text-[10px] uppercase font-bold text-gray-400 absolute -top-1.5 left-2 bg-white dark:bg-gray-800 px-1 z-10">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-cyan-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors pt-2.5"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans relative">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm flex-shrink-0">
        <h2 className="text-2xl font-black italic flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Stethoscope className="text-cyan-600" /> {TRANSLATIONS.doctor[lang]}
        </h2>
        
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button onClick={() => setActiveTab('new')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-white dark:bg-gray-700 shadow-sm text-cyan-700 dark:text-cyan-400' : 'text-gray-500'}`}>
              <Edit3 size={14} /> New Rx
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 shadow-sm text-cyan-700 dark:text-cyan-400' : 'text-gray-500'}`}>
              <HistoryIcon size={14} /> History
            </button>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <input 
                className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
             />
           </div>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Product Selection */}
          <div className="w-1/3 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  placeholder="Search Medicines..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {filteredProducts.map(product => {
                  const isSelected = rxItems.some(i => i.productId === product.id);
                  return (
                    <button 
                      key={product.id}
                      onClick={() => addItem(product)}
                      disabled={isSelected}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center group
                        ${isSelected 
                          ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 opacity-60 cursor-default' 
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-cyan-500 hover:shadow-md'}
                      `}
                    >
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">{product.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{product.sku}</span>
                          <span>Stock: {product.stock}</span>
                        </div>
                      </div>
                      {!isSelected && (
                        <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={16} />
                        </div>
                      )}
                    </button>
                  );
              })}
            </div>
          </div>

          {/* Right: Prescription Pad */}
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
            <div className="p-6 max-w-4xl mx-auto w-full flex-1 flex flex-col h-full overflow-hidden">
                
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
                  {/* Patient Header */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Patient</h3>
                            {selectedCustomer ? (
                              <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedCustomer.name}</span>
                                  <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                              </div>
                            ) : (
                              <button onClick={() => setIsCustomerModalOpen(true)} className="text-lg font-bold text-cyan-600 hover:underline flex items-center gap-1">
                                Select Patient <Plus size={14} />
                              </button>
                            )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">Date</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString()}</div>
                      </div>
                  </div>

                  {/* Rx Body */}
                  <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800 relative">
                      <div className="absolute top-6 right-6 opacity-5 pointer-events-none">
                        <Pill size={200} />
                      </div>

                      {rxItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <FileText size={64} strokeWidth={1} />
                            <p className="mt-4 font-medium">Add medicines from the list</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                            {rxItems.map(item => (
                              <div key={item.productId} className="flex flex-col gap-4 p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-cyan-200 transition-colors shadow-sm">
                                  
                                  <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                      <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-slate-400">
                                        Rx
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.productName}</h3>
                                        <p className="text-xs text-slate-500">Structured Dosage</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg">
                                        <button onClick={() => updateQuantity(item.productId, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">-</button>
                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700">+</button>
                                      </div>
                                      <button onClick={() => removeItem(item.productId)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                      <SelectInput 
                                        label="Frequency" 
                                        value={item.dosageDetails?.frequency || 'Once'} 
                                        options={FREQUENCIES} 
                                        onChange={(val) => updateDosageDetail(item.productId, 'frequency', val)}
                                      />
                                      <SelectInput 
                                        label="Period" 
                                        value={item.dosageDetails?.period || 'Daily'} 
                                        options={PERIODS} 
                                        onChange={(val) => updateDosageDetail(item.productId, 'period', val)}
                                      />
                                      <SelectInput 
                                        label="Timing" 
                                        value={item.dosageDetails?.timing || 'No Timing'} 
                                        options={TIMINGS} 
                                        onChange={(val) => updateDosageDetail(item.productId, 'timing', val)}
                                      />
                                      <SelectInput 
                                        label="Duration" 
                                        value={item.dosageDetails?.duration || '5 Days'} 
                                        options={DURATIONS} 
                                        onChange={(val) => updateDosageDetail(item.productId, 'duration', val)}
                                      />
                                  </div>
                              </div>
                            ))}
                        </div>
                      )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                      <textarea
                        placeholder="Doctor's Notes / Instructions..."
                        value={rxNote}
                        onChange={e => setRxNote(e.target.value)}
                        className="w-full h-20 mb-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-sm"
                      />
                      <div className="flex justify-end">
                        <Button 
                          variant="primary" 
                          size="lg" 
                          onClick={handleSave} 
                          disabled={!selectedCustomer || rxItems.length === 0}
                          className="bg-cyan-600 hover:bg-cyan-700 border-cyan-600 text-white rounded-xl shadow-lg shadow-cyan-500/20"
                        >
                            <Send size={18} className="mr-2" /> {TRANSLATIONS.sendToPharmacy[lang]}
                        </Button>
                      </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      ) : (
        // HISTORY VIEW
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 p-6">
           <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
             
             {/* Filter Dashboard */}
             <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs flex items-center gap-2">
                     <Filter size={14} /> Filter History
                   </h3>
                   {(historySearch || statusFilter !== 'all' || doctorFilter !== 'all' || dateRange.start || dateRange.end) && (
                       <button onClick={clearFilters} className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold">
                         <XCircle size={14} /> Clear Filters
                       </button>
                   )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="Search Patient/ID..."
                            value={historySearch}
                            onChange={e => setHistorySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm font-medium transition-all"
                        />
                    </div>
                    
                    {/* Status */}
                    <div className="relative group">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm font-medium appearance-none transition-all cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="filled">Filled</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-cyan-500 transition-colors" />
                    </div>

                    {/* Doctor */}
                    <div className="relative group">
                        <select
                            value={doctorFilter}
                            onChange={e => setDoctorFilter(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm font-medium appearance-none transition-all cursor-pointer"
                        >
                            <option value="all">All Doctors</option>
                            {doctors.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-cyan-500 transition-colors" />
                    </div>

                    {/* Date Range Start */}
                    <div className="relative group">
                        <input 
                            type="date"
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm font-medium text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
                            placeholder="Start Date"
                        />
                    </div>

                    {/* Date Range End */}
                    <div className="relative group">
                        <input 
                            type="date"
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm font-medium text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
                            placeholder="End Date"
                        />
                    </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4">
                {filteredHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <HistoryIcon size={48} className="mb-4 opacity-50"/>
                    <p className="font-medium">No prescriptions found matching criteria.</p>
                  </div>
                ) : (
                  filteredHistory.map(rx => (
                    <div key={rx.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                       <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                          <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">RX #{rx.id.slice(-6)}</span>
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                  rx.status === 'filled' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  rx.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                  {rx.status}
                                </span>
                             </div>
                             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{rx.customerName}</h3>
                             <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><User size={14}/> {rx.doctorName}</span>
                                <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(rx.createdAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock size={14}/> {new Date(rx.createdAt).toLocaleTimeString()}</span>
                             </div>
                          </div>
                          
                          {rx.notes && (
                            <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm text-amber-800 dark:text-amber-200 md:max-w-xs">
                               <div className="font-bold text-xs uppercase mb-1 flex items-center gap-1"><FileText size={10}/> Note</div>
                               {rx.notes}
                            </div>
                          )}
                       </div>

                       <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                          {rx.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-slate-100 dark:border-slate-700">
                               <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 flex items-center justify-center font-bold text-xs">
                                 {item.quantity}x
                               </div>
                               <div className="overflow-hidden">
                                 <div className="font-bold text-sm truncate">{item.productName}</div>
                                 <div className="text-xs text-slate-500 truncate">{item.dosage}</div>
                               </div>
                            </div>
                          ))}
                       </div>

                       {/* Action Footer for History Item */}
                       <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="text-xs text-slate-400">
                             Prescribed by {rx.doctorName}
                          </div>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => handleRefill(rx)} 
                            className="rounded-lg text-xs hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400"
                          >
                             <RefreshCcw size={14} className="mr-2" /> Refill Prescription
                          </Button>
                       </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      )}

      <CustomerSelectionModal 
         isOpen={isCustomerModalOpen} 
         onClose={() => setIsCustomerModalOpen(false)} 
         onSelect={setSelectedCustomer} 
      />
    </div>
  );
};
