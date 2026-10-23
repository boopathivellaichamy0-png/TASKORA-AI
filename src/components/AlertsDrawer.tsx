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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-md flex justify-end">
      <div className="w-full sm:max-w-lg bg-[#080808]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)] h-full flex flex-col p-5 sm:p-6 animate-slideLeft overflow-y-auto text-white">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E] rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <FileWarning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-instrument text-2xl text-white">Admin Incident Center</h3>
              <p className="text-[11px] font-mono text-neutral-400">Accountability, workstation handoffs & shortage tallies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 mb-5 bg-white/[0.03] p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveDrawerTab('discrepancies')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all transition-snappy cursor-pointer ${
              activeDrawerTab === 'discrepancies'
                ? 'bg-white text-black shadow-xs font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Incidents ({openDiscrepancies.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDrawerTab('alerts')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all transition-snappy cursor-pointer ${
              activeDrawerTab === 'alerts'
                ? 'bg-white text-black shadow-xs font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Loss Warnings</span>
          </button>
        </div>

        <div className="space-y-4 flex-1 font-mono">
          {/* TAB 1: OPERATOR DISCREPANCY REPORTS TO ADMIN */}
          {activeDrawerTab === 'discrepancies' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                <span>FLAGGED WORKSTATION HANDOFFS</span>
                <span>Total: {discrepancies.length}</span>
              </div>

              {discrepancies.length === 0 ? (
                <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-white/5 p-6">
                  <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto mb-2" />
                  <p className="text-xs text-white font-bold">No Discrepancy Incidents</p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    All handoffs between stages balance with recorded physical tallies.
                  </p>
                </div>
              ) : (
                discrepancies.map((d) => {
                  const isSurplus = d.type.includes('Surplus');

                  return (
                    <div
                      key={d.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        d.status === 'Resolved by Admin'
                          ? 'bg-white/[0.01] border-white/5 opacity-50'
                          : isSurplus
                          ? 'bg-[#06B6D4]/10 border-[#06B6D4]/30'
                          : 'bg-[#F43F5E]/10 border-[#F43F5E]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10">
                              {d.batch_no}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSurplus 
                                ? 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40' 
                                : 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40'
                            }`}>
                              {d.variance_qty > 0 ? `+${d.variance_qty} pcs (SURPLUS)` : `${d.variance_qty} pcs (SHORTAGE)`}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 mt-1 block">
                            At <strong className="text-white">{d.stage_name}</strong> (Logged by {d.current_operator})
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === 'Resolved by Admin'
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                            : d.status === 'Under Investigation'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                            : 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40'
                        }`}>
                          {d.status}
                        </span>
                      </div>

                      {/* Flagged previous stage operator box */}
                      <div className="bg-[#080808] p-3 rounded-xl border border-white/10 text-xs mb-3">
                        <div className="flex items-center gap-1.5 text-[#F59E0B] font-semibold mb-1">
                          <UserX className="w-3.5 h-3.5" />
                          <span>Flagged Workstation Operator:</span>
                        </div>
                        <div className="text-white pl-5 font-semibold">
                          {d.previous_operator} from {d.previous_stage}
                        </div>
                        <div className="text-[11px] text-neutral-400 pl-5 mt-0.5">
                          Reported Sent: {d.expected_qty} pcs | Counted: {d.counted_qty} pcs
                        </div>
                      </div>

                      {/* Message body */}
                      <p className="text-xs text-neutral-300 bg-white/[0.02] p-3 rounded-xl border border-white/5 mb-3 italic">
                        "{d.message}"
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                        <span className="text-[10px] text-neutral-500">
                          {new Date(d.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {d.status !== 'Resolved by Admin' && (
                            <>
                              {d.status === 'Reported to Admin' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateDiscrepancyStatus(d.id, 'Under Investigation')}
                                  className="px-2.5 py-1 bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] border border-[#F59E0B]/40 rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  Investigate
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onUpdateDiscrepancyStatus(d.id, 'Resolved by Admin')}
                                className="px-3 py-1 bg-[#10B981] hover:bg-[#10B981]/80 text-black rounded-lg text-[10px] font-bold cursor-pointer shadow-xs"
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
                            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 rounded-lg text-[10px] cursor-pointer"
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
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#F43F5E] mb-2 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>HIGH LOSS THRESHOLD EXCEEDED (&gt;5%)</span>
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
                          className="p-3.5 bg-[#F43F5E]/10 border border-[#F43F5E]/30 rounded-2xl cursor-pointer hover:bg-[#F43F5E]/20 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{b.batch_no}</span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F43F5E] text-white font-bold">
                              {m.lossPercentage}% Loss
                            </span>
                          </div>
                          <p className="text-xs text-neutral-300 mt-1">
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
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#F59E0B] mb-2 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>UNACCOUNTED SHORTAGES ({missingAlerts.length})</span>
                </div>
                {missingAlerts.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic p-3.5 bg-white/[0.02] rounded-2xl border border-white/5">
                    No unaccounted shortages recorded across workstations.
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
                        className="p-3.5 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-[#8B5CF6]/40 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#8B5CF6]">{r.batch_no}</span>
                          <span className="font-bold text-[#F43F5E]">-{r.qty_missing} pcs</span>
                        </div>
                        <div className="text-xs text-neutral-300 mt-0.5">
                          Stage: {r.stage_name} by {r.operator_name}
                        </div>
                        <p className="text-[11px] text-[#F59E0B] mt-1.5 bg-[#F59E0B]/10 p-2 rounded-xl border border-[#F59E0B]/20">
                          "{r.missing_reason}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTIVE BATCHES IN PROGRESS */}
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#06B6D4] mb-2 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ACTIVE RUNS ({activeBatches.length})</span>
                </div>
                <div className="space-y-2">
                  {activeBatches.map(b => (
                    <div
                      key={b.batch_no}
                      onClick={() => {
                        onSelectBatch(b.batch_no);
                        onClose();
                      }}
                      className="p-3.5 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.04] cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{b.batch_no}</span>
                        <span className="text-[11px] text-neutral-400">{b.product_name} • Stage: {b.current_stage}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
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
