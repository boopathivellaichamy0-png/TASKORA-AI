import React from 'react';
import { ProductionBatch, UserRole } from '../types';
import { Layers, Plus, Calendar, Tag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Active Batch Info & Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Select Active Batch
              </span>
              <div className="flex items-center space-x-2">
                <select
                  aria-label="Select Active Batch"
                  value={selectedBatchNo}
                  onChange={(e) => onSelectBatch(e.target.value)}
                  className="bg-slate-950 text-slate-100 font-bold text-base sm:text-lg rounded-lg border border-slate-700/80 px-3 py-1.5 focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  {batches.map((b) => (
                    <option key={b.batch_no} value={b.batch_no} className="bg-slate-900">
                      {b.batch_no} - {b.product_name} ({b.total_planned_qty} pcs)
                    </option>
                  ))}
                </select>

                {currentBatch?.status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    Stage: {currentBatch?.current_stage}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Quick Metadata chips */}
        {currentBatch && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Garment:</span>
              <span className="font-semibold text-slate-100">{currentBatch.product_name}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg">
              <span className="text-slate-400">Variant:</span>
              <span className="font-semibold text-indigo-300">{currentBatch.color}</span> / <span className="font-semibold text-indigo-300">{currentBatch.size}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg">
              <span className="text-slate-400">Planned Master:</span>
              <span className="font-bold text-amber-300">{currentBatch.total_planned_qty} pcs</span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 bg-slate-900 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Started:</span>
              <span>{currentBatch.date_created}</span>
            </div>
          </div>
        )}

        {/* Right: Add new batch button */}
        {canCreate && (
          <button
            onClick={onNewBatchClick}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Production Batch</span>
          </button>
        )}
      </div>
    </div>
  );
};
