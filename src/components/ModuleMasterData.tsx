import React, { useState } from 'react';
import { Product, ProductionBatch, StageRecord, UserRole } from '../types';
import { STAGES_LIST } from '../utils/storage';
import { getBatchSummaryMetrics } from '../utils/rules';
import { 
  Tag, 
  Plus, 
  Layers, 
  Package, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  X, 
  Eye, 
  Activity, 
  TrendingUp, 
  Scissors, 
  Sparkles 
} from 'lucide-react';

interface ModuleMasterDataProps {
  products: Product[];
  batches: ProductionBatch[];
  records: StageRecord[];
  selectedBatchNo: string;
  onSelectBatch: (batchNo: string) => void;
  onNavigateTo: (tab: 'tracker' | 'dashboard' | 'reports') => void;
  onAddProduct: (product: Product) => void;
  onAddBatch: (batch: ProductionBatch) => void;
  currentRole: UserRole;
}

export const ModuleMasterData: React.FC<ModuleMasterDataProps> = ({
  products,
  batches,
  records,
  selectedBatchNo,
  onSelectBatch,
  onNavigateTo,
  onAddProduct,
  onAddBatch,
  currentRole
}) => {
  const [activeTab, setActiveTab] = useState<'batches' | 'products'>('batches');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // State for the Batch Details Card Modal
  const [activeDetailBatch, setActiveDetailBatch] = useState<ProductionBatch | null>(null);

  // New Batch Form State
  const [batchNo, setBatchNo] = useState(() => `BATCH-2026-00${batches.length + 1}`);
  const [selectedProductCode, setSelectedProductCode] = useState(products[0]?.product_code || '');
  const [batchSize, setBatchSize] = useState('M');
  const [batchColor, setBatchColor] = useState('White');
  const [plannedQty, setPlannedQty] = useState(500);
  const [targetDate, setTargetDate] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [batchNotes, setBatchNotes] = useState('');
  const [createdBy, setCreatedBy] = useState('Production Supervisor');

  // New Product Form State
  const [prodCode, setProdCode] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Shirt');
  const [prodSizes, setProdSizes] = useState('S, M, L, XL, XXL');
  const [prodColors, setProdColors] = useState('White, Blue, Black');
  const [prodDesc, setProdDesc] = useState('');

  const canEdit = currentRole === 'Admin' || currentRole === 'Stage Supervisor';

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.product_code === selectedProductCode) || products[0];
    const newBatch: ProductionBatch = {
      batch_no: batchNo.trim(),
      product_code: prod.product_code,
      product_name: prod.product_name,
      size: batchSize,
      color: batchColor,
      date_created: new Date().toISOString().split('T')[0],
      total_planned_qty: Number(plannedQty),
      current_stage: 'Cutting',
      status: 'Active',
      created_by: createdBy,
      target_delivery_date: targetDate,
      notes: batchNotes || undefined
    };
    onAddBatch(newBatch);
    setIsBatchModalOpen(false);
    setBatchNo(`BATCH-2026-00${batches.length + 2}`);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      product_code: prodCode.trim().toUpperCase(),
      product_name: prodName.trim(),
      category: prodCategory,
      sizes_available: prodSizes.split(',').map(s => s.trim()).filter(Boolean),
      colors_available: prodColors.split(',').map(c => c.trim()).filter(Boolean),
      description: prodDesc.trim() || undefined,
      created_at: new Date().toISOString().split('T')[0]
    });
    setIsProductModalOpen(false);
    setProdCode('');
    setProdName('');
  };

  // Helper for detail card
  const detailBatchMetrics = activeDetailBatch ? getBatchSummaryMetrics(activeDetailBatch, records) : null;
  const detailBatchRecords = activeDetailBatch ? records.filter(r => r.batch_no === activeDetailBatch.batch_no) : [];
  const latestRecord = detailBatchRecords.length > 0 
    ? [...detailBatchRecords].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Master Data & Production Orders</span>
          </h2>
          <p className="text-xs text-slate-400">
            Click on any batch card to inspect its full master specifications, latest stage update, and live accountability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveTab('batches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'batches' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Batches ({batches.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Product Master ({products.length})
            </button>
          </div>

          {canEdit && (
            activeTab === 'batches' ? (
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Batch</span>
              </button>
            ) : (
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Garment</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* BATCHES TAB: CARDS VIEW & CLICKABLE INTERACTION */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((b) => {
              const bMetrics = getBatchSummaryMetrics(b, records);
              const isSelected = selectedBatchNo === b.batch_no;
              const bRecs = records.filter(r => r.batch_no === b.batch_no);
              const completedCount = bRecs.length;
              const progressPercent = Math.round((completedCount / STAGES_LIST.length) * 100);

              return (
                <div
                  key={b.batch_no}
                  onClick={() => {
                    setActiveDetailBatch(b);
                    onSelectBatch(b.batch_no);
                  }}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:border-indigo-500/80 group relative overflow-hidden ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-800'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-sm text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      {b.batch_no}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      b.status === 'Completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {b.status === 'Completed' ? 'Completed' : `Stage: ${b.current_stage}`}
                    </span>
                  </div>

                  {/* Garment Title */}
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-100 transition-colors">
                    {b.product_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <span>Variant: <strong className="text-slate-200">{b.color} / {b.size}</strong></span>
                    <span>•</span>
                    <span>Planned: <strong className="text-amber-300">{b.total_planned_qty} pcs</strong></span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Production Progress</span>
                      <span className="font-bold text-slate-200">{completedCount} of 5 stages ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          b.status === 'Completed' ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-amber-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Metric Stats */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-center text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Passed</span>
                      <span className="font-bold text-emerald-400">{bMetrics.finalPassedOutput} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Defects</span>
                      <span className="font-bold text-amber-400">-{bMetrics.totalRejected}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Missing</span>
                      <span className={`font-bold ${bMetrics.totalMissing > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        -{bMetrics.totalMissing}
                      </span>
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {b.date_created}
                    </span>
                    <span className="text-indigo-400 font-semibold group-hover:text-indigo-300 flex items-center gap-1">
                      <span>Click to view details</span>
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Table View summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-sm">Batch Quick Table (Click any row to open card)</h3>
              <span className="text-xs text-slate-400">Total: {batches.length} orders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Batch No</th>
                    <th className="p-3">Garment Item</th>
                    <th className="p-3">Variant</th>
                    <th className="p-3 text-right">Planned Master</th>
                    <th className="p-3 text-center">Current Stage</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Created By</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {batches.map((b) => (
                    <tr
                      key={b.batch_no}
                      onClick={() => {
                        setActiveDetailBatch(b);
                        onSelectBatch(b.batch_no);
                      }}
                      className="hover:bg-indigo-950/20 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-bold text-indigo-400">{b.batch_no}</td>
                      <td className="p-3 font-semibold text-slate-100">{b.product_name}</td>
                      <td className="p-3 text-slate-300">
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-indigo-300 font-medium">
                          {b.color} / {b.size}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-amber-300 text-sm">
                        {b.total_planned_qty} pcs
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {b.current_stage}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{b.created_by}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.product_code} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-1 bg-indigo-950 text-indigo-300 rounded border border-indigo-800">
                  {p.product_code}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {p.category}
                </span>
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{p.product_name}</h4>
                {p.description && <p className="text-xs text-slate-400 mt-1">{p.description}</p>}
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Sizes Available:</span>
                  <div className="flex flex-wrap gap-1">
                    {p.sizes_available.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-slate-300 font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Colors Available:</span>
                  <div className="flex flex-wrap gap-1">
                    {p.colors_available.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-slate-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: BATCH DETAILS & CURRENT UPDATE CARD */}
      {activeDetailBatch && detailBatchMetrics && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-fadeIn relative my-8">
            {/* Close button */}
            <button
              onClick={() => setActiveDetailBatch(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Badge & Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-lg">
                {activeDetailBatch.batch_no}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeDetailBatch.status === 'Completed'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {activeDetailBatch.status === 'Completed' ? '✅ Completed Run' : `⏳ Active at ${activeDetailBatch.current_stage}`}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {activeDetailBatch.product_name}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Master Order Specifications & Live Production Stage Accountability
            </p>

            {/* Master Specifications 4-column Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Style Code</span>
                <span className="font-semibold text-slate-200">{activeDetailBatch.product_code}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Variant (Color / Size)</span>
                <span className="font-semibold text-indigo-300">{activeDetailBatch.color} / {activeDetailBatch.size}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Planned Master Qty</span>
                <span className="font-bold text-amber-300 text-sm">{activeDetailBatch.total_planned_qty} pcs</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Created By</span>
                <span className="font-semibold text-slate-200">{activeDetailBatch.created_by}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Date Started</span>
                <span className="text-slate-300">{activeDetailBatch.date_created}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Target Delivery</span>
                <span className="text-slate-300">{activeDetailBatch.target_delivery_date || 'Standard Schedule'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block mb-0.5">Notes / Instructions</span>
                <span className="text-slate-300 italic">{activeDetailBatch.notes || 'No special notes recorded.'}</span>
              </div>
            </div>

            {/* LIVE UPDATE CARD SECTION */}
            <div className="bg-indigo-950/30 border border-indigo-800/60 p-4 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white">Live Production Status Update</h4>
                </div>
                <span className="text-xs font-extrabold text-indigo-300">
                  {detailBatchMetrics.efficiency}% Yield
                </span>
              </div>

              {/* Progress metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Current Output</span>
                  <span className="text-base font-bold text-emerald-400">{detailBatchMetrics.finalPassedOutput} pcs</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Defects / Scrap</span>
                  <span className="text-base font-bold text-amber-400">{detailBatchMetrics.totalRejected} pcs</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Shortage / Missing</span>
                  <span className={`text-base font-bold ${detailBatchMetrics.totalMissing > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {detailBatchMetrics.totalMissing} pcs
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Net Piece Loss</span>
                  <span className="text-base font-bold text-rose-300">{detailBatchMetrics.totalLoss} pcs</span>
                </div>
              </div>

              {/* Latest activity timestamp */}
              {latestRecord && (
                <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>
                    Latest update on <strong>{latestRecord.stage_name}</strong> stage by{' '}
                    <strong className="text-indigo-300">{latestRecord.operator_name}</strong>
                  </span>
                  <span className="text-[11px] text-slate-500">{new Date(latestRecord.submitted_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* STAGE BREAKDOWN TIMELINE */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Stage Execution Trail ({detailBatchRecords.length} of 5 completed)
              </h4>
              <div className="space-y-2">
                {STAGES_LIST.map((stage) => {
                  const rec = detailBatchRecords.find(r => r.stage_name === stage);
                  const isCurrent = activeDetailBatch.current_stage === stage;

                  return (
                    <div
                      key={stage}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        rec
                          ? 'bg-slate-950 border-emerald-900/40 text-slate-200'
                          : isCurrent
                          ? 'bg-amber-950/20 border-amber-800/60 text-amber-300'
                          : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {rec ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700" />
                        )}
                        <span className="font-bold">{stage}</span>
                      </div>

                      {rec ? (
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-semibold">Passed: {rec.qty_passed}</span>
                          {rec.qty_rejected > 0 && (
                            <span className="text-amber-400">Defects: -{rec.qty_rejected}</span>
                          )}
                          {rec.qty_missing > 0 && (
                            <span className="text-rose-400 font-bold">Missing: -{rec.qty_missing}</span>
                          )}
                          <span className="text-[10px] text-slate-400">({rec.operator_name})</span>
                        </div>
                      ) : isCurrent ? (
                        <span className="text-amber-300 text-[11px] font-semibold">Currently being processed</span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">Awaiting prior stage</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onSelectBatch(activeDetailBatch.batch_no);
                  setActiveDetailBatch(null);
                  onNavigateTo('dashboard');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                View in Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectBatch(activeDetailBatch.batch_no);
                  setActiveDetailBatch(null);
                  onNavigateTo('reports');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Inspect in Reports & Audit
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectBatch(activeDetailBatch.batch_no);
                  setActiveDetailBatch(null);
                  onNavigateTo('tracker');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <span>Open in Stage Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE BATCH */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-bold text-white mb-1">Create New Production Batch</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the planned master quantity that every production stage will track against.
            </p>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Batch Number (Unique ID)</label>
                <input
                  type="text"
                  required
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Garment / Product</label>
                <select
                  value={selectedProductCode}
                  onChange={(e) => setSelectedProductCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.product_code} value={p.product_code}>
                      {p.product_code} - {p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Size</label>
                  <input
                    type="text"
                    required
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                    placeholder="M"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Color</label>
                  <input
                    type="text"
                    required
                    value={batchColor}
                    onChange={(e) => setBatchColor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                    placeholder="Navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-bold mb-1">
                  Total Planned Qty (Master Baseline) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-amber-600/70 rounded-lg text-slate-100 font-bold text-base"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Every stage's loss will be calculated relative to this master number.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Created By</label>
                <input
                  type="text"
                  required
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes / Instructions (Optional)</label>
                <input
                  type="text"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                  placeholder="Special customer packaging or stitch standards"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/30"
                >
                  Launch Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-bold text-white mb-1">Add Garment Master Item</h3>
            <p className="text-xs text-slate-400 mb-4">Register a style pattern in the system.</p>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Code</label>
                  <input
                    type="text"
                    required
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    placeholder="SHT-004"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 cursor-pointer"
                  >
                    <option value="Shirt">Shirt</option>
                    <option value="Trouser">Trouser</option>
                    <option value="Jacket">Jacket</option>
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product / Garment Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Linen Slim Fit Shirt"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sizes Available (comma separated)</label>
                <input
                  type="text"
                  required
                  value={prodSizes}
                  onChange={(e) => setProdSizes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Colors Available (comma separated)</label>
                <input
                  type="text"
                  required
                  value={prodColors}
                  onChange={(e) => setProdColors(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                  placeholder="Fabric specs, wash care..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
