import React, { useState } from 'react';
import { Product, ProductionBatch, StageRecord, UserRole } from '../types';
import { STAGES_LIST } from '../utils/storage';
import { getBatchSummaryMetrics } from '../utils/rules';
import { 
  Plus, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  X, 
  Eye, 
  Activity 
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

  const detailBatchMetrics = activeDetailBatch ? getBatchSummaryMetrics(activeDetailBatch, records) : null;
  const detailBatchRecords = activeDetailBatch ? records.filter(r => r.batch_no === activeDetailBatch.batch_no) : [];
  const latestRecord = detailBatchRecords.length > 0 
    ? [...detailBatchRecords].sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Switcher */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-700" />
            <span>Master Data & Production Orders</span>
          </h2>
          <p className="text-xs text-stone-500">
            Click on any batch card to inspect its master specifications, stage timeline, and live accountability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-stone-100 p-1 rounded-lg border border-stone-200 flex items-center">
            <button
              onClick={() => setActiveTab('batches')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'batches' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Batches ({batches.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'products' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Product Master ({products.length})
            </button>
          </div>

          {canEdit && (
            activeTab === 'batches' ? (
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Batch</span>
              </button>
            ) : (
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Garment</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* BATCHES TAB */}
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
                  className={`bg-white border rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer transition-all duration-150 hover:shadow-md hover:border-stone-300 group ${
                    isSelected ? 'border-indigo-600 ring-1 ring-indigo-600/30' : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono font-bold text-xs text-indigo-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      {b.batch_no}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}>
                      {b.status === 'Completed' ? 'Completed' : `Stage: ${b.current_stage}`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mb-1 group-hover:text-indigo-900 transition-colors">
                    {b.product_name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-3.5">
                    <span>Variant: <strong className="text-stone-800">{b.color} / {b.size}</strong></span>
                    <span>•</span>
                    <span>Planned: <strong className="text-stone-900">{b.total_planned_qty} pcs</strong></span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-stone-800">{completedCount} of 5 stages ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          b.status === 'Completed' ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Metric Stats */}
                  <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200/80 text-center text-xs mb-3.5">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase">Passed</span>
                      <span className="font-bold text-emerald-700">{bMetrics.finalPassedOutput} pcs</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase">Defects</span>
                      <span className="font-bold text-amber-700">-{bMetrics.totalRejected}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase">Missing</span>
                      <span className={`font-bold ${bMetrics.totalMissing > 0 ? 'text-rose-700' : 'text-stone-400'}`}>
                        -{bMetrics.totalMissing}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-100">
                    <span className="flex items-center gap-1 text-[11px] text-stone-500">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {b.date_created}
                    </span>
                    <span className="text-indigo-700 font-semibold group-hover:text-indigo-900 flex items-center gap-1 text-[11px]">
                      <span>View details</span>
                      <Eye className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Table View */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mt-6">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-xs">Production Orders Table</h3>
              <span className="text-xs text-stone-500">{batches.length} orders total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
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
                <tbody className="divide-y divide-stone-100">
                  {batches.map((b) => (
                    <tr
                      key={b.batch_no}
                      onClick={() => {
                        setActiveDetailBatch(b);
                        onSelectBatch(b.batch_no);
                      }}
                      className="hover:bg-stone-50/80 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-bold text-indigo-700">{b.batch_no}</td>
                      <td className="p-3 font-semibold text-stone-900">{b.product_name}</td>
                      <td className="p-3 text-stone-600">
                        {b.color} / {b.size}
                      </td>
                      <td className="p-3 text-right font-bold text-stone-900">
                        {b.total_planned_qty} pcs
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                          {b.current_stage}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-stone-500">{b.created_by}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
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
            <div key={p.product_code} className="bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                  {p.product_code}
                </span>
                <span className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                  {p.category}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">{p.product_name}</h4>
                {p.description && <p className="text-xs text-stone-500 mt-1">{p.description}</p>}
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
                <div>
                  <span className="text-stone-500 block mb-1">Sizes Available:</span>
                  <div className="flex flex-wrap gap-1">
                    {p.sizes_available.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-stone-50 border border-stone-200 rounded text-stone-800 font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">Colors Available:</span>
                  <div className="flex flex-wrap gap-1">
                    {p.colors_available.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-stone-50 border border-stone-200 rounded text-stone-700">
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

      {/* MODAL: BATCH DETAILS CARD */}
      {activeDetailBatch && detailBatchMetrics && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl animate-fadeIn relative my-0 sm:my-8 max-h-[92vh] overflow-y-auto">
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3 sm:hidden" />

            <button
              onClick={() => setActiveDetailBatch(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                {activeDetailBatch.batch_no}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeDetailBatch.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {activeDetailBatch.status === 'Completed' ? 'Completed Run' : `Active at ${activeDetailBatch.current_stage}`}
              </span>
            </div>

            <h3 className="text-lg font-bold text-stone-900 mb-0.5">
              {activeDetailBatch.product_name}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Master Order Specifications & Live Production Stage Accountability
            </p>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200 mb-5 text-xs">
              <div>
                <span className="text-stone-500 block mb-0.5">Style Code</span>
                <span className="font-semibold text-stone-900">{activeDetailBatch.product_code}</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">Variant (Color / Size)</span>
                <span className="font-semibold text-indigo-700">{activeDetailBatch.color} / {activeDetailBatch.size}</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">Planned Master Qty</span>
                <span className="font-bold text-stone-900 text-sm">{activeDetailBatch.total_planned_qty} pcs</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">Created By</span>
                <span className="font-semibold text-stone-900">{activeDetailBatch.created_by}</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">Date Started</span>
                <span className="text-stone-700">{activeDetailBatch.date_created}</span>
              </div>
              <div>
                <span className="text-stone-500 block mb-0.5">Target Delivery</span>
                <span className="text-stone-700">{activeDetailBatch.target_delivery_date || 'Standard'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-stone-500 block mb-0.5">Notes / Instructions</span>
                <span className="text-stone-700 italic">{activeDetailBatch.notes || 'No special notes.'}</span>
              </div>
            </div>

            {/* Live Update Section */}
            <div className="bg-indigo-50/40 border border-indigo-200 p-4 rounded-xl mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-700" />
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">Live Production Status Update</h4>
                </div>
                <span className="text-xs font-extrabold text-indigo-900">
                  {detailBatchMetrics.efficiency}% Yield
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center mb-3">
                <div className="p-2 bg-white rounded-lg border border-stone-200 shadow-xs">
                  <span className="text-[10px] text-stone-500 uppercase block">Current Output</span>
                  <span className="text-sm font-bold text-emerald-700">{detailBatchMetrics.finalPassedOutput} pcs</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200 shadow-xs">
                  <span className="text-[10px] text-stone-500 uppercase block">Defective</span>
                  <span className="text-sm font-bold text-amber-700">{detailBatchMetrics.totalRejected} pcs</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200 shadow-xs">
                  <span className="text-[10px] text-stone-500 uppercase block">Shortage</span>
                  <span className={`text-sm font-bold ${detailBatchMetrics.totalMissing > 0 ? 'text-rose-700' : 'text-stone-400'}`}>
                    {detailBatchMetrics.totalMissing} pcs
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200 shadow-xs">
                  <span className="text-[10px] text-stone-500 uppercase block">Net Loss</span>
                  <span className="text-sm font-bold text-rose-700">{detailBatchMetrics.totalLoss} pcs</span>
                </div>
              </div>

              {latestRecord && (
                <div className="text-xs text-stone-700 bg-white p-2 rounded-lg border border-stone-200 flex items-center justify-between">
                  <span>
                    Latest update on <strong>{latestRecord.stage_name}</strong> by{' '}
                    <strong className="text-indigo-800">{latestRecord.operator_name}</strong>
                  </span>
                  <span className="text-[11px] text-stone-400">{new Date(latestRecord.submitted_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Stage Timeline */}
            <div className="mb-5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                Stage Execution Trail ({detailBatchRecords.length} of 5 completed)
              </h4>
              <div className="space-y-1.5">
                {STAGES_LIST.map((stage) => {
                  const rec = detailBatchRecords.find(r => r.stage_name === stage);
                  const isCurrent = activeDetailBatch.current_stage === stage;

                  return (
                    <div
                      key={stage}
                      className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                        rec
                          ? 'bg-stone-50 border-stone-200 text-stone-800'
                          : isCurrent
                          ? 'bg-amber-50 border-amber-200 text-amber-900 font-medium'
                          : 'bg-white border-stone-200/60 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {rec ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-amber-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-stone-300" />
                        )}
                        <span className="font-semibold text-stone-900">{stage}</span>
                      </div>

                      {rec ? (
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-700 font-semibold">Passed: {rec.qty_passed}</span>
                          {rec.qty_rejected > 0 && (
                            <span className="text-amber-700">Defects: -{rec.qty_rejected}</span>
                          )}
                          {rec.qty_missing > 0 && (
                            <span className="text-rose-700 font-bold">Missing: -{rec.qty_missing}</span>
                          )}
                          <span className="text-[10px] text-stone-500">({rec.operator_name})</span>
                        </div>
                      ) : isCurrent ? (
                        <span className="text-amber-800 text-[11px]">In progress</span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  onSelectBatch(activeDetailBatch.batch_no);
                  setActiveDetailBatch(null);
                  onNavigateTo('dashboard');
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                View Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectBatch(activeDetailBatch.batch_no);
                  setActiveDetailBatch(null);
                  onNavigateTo('reports');
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Inspect Reports
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectBatch(activeDetailBatch.batch_no);
                  setActiveDetailBatch(null);
                  onNavigateTo('tracker');
                }}
                className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Open in Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE BATCH */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl animate-fadeIn max-h-[92vh] overflow-y-auto">
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-stone-900">Create New Production Batch</h3>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Enter the planned master quantity that all stages will track against.
            </p>

            <form onSubmit={handleCreateBatch} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Batch Number</label>
                <input
                  type="text"
                  required
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Select Garment / Product</label>
                <select
                  value={selectedProductCode}
                  onChange={(e) => setSelectedProductCode(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 cursor-pointer shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                >
                  {products.map(p => (
                    <option key={p.product_code} value={p.product_code}>
                      {p.product_code} — {p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Size</label>
                  <input
                    type="text"
                    required
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                    placeholder="M"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Color</label>
                  <input
                    type="text"
                    required
                    value={batchColor}
                    onChange={(e) => setBatchColor(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                    placeholder="Navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-900 font-bold mb-1">
                  Total Planned Qty (Master Baseline) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-bold text-sm shadow-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Created By</label>
                <input
                  type="text"
                  required
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-t-2xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl animate-fadeIn max-h-[92vh] overflow-y-auto">
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-stone-900">Add Garment Master Item</h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">Register a style pattern in the system.</p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Product Code</label>
                  <input
                    type="text"
                    required
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    placeholder="SHT-004"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 cursor-pointer shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
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
                <label className="block text-stone-700 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Linen Slim Fit Shirt"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Sizes Available</label>
                <input
                  type="text"
                  required
                  value={prodSizes}
                  onChange={(e) => setProdSizes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Colors Available</label>
                <input
                  type="text"
                  required
                  value={prodColors}
                  onChange={(e) => setProdColors(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 shadow-xs focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
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
