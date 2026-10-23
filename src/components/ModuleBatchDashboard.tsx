import React from 'react';
import { ProductionBatch, StageRecord, ProductionStage } from '../types';
import { STAGES_LIST } from '../utils/storage';
import { getBatchSummaryMetrics, getStatusColor } from '../utils/rules';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Activity,
  Layers
} from 'lucide-react';

interface ModuleBatchDashboardProps {
  batch: ProductionBatch;
  records: StageRecord[];
  onSelectStageTab: (stage: ProductionStage) => void;
}

export const ModuleBatchDashboard: React.FC<ModuleBatchDashboardProps> = ({
  batch,
  records,
  onSelectStageTab
}) => {
  const batchRecords = records.filter((r) => r.batch_no === batch.batch_no);
  const metrics = getBatchSummaryMetrics(batch, records);

  return (
    <div className="space-y-6">
      {/* High Loss Warning Alert Banner if > 5% */}
      {metrics.isHighLoss && (
        <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_30px_rgba(244,63,94,0.15)] flex items-start gap-4">
          <div className="p-2.5 bg-[#F43F5E]/20 text-[#F43F5E] rounded-2xl shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
              <span>HIGH LOSS THRESHOLD EXCEEDED ON {batch.batch_no}</span>
              <span className="text-[10px] font-mono bg-[#F43F5E] text-white px-2 py-0.5 rounded-full font-bold">
                {metrics.lossPercentage}% Loss
              </span>
            </h3>
            <p className="text-xs font-mono text-neutral-300 mt-1">
              Total piece loss has exceeded the 5% factory tolerance limit ({metrics.totalLoss} pieces lost out of {metrics.planned} planned).
              Auditing of operator handoffs and workstation tallies is recommended.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Planned */}
        <div className="glass-panel border border-white/10 p-5 rounded-3xl hover:-translate-y-2 hover:border-[#8B5CF6]/40 transition-all transition-snappy shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 block mb-1">
            Planned Master
          </span>
          <div className="text-3xl font-mono font-bold text-white">
            {metrics.planned}
            <span className="text-xs font-normal text-neutral-500 ml-1">pcs</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 mt-1.5 block">Baseline order qty</span>
        </div>

        {/* Current / Final Passed Output */}
        <div className="glass-panel border border-white/10 p-5 rounded-3xl hover:-translate-y-2 hover:border-[#10B981]/40 transition-all transition-snappy shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#10B981] block mb-1">
            {batch.status === 'Completed' ? 'Final Output' : 'Current Passed'}
          </span>
          <div className="text-3xl font-mono font-bold text-[#10B981]">
            {metrics.finalPassedOutput}
            <span className="text-xs font-normal text-[#10B981]/70 ml-1">pcs</span>
          </div>
          <span className="text-[10px] font-mono text-[#10B981]/70 mt-1.5 block">
            Passed inspection OK
          </span>
        </div>

        {/* Total Rejected */}
        <div className="glass-panel border border-white/10 p-5 rounded-3xl hover:-translate-y-2 hover:border-[#F59E0B]/40 transition-all transition-snappy shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#F59E0B] block mb-1">
            Total Defective
          </span>
          <div className="text-3xl font-mono font-bold text-[#F59E0B]">
            {metrics.totalRejected}
            <span className="text-xs font-normal text-[#F59E0B]/70 ml-1">pcs</span>
          </div>
          <span className="text-[10px] font-mono text-[#F59E0B]/70 mt-1.5 block">
            Scrapped or rework
          </span>
        </div>

        {/* Total Missing */}
        <div className="glass-panel border border-white/10 p-5 rounded-3xl hover:-translate-y-2 hover:border-[#F43F5E]/40 transition-all transition-snappy shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#F43F5E] block mb-1">
            Total Shortages
          </span>
          <div className={`text-3xl font-mono font-bold ${metrics.totalMissing > 0 ? 'text-[#F43F5E]' : 'text-neutral-500'}`}>
            {metrics.totalMissing}
            <span className="text-xs font-normal text-neutral-500 ml-1">pcs</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500 mt-1.5 block">
            Unaccounted shortages
          </span>
        </div>

        {/* Overall Efficiency */}
        <div className="glass-panel border border-white/10 p-5 rounded-3xl hover:-translate-y-2 hover:border-[#06B6D4]/40 transition-all transition-snappy shadow-[0_8px_32px_rgba(0,0,0,0.4)] col-span-2 lg:col-span-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#06B6D4] block mb-1">
            Yield Efficiency
          </span>
          <div className="text-3xl font-mono font-bold text-[#06B6D4] flex items-center gap-2">
            {metrics.efficiency}%
            {metrics.efficiency >= 90 ? (
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            ) : (
              <TrendingDown className="w-5 h-5 text-[#F43F5E]" />
            )}
          </div>
          <span className="text-[10px] font-mono text-neutral-500 mt-1.5 block">
            Yield vs planned master
          </span>
        </div>
      </div>

      {/* LIVE BATCH SUMMARY TABLE (DARK IDE WINDOW STYLE) */}
      <div className="rounded-3xl glass-panel border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.01]">
          <div>
            <h3 className="font-serif-instrument text-2xl text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#06B6D4]" />
              <span>Live Stage Flow & Loss Summary</span>
            </h3>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              Comparing stage intake, output, rejections, and missing variances.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[#10B981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> 0 Missing
            </span>
            <span className="flex items-center gap-1.5 text-[#F59E0B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span> &le; 2%
            </span>
            <span className="flex items-center gap-1.5 text-[#F43F5E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]"></span> &gt; 2% Loss
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 border-b border-white/10">
                <th className="py-3 px-4 font-semibold">Stage</th>
                <th className="py-3 px-4 font-semibold text-right">Qty In</th>
                <th className="py-3 px-4 font-semibold text-right">Qty Passed</th>
                <th className="py-3 px-4 font-semibold text-right">Qty Rejected</th>
                <th className="py-3 px-4 font-semibold text-right">Qty Missing</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {STAGES_LIST.map((stageName) => {
                const rec = batchRecords.find((r) => r.stage_name === stageName);
                const isCurrent = batch.current_stage === stageName;
                const isCompleted = !!rec;

                const missing = rec ? rec.qty_missing : 0;
                const received = rec ? rec.qty_received : 0;
                const statusColor = rec ? getStatusColor(missing, received) : 'green';

                return (
                  <tr
                    key={stageName}
                    className={`hover:bg-white/[0.03] transition-colors ${
                      isCurrent ? 'bg-[#8B5CF6]/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>
                      <span>{stageName}</span>
                      {isCurrent && (
                        <span className="text-[9px] font-mono bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 px-2 py-0.5 rounded-full font-bold">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-neutral-400">
                      {rec ? rec.qty_received : isCurrent ? 'Auto-loaded' : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#10B981]">
                      {rec ? rec.qty_passed : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#F59E0B]">
                      {rec ? rec.qty_rejected : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold">
                      {rec ? (
                        <span className={rec.qty_missing > 0 ? 'text-[#F43F5E]' : 'text-neutral-500'}>
                          {rec.qty_missing}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isCompleted ? (
                        statusColor === 'green' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                            Zero Loss
                          </span>
                        ) : statusColor === 'yellow' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                            Acceptable (&le;2%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30">
                            High Loss (&gt;2%)
                          </span>
                        )
                      ) : isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                          In Progress
                        </span>
                      ) : (
                        <span className="text-neutral-600 text-[10px]">Pending</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectStageTab(stageName)}
                        className="text-xs text-[#06B6D4] hover:text-white font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{isCompleted ? 'View Log' : isCurrent ? 'Open Station' : 'View'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* SUMMARY FOOTER ROW */}
            <tfoot className="bg-white/[0.02] border-t border-white/10 text-xs font-mono">
              <tr>
                <td className="py-3 px-4 font-bold text-white">TOTAL LOSS</td>
                <td className="py-3 px-4 text-right text-neutral-600">—</td>
                <td className="py-3 px-4 text-right text-neutral-600">—</td>
                <td className="py-3 px-4 text-right text-[#F59E0B] font-bold">{metrics.totalRejected}</td>
                <td className="py-3 px-4 text-right text-[#F43F5E] font-bold">{metrics.totalMissing}</td>
                <td colSpan={2} className="py-3 px-4 text-right text-[#F43F5E] font-bold">
                  {metrics.totalLoss} Pieces Lost Total
                </td>
              </tr>
              <tr className="bg-white/[0.04] text-white border-t border-white/10">
                <td className="py-3 px-4 font-bold">PLANNED vs FINAL OUTPUT</td>
                <td className="py-3 px-4 text-right text-neutral-300">
                  Planned: <span className="font-bold text-white">{metrics.planned}</span>
                </td>
                <td className="py-3 px-4 text-right text-[#10B981] font-bold">
                  Output: {metrics.finalPassedOutput}
                </td>
                <td colSpan={4} className="py-3 px-4 text-right text-[#06B6D4] font-bold">
                  {metrics.efficiency}% Yield
                  {batch.status === 'Completed' ? ' (Final Yield)' : ' (Live Rate)'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
