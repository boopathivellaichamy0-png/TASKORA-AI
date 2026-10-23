import React from 'react';
import { ProductionBatch, UserRole } from '../types';
import { Layers, Plus, Calendar, Tag, CheckCircle2, Clock } from 'lucide-react';

interface BatchSelectorProps {
  batches: ProductionBatch[];
  selectedBatchNo: string;
  onSelectBatch: (batchNo: string) => void;
  onNewBatchClick: () => void;
  currentRole: UserRole;
}

export const BatchSelector: React.FC<BatchSelectorProps> = ({
  batches,
  selectedBatchNo,
  onSelectBatch,
  onNewBatchClick,
  currentRole
}) => {
  const currentBatch = batches.find((b) => b.batch_no === selectedBatchNo) || batches[0];
  const canCreate = currentRole === 'Admin' || currentRole === 'Stage Supervisor';

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-6 transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Active Batch Info & Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Active Batch Selection
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <select
                  aria-label="Select Active Batch"
                  value={selectedBatchNo}
                  onChange={(e) => onSelectBatch(e.target.value)}
                  className="bg-stone-50 hover:bg-stone-100/80 text-stone-900 font-bold text-sm sm:text-base rounded-lg border border-stone-300 px-3 py-1.5 focus:border-indigo-600 focus:bg-white focus:outline-none cursor-pointer transition-colors"
                >
                  {batches.map((b) => (
                    <option key={b.batch_no} value={b.batch_no} className="bg-white text-stone-900">
                      {b.batch_no} — {b.product_name} ({b.total_planned_qty} pcs)
                    </option>
                  ))}
                </select>

                {currentBatch?.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Clock className="w-3.5 h-3.5" />
                    Stage: {currentBatch?.current_stage}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Quick Metadata chips */}
        {currentBatch && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-200/80">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-stone-200/60 shadow-xs">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-500">Style:</span>
              <span className="font-semibold text-stone-900">{currentBatch.product_name}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-stone-200/60 shadow-xs">
              <span className="text-stone-500">Variant:</span>
              <span className="font-semibold text-indigo-700">{currentBatch.color}</span> / <span className="font-semibold text-indigo-700">{currentBatch.size}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-stone-200/60 shadow-xs">
              <span className="text-stone-500">Planned Master:</span>
              <span className="font-bold text-stone-900">{currentBatch.total_planned_qty} pcs</span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-stone-200/60 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-500">Created:</span>
              <span className="text-stone-800">{currentBatch.date_created}</span>
            </div>
          </div>
        )}

        {/* Right: Add new batch button */}
        {canCreate && (
          <button
            onClick={onNewBatchClick}
            className="flex items-center justify-center space-x-2 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 active:scale-[0.98] text-white font-semibold text-xs rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Production Batch</span>
          </button>
        )}
      </div>
    </div>
  );
};
