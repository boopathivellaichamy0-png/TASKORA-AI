import React, { useState } from 'react';
import { ProductionBatch, StageRecord, DiscrepancyReport } from '../types';
import { getBatchSummaryMetrics } from '../utils/rules';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  X, 
  ChevronRight, 
  Send, 
  Inbox, 
  Check, 
  UserX,
  FileWarning
} from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batches: ProductionBatch[];
  records: StageRecord[];
  discrepancies: DiscrepancyReport[];
  onUpdateDiscrepancyStatus: (
    id: string, 
    status: 'Reported to Admin' | 'Under Investigation' | 'Resolved by Admin'
  ) => void;
  onSelectBatch: (batchNo: string) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  batches,
  records,
  discrepancies,
  onUpdateDiscrepancyStatus,
  onSelectBatch
}) => {
  const [activeDrawerTab, setActiveDrawerTab] = useState<'discrepancies' | 'alerts'>('discrepancies');

  if (!isOpen) return null;

  const missingAlerts = records.filter(r => r.qty_missing > 0);
  const highLossBatches = batches.filter(b => {
    const m = getBatchSummaryMetrics(b, records);
    return m.isHighLoss;
  });
  const activeBatches = batches.filter(b => b.status === 'Active');
  const openDiscrepancies = discrepancies.filter(d => d.status !== 'Resolved by Admin');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col p-6 animate-slideLeft overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <FileWarning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Admin Discrepancy & Alert Center</h3>
              <p className="text-xs text-slate-400">Previous stage operator accountability & shortages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveDrawerTab('discrepancies')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeDrawerTab === 'discrepancies'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Operator Discrepancy Reports ({openDiscrepancies.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDrawerTab('alerts')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeDrawerTab === 'alerts'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Loss & Flow Alerts</span>
          </button>
        </div>

        <div className="space-y-4 flex-1">
          {/* TAB 1: OPERATOR DISCREPANCY REPORTS TO ADMIN */}
          {activeDrawerTab === 'discrepancies' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-300">
                <span>Reports Logged Against Previous Stage Person</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Total: {discrepancies.length}
                </span>
              </div>

              {discrepancies.length === 0 ? (
                <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-800 p-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-bold">No Discrepancy Reports Logged</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    All handoffs between stages currently match expected quantities perfectly.
                  </p>
                </div>
              ) : (
                discrepancies.map((d) => {
                  const isSurplus = d.type.includes('Surplus');

                  return (
                    <div
                      key={d.id}
                      className={`p-4 rounded-xl border transition-all ${
                        d.status === 'Resolved by Admin'
                          ? 'bg-slate-950/60 border-slate-800 opacity-60'
                          : isSurplus
                          ? 'bg-cyan-950/30 border-cyan-700/60'
                          : 'bg-rose-950/30 border-rose-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {d.batch_no}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isSurplus 
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' 
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {d.variance_qty > 0 ? `+${d.variance_qty} pcs (SURPLUS)` : `${d.variance_qty} pcs (SHORTAGE)`}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            At <strong>{d.stage_name}</strong> stage (Reported by {d.current_operator})
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === 'Resolved by Admin'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : d.status === 'Under Investigation'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        }`}>
                          {d.status}
                        </span>
                      </div>

                      {/* Flagged previous stage operator box */}
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs mb-2.5">
                        <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-0.5">
                          <UserX className="w-3.5 h-3.5 text-amber-400" />
                          <span>Flagged Previous Stage Person:</span>
                        </div>
                        <div className="text-slate-200 pl-5">
                          <strong>{d.previous_operator}</strong> from <strong>{d.previous_stage}</strong> stage
                        </div>
                        <div className="text-[11px] text-slate-400 pl-5 mt-0.5">
                          Sent: {d.expected_qty} pcs | Counted: {d.counted_qty} pcs
                        </div>
                      </div>

                      {/* Message body */}
                      <p className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-3 italic">
                        "{d.message}"
                      </p>

                      {/* Admin Resolution Action Buttons */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500">
                          {new Date(d.reported_at).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {d.status !== 'Resolved by Admin' && (
                            <>
                              {d.status === 'Reported to Admin' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateDiscrepancyStatus(d.id, 'Under Investigation')}
                                  className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg text-[11px] font-bold"
                                >
                                  Investigate
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onUpdateDiscrepancyStatus(d.id, 'Resolved by Admin')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-emerald-900"
                              >
                                Resolve
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectBatch(d.batch_no);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium"
                          >
                            Open Batch
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: SYSTEM LOSS & INCOMPLETE STAGE ALERTS */}
          {activeDrawerTab === 'alerts' && (
            <div className="space-y-4">
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
          )}
        </div>
      </div>
    </div>
  );
};
