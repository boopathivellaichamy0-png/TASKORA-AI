import React, { useState } from 'react';
import { Product, ProductionBatch, UserRole } from '../types';
import { Tag, Plus, Layers, Package, Calendar, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface ModuleMasterDataProps {
  products: Product[];
  batches: ProductionBatch[];
  onAddProduct: (product: Product) => void;
  onAddBatch: (batch: ProductionBatch) => void;
  currentRole: UserRole;
}

export const ModuleMasterData: React.FC<ModuleMasterDataProps> = ({
  products,
  batches,
  onAddProduct,
  onAddBatch,
  currentRole
}) => {
  const [activeTab, setActiveTab] = useState<'batches' | 'products'>('batches');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

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
    onAddBatch({
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
    });
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
            Configure garment styles, planned order quantities, and track active production runs.
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
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Create Batch</span>
              </button>
            ) : (
              <button
                onClick={() => setIsProductModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30"
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-slate-200 text-sm">All Production Batches</h3>
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
                  <th className="p-3">Started Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {batches.map((b) => (
                  <tr key={b.batch_no} className="hover:bg-slate-800/40">
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
                    <td className="p-3 text-slate-400">{b.date_created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <label className="block text-slate-300 font-semibold mb-1">Created By</label>
                <input
                  type="text"
                  required
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
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
