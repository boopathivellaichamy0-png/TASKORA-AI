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
  Inbox, 
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white border-l border-stone-200 shadow-2xl h-full flex flex-col p-6 animate-slideLeft overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              <FileWarning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Admin Discrepancy & Alert Center</h3>
              <p className="text-xs text-stone-500">Operator accountability, handoff tallies & shortages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-4 bg-stone-100 p-1 rounded-lg border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveDrawerTab('discrepancies')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeDrawerTab === 'discrepancies'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Operator Discrepancy Reports ({openDiscrepancies.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDrawerTab('alerts')}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeDrawerTab === 'alerts'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
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
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                <span>Reports Logged Against Previous Stage Person</span>
                <span className="text-[11px] text-stone-400 font-normal">
                  Total: {discrepancies.length}
                </span>
              </div>

              {discrepancies.length === 0 ? (
                <div className="text-center py-8 bg-stone-50 rounded-xl border border-stone-200 p-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs text-stone-800 font-bold">No Discrepancy Reports Logged</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    All handoffs between stages match recorded tallies.
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
                          ? 'bg-stone-50/70 border-stone-200 opacity-60'
                          : isSurplus
                          ? 'bg-cyan-50/40 border-cyan-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200">
                              {d.batch_no}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isSurplus 
                                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' 
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {d.variance_qty > 0 ? `+${d.variance_qty} pcs (SURPLUS)` : `${d.variance_qty} pcs (SHORTAGE)`}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-500 mt-1 block">
                            At <strong>{d.stage_name}</strong> stage (Reported by {d.current_operator})
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === 'Resolved by Admin'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : d.status === 'Under Investigation'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {d.status}
                        </span>
                      </div>

                      {/* Flagged previous stage operator box */}
                      <div className="bg-white p-2.5 rounded-lg border border-stone-200 text-xs mb-2.5">
                        <div className="flex items-center gap-1.5 text-amber-800 font-semibold mb-0.5">
                          <UserX className="w-3.5 h-3.5 text-amber-600" />
                          <span>Flagged Previous Stage Person:</span>
                        </div>
                        <div className="text-stone-900 pl-5 font-medium">
                          <strong>{d.previous_operator}</strong> from <strong>{d.previous_stage}</strong> stage
                        </div>
                        <div className="text-[11px] text-stone-500 pl-5 mt-0.5">
                          Sent: {d.expected_qty} pcs | Counted: {d.counted_qty} pcs
                        </div>
                      </div>

                      {/* Message body */}
                      <p className="text-xs text-stone-800 bg-white p-2.5 rounded-lg border border-stone-200 mb-3 italic">
                        "{d.message}"
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/80">
                        <span className="text-[10px] text-stone-400">
                          {new Date(d.reported_at).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {d.status !== 'Resolved by Admin' && (
                            <>
                              {d.status === 'Reported to Admin' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateDiscrepancyStatus(d.id, 'Under Investigation')}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-md text-[11px] font-bold cursor-pointer"
                                >
                                  Investigate
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onUpdateDiscrepancyStatus(d.id, 'Resolved by Admin')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold shadow-xs cursor-pointer"
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
                            className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-md text-[11px] font-medium cursor-pointer"
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
              {highLossBatches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 mb-2">
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
                          className="p-3 bg-rose-50 border border-rose-200 rounded-xl cursor-pointer hover:bg-rose-100/60 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-rose-900">{b.batch_no}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                              {m.lossPercentage}% Loss
                            </span>
                          </div>
                          <p className="text-xs text-rose-800 mt-1">
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
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Missing Pieces Shortages ({missingAlerts.length})</span>
                </div>
                {missingAlerts.length === 0 ? (
                  <p className="text-xs text-stone-400 italic p-3 bg-stone-50 rounded-xl border border-stone-200">
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
                        className="p-3 bg-white border border-stone-200 rounded-xl hover:border-indigo-400 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-700">{r.batch_no}</span>
                          <span className="font-extrabold text-rose-700">-{r.qty_missing} pcs</span>
                        </div>
                        <div className="text-xs font-semibold text-stone-800 mt-0.5">
                          Stage: {r.stage_name} by {r.operator_name}
                        </div>
                        <p className="text-[11px] text-amber-900 mt-1 bg-amber-50 p-2 rounded border border-amber-200">
                          "{r.missing_reason}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTIVE BATCHES IN PROGRESS */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Active Batches In Progress ({activeBatches.length})</span>
                </div>
                <div className="space-y-2">
                  {activeBatches.map(b => (
                    <div
                      key={b.batch_no}
                      onClick={() => {
                        onSelectBatch(b.batch_no);
                        onClose();
                      }}
                      className="p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer flex items-center justify-between text-xs shadow-xs"
                    >
                      <div>
                        <span className="font-bold text-stone-900 block">{b.batch_no}</span>
                        <span className="text-[11px] text-stone-500">{b.product_name} • Stage: {b.current_stage}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
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
