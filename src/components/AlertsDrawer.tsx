import React from 'react';
import { ProductionBatch, StageRecord } from '../types';
import { getBatchSummaryMetrics } from '../utils/rules';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, X, ChevronRight } from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batches: ProductionBatch[];
  records: StageRecord[];
  onSelectBatch: (batchNo: string) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  batches,
  records,
  onSelectBatch
}) => {
  if (!isOpen) return null;

  // Calculate alerts
  const missingAlerts = records.filter(r => r.qty_missing > 0);
  const highLossBatches = batches.filter(b => {
    const m = getBatchSummaryMetrics(b, records);
    return m.isHighLoss;
  });
  const completedBatches = batches.filter(b => b.status === 'Completed');
  const activeBatches = batches.filter(b => b.status === 'Active');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col p-6 animate-slideLeft overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Production Loss Alerts</h3>
              <p className="text-xs text-slate-400">Live discrepancy detection feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 flex-1">
          {/* HIGH LOSS ALERTS */}
          {highLossBatches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span>High Loss Threshold Exceeded (&gt;5%)</span>
              </div>
              <div className="space-y-2">
                {highLossBatches.map(b => {
                  const m = getBatchSummaryMetrics(b, records);
                  return (
                    <div
                      key={b.batch_no}
                      onClick={() => {
                        onSelectBatch(b.batch_no);
                        onClose();
                      }}
                      className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl cursor-pointer hover:bg-rose-950/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-rose-300">{b.batch_no}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                          {m.lossPercentage}% Loss
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {m.totalLoss} pieces lost out of {m.planned} planned.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MISSING PIECES SHORTAGES */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Missing Pieces Shortages ({missingAlerts.length})</span>
            </div>
            {missingAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-800">
                No unaccounted shortages recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {missingAlerts.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onSelectBatch(r.batch_no);
                      onClose();
                    }}
                    className="p-3 bg-slate-950 border border-amber-900/40 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-400">{r.batch_no}</span>
                      <span className="font-extrabold text-rose-400">-{r.qty_missing} pcs</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mt-0.5">
                      Stage: {r.stage_name} by {r.operator_name}
                    </div>
                    <p className="text-[11px] text-amber-200/90 mt-1 bg-amber-950/40 p-2 rounded border border-amber-900/60">
                      "{r.missing_reason}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIVE BATCHES IN PROGRESS */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              <Clock className="w-4 h-4" />
              <span>Active Work-in-Progress ({activeBatches.length})</span>
            </div>
            <div className="space-y-2">
              {activeBatches.map(b => (
                <div
                  key={b.batch_no}
                  onClick={() => {
                    onSelectBatch(b.batch_no);
                    onClose();
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:bg-slate-800/40 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{b.batch_no}</span>
                    <span className="text-[11px] text-slate-400">At {b.current_stage} stage</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
