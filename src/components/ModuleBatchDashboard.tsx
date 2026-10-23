import React from 'react';
import { ProductionBatch, StageRecord, ProductionStage } from '../types';
import { STAGES_LIST } from '../utils/storage';
import { getBatchSummaryMetrics, getStatusColor } from '../utils/rules';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight 
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
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <span>High Loss Threshold Exceeded on {batch.batch_no}</span>
              <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">
                {metrics.lossPercentage}% Loss
              </span>
            </h3>
            <p className="text-xs text-rose-800 mt-0.5">
              Total piece loss has exceeded the 5% factory tolerance limit ({metrics.totalLoss} pieces lost out of {metrics.planned} planned).
              Auditing of operator handoffs and workstation tallies is recommended.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Planned */}
        <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
            Planned Master
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {metrics.planned}
            <span className="text-xs font-normal text-stone-500 ml-1">pcs</span>
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">Baseline order qty</span>
        </div>

        {/* Current / Final Passed Output */}
        <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            {batch.status === 'Completed' ? 'Final Output' : 'Current Passed'}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {metrics.finalPassedOutput}
            <span className="text-xs font-normal text-emerald-600 ml-1">pcs</span>
          </div>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">
            Passed inspection OK
          </span>
        </div>

        {/* Total Rejected */}
        <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">
            Total Defective
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
            {metrics.totalRejected}
            <span className="text-xs font-normal text-amber-600 ml-1">pcs</span>
          </div>
          <span className="text-[11px] text-amber-600/80 mt-1 block">
            Scrapped or rework
          </span>
        </div>

        {/* Total Missing */}
        <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block mb-1">
            Total Shortages
          </span>
          <div className={`text-2xl sm:text-3xl font-extrabold ${metrics.totalMissing > 0 ? 'text-rose-700' : 'text-stone-400'}`}>
            {metrics.totalMissing}
            <span className="text-xs font-normal text-stone-400 ml-1">pcs</span>
          </div>
          <span className="text-[11px] text-rose-600/80 mt-1 block">
            Unaccounted shortages
          </span>
        </div>

        {/* Overall Efficiency */}
        <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block mb-1">
            Yield Efficiency
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-900 flex items-center gap-1.5">
            {metrics.efficiency}%
            {metrics.efficiency >= 90 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-600" />
            )}
          </div>
          <span className="text-[11px] text-indigo-600/80 mt-1 block">
            Yield vs planned master
          </span>
        </div>
      </div>

      {/* LIVE BATCH SUMMARY TABLE */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Live Stage Flow & Loss Summary</span>
            </h3>
            <p className="text-xs text-stone-500">
              Comparing stage intake, output, rejections, and missing variances.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> 0 Missing
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> &le; 2% Loss
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> &gt; 2% Loss
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <th className="py-3 px-4 font-semibold">Stage</th>
                <th className="py-3 px-4 font-semibold text-right">Qty In</th>
                <th className="py-3 px-4 font-semibold text-right">Qty Passed</th>
                <th className="py-3 px-4 font-semibold text-right">Qty Rejected</th>
                <th className="py-3 px-4 font-semibold text-right">Qty Missing</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
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
                    className={`hover:bg-stone-50/80 transition-colors ${
                      isCurrent ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-stone-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                      <span>{stageName}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-stone-600">
                      {rec ? rec.qty_received : isCurrent ? 'Auto-loaded' : '—'}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {rec ? rec.qty_passed : '—'}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-amber-700">
                      {rec ? rec.qty_rejected : '—'}
                    </td>

                    <td className="py-3 px-4 text-right font-extrabold">
                      {rec ? (
                        <span className={rec.qty_missing > 0 ? 'text-rose-700' : 'text-stone-400'}>
                          {rec.qty_missing}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isCompleted ? (
                        statusColor === 'green' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Perfect (0 missing)
                          </span>
                        ) : statusColor === 'yellow' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Acceptable (&le;2%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            High Loss (&gt;2%)
                          </span>
                        )
                      ) : isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          In Progress
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Pending</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectStageTab(stageName)}
                        className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
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
            <tfoot className="bg-stone-50 font-bold border-t border-stone-200 text-xs">
              <tr>
                <td className="py-3 px-4 text-stone-900">TOTAL LOSS</td>
                <td className="py-3 px-4 text-right text-stone-400">—</td>
                <td className="py-3 px-4 text-right text-stone-400">—</td>
                <td className="py-3 px-4 text-right text-amber-700">{metrics.totalRejected}</td>
                <td className="py-3 px-4 text-right text-rose-700">{metrics.totalMissing}</td>
                <td colSpan={2} className="py-3 px-4 text-right text-rose-700 font-extrabold">
                  {metrics.totalLoss} Pieces Total Lost
                </td>
              </tr>
              <tr className="bg-stone-100/70 text-stone-900 border-t border-stone-200">
                <td className="py-3 px-4 text-stone-800">PLANNED vs FINAL OUTPUT</td>
                <td className="py-3 px-4 text-right text-stone-700">
                  Planned: <span className="text-stone-900 font-extrabold">{metrics.planned}</span>
                </td>
                <td className="py-3 px-4 text-right text-emerald-800 font-extrabold text-sm">
                  Output: {metrics.finalPassedOutput}
                </td>
                <td colSpan={4} className="py-3 px-4 text-right text-indigo-900 font-extrabold">
                  {metrics.efficiency}% Yield
                  {batch.status === 'Completed' ? ' (Final Output)' : ' (Live estimate)'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
