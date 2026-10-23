import React from 'react';
import { ProductionBatch, StageRecord, ProductionStage } from '../types';
import { STAGES_LIST } from '../utils/storage';
import { getBatchSummaryMetrics, getStatusColor } from '../utils/rules';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Check, 
  ArrowRight,
  PackageCheck
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
        <div className="bg-rose-950/80 border-2 border-rose-600 rounded-2xl p-4 sm:p-5 shadow-2xl flex items-start gap-4 animate-pulse">
          <div className="p-3 bg-rose-600/30 text-rose-300 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🔴 High Loss Alert Detected on {batch.batch_no}</span>
              <span className="text-xs bg-rose-700 text-white px-2 py-0.5 rounded-full font-bold">
                {metrics.lossPercentage}% Loss
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-rose-200 mt-1">
              Total piece loss has exceeded the 5% factory tolerance limit ({metrics.totalLoss} pieces lost out of {metrics.planned} planned).
              Audit of operator handoffs and machine tolerances required immediately.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Planned */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Planned Master
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {metrics.planned}
            <span className="text-xs font-normal text-slate-400 ml-1">pcs</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Baseline order qty</span>
        </div>

        {/* Current / Final Passed Output */}
        <div className="bg-slate-900 border border-emerald-900/40 p-4 rounded-2xl shadow-lg">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
            {batch.status === 'Completed' ? 'Final Output' : 'Current Passed'}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {metrics.finalPassedOutput}
            <span className="text-xs font-normal text-emerald-500/80 ml-1">pcs</span>
          </div>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">
            Passed all quality checks
          </span>
        </div>

        {/* Total Rejected */}
        <div className="bg-slate-900 border border-amber-900/40 p-4 rounded-2xl shadow-lg">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
            Total Rejected
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
            {metrics.totalRejected}
            <span className="text-xs font-normal text-amber-500/80 ml-1">pcs</span>
          </div>
          <span className="text-[11px] text-amber-500/80 mt-1 block">
            Defective & scrap pieces
          </span>
        </div>

        {/* Total Missing */}
        <div className="bg-slate-900 border border-rose-900/40 p-4 rounded-2xl shadow-lg">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">
            Total Missing
          </span>
          <div className={`text-2xl sm:text-3xl font-extrabold ${metrics.totalMissing > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {metrics.totalMissing}
            <span className="text-xs font-normal text-slate-500 ml-1">pcs</span>
          </div>
          <span className="text-[11px] text-rose-500/80 mt-1 block">
            Unaccounted shortages
          </span>
        </div>

        {/* Overall Efficiency */}
        <div className="bg-slate-900 border border-indigo-900/40 p-4 rounded-2xl shadow-lg col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
            Batch Efficiency
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 flex items-center gap-1.5">
            {metrics.efficiency}%
            {metrics.efficiency >= 90 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <span className="text-[11px] text-indigo-400/80 mt-1 block">
            Yield vs planned master
          </span>
        </div>
      </div>

      {/* LIVE BATCH SUMMARY TABLE (Exact specification from Module 3) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Live Stage Flow & Loss Summary</span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparing stage intake, output, rejections, and missing variances.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> 0 Missing
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> &le; 2% Loss
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> &gt; 2% Loss
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Stage</th>
                <th className="py-3 px-4 font-semibold text-right">Qty In</th>
                <th className="py-3 px-4 font-semibold text-right">Qty Passed</th>
                <th className="py-3 px-4 font-semibold text-right">Qty Rejected</th>
                <th className="py-3 px-4 font-semibold text-right">Qty Missing</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
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
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCurrent ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Stage Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                      <span>{stageName}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          Active Line
                        </span>
                      )}
                    </td>

                    {/* Qty In */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                      {rec ? rec.qty_received : isCurrent ? 'Auto-loaded' : '—'}
                    </td>

                    {/* Qty Passed */}
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {rec ? rec.qty_passed : '—'}
                    </td>

                    {/* Qty Rejected */}
                    <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                      {rec ? rec.qty_rejected : '—'}
                    </td>

                    {/* Qty Missing */}
                    <td className="py-3.5 px-4 text-right font-extrabold">
                      {rec ? (
                        <span className={rec.qty_missing > 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {rec.qty_missing}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Status Indicator */}
                    <td className="py-3.5 px-4 text-center">
                      {isCompleted ? (
                        statusColor === 'green' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            🟢 Perfect (0 missing)
                          </span>
                        ) : statusColor === 'yellow' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            🟡 Acceptable (&le;2%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            🔴 High Loss (&gt;2%)
                          </span>
                        )
                      ) : isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          ⏳ In Progress
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">⚪ Pending</span>
                      )}
                    </td>

                    {/* Action link */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectStageTab(stageName)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
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
            <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-sm">
              <tr>
                <td className="py-3.5 px-4 text-slate-100">TOTAL LOSS</td>
                <td className="py-3.5 px-4 text-right text-slate-400">—</td>
                <td className="py-3.5 px-4 text-right text-slate-400">—</td>
                <td className="py-3.5 px-4 text-right text-amber-400">{metrics.totalRejected}</td>
                <td className="py-3.5 px-4 text-right text-rose-400">{metrics.totalMissing}</td>
                <td colSpan={2} className="py-3.5 px-4 text-right text-rose-300 font-extrabold">
                  {metrics.totalLoss} Pieces Total Lost
                </td>
              </tr>
              <tr className="bg-indigo-950/40 text-slate-100">
                <td className="py-3.5 px-4 text-indigo-300">PLANNED vs FINAL OUTPUT</td>
                <td className="py-3.5 px-4 text-right text-slate-200">
                  Planned: <span className="text-amber-300">{metrics.planned}</span>
                </td>
                <td className="py-3.5 px-4 text-right text-emerald-400 font-extrabold text-base">
                  Output: {metrics.finalPassedOutput}
                </td>
                <td colSpan={4} className="py-3.5 px-4 text-right text-emerald-300 font-extrabold">
                  {metrics.efficiency}% Efficiency
                  {batch.status === 'Completed' ? ' (Final Run)' : ' (Live estimate)'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
