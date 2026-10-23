import React, { useState, useEffect } from 'react';
import { ProductionBatch, ProductionStage, StageRecord, UserRole, DiscrepancyReport } from '../types';
import { STAGES_LIST, DEFECT_OPTIONS, MISSING_REASONS_SUGGESTIONS } from '../utils/storage';
import { 
  computeStageMissing, 
  computeStageSurplus, 
  validateStageInput, 
  getAutoQtyReceivedForStage, 
  getPreviousStageInfo 
} from '../utils/rules';
import { 
  Scissors, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Package, 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  User, 
  Lock, 
  ArrowRight, 
  Info,
  Send,
  BellRing,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ModuleStageTrackerProps {
  batch: ProductionBatch;
  records: StageRecord[];
  onSaveRecord: (
    record: Omit<StageRecord, 'id' | 'submitted_at'>, 
    discrepancy?: Omit<DiscrepancyReport, 'id' | 'reported_at'>
  ) => void;
  onSendDiscrepancyReport: (report: Omit<DiscrepancyReport, 'id' | 'reported_at'>) => void;
  currentRole: UserRole;
}

const STAGE_ICONS: Record<ProductionStage, React.ReactNode> = {
  Cutting: <Scissors className="w-5 h-5" />,
  Stitching: <Layers className="w-5 h-5" />,
  QC: <CheckCircle2 className="w-5 h-5" />,
  Finishing: <Sparkles className="w-5 h-5" />,
  Packing: <Package className="w-5 h-5" />
};

export const ModuleStageTracker: React.FC<ModuleStageTrackerProps> = ({
  batch,
  records,
  onSaveRecord,
  onSendDiscrepancyReport,
  currentRole
}) => {
  // Determine which stage tab is currently selected
  const activeBatchRecords = records.filter((r) => r.batch_no === batch.batch_no);
  
  const initialActiveStage: ProductionStage = 
    batch.current_stage === 'Completed' 
      ? 'Packing' 
      : (batch.current_stage as ProductionStage) || 'Cutting';

  const [selectedStage, setSelectedStage] = useState<ProductionStage>(initialActiveStage);

  useEffect(() => {
    if (batch.current_stage === 'Completed') {
      setSelectedStage('Packing');
    } else {
      setSelectedStage(batch.current_stage as ProductionStage);
    }
  }, [batch.batch_no, batch.current_stage]);

  const existingRecord = activeBatchRecords.find((r) => r.stage_name === selectedStage);
  const isStageCompleted = !!existingRecord;

  // Auto-calculated received quantity for this stage
  const autoReceived = getAutoQtyReceivedForStage(batch, selectedStage, records);
  const prevStageInfo = getPreviousStageInfo(batch, selectedStage, records);

  // Form State
  const [operatorName, setOperatorName] = useState('David Vance (Senior QC)');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeIn, setTimeIn] = useState('08:30');
  const [qtyPassed, setQtyPassed] = useState<number | ''>('');
  const [qtyRejected, setQtyRejected] = useState<number | ''>('');
  const [qtyRework, setQtyRework] = useState<number | ''>(0); // QC
  const [fabricRolls, setFabricRolls] = useState<number | ''>(10); // Cutting
  const [rejectionReason, setRejectionReason] = useState('');
  const [missingReason, setMissingReason] = useState('');
  const [surplusReason, setSurplusReason] = useState('');
  const [defectType, setDefectType] = useState('');
  const [remarks, setRemarks] = useState('');

  // Discrepancy report message state
  const [discrepancyMessage, setDiscrepancyMessage] = useState('');
  const [isDiscrepancyReportSent, setIsDiscrepancyReportSent] = useState(false);
  const [autoFileDiscrepancy, setAutoFileDiscrepancy] = useState(true);

  // Packing specific breakdown
  const [sizeBreakdown, setSizeBreakdown] = useState<Record<string, number>>({
    'S': 0, 'M': 0, 'L': 0, 'XL': 0, 'XXL': 0
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  // Reset form when changing stage
  useEffect(() => {
    setQtyPassed('');
    setQtyRejected('');
    setQtyRework(0);
    setRejectionReason('');
    setMissingReason('');
    setSurplusReason('');
    setDefectType('');
    setRemarks('');
    setValidationErrors([]);
    setTouched(false);
    setIsDiscrepancyReportSent(false);

    if (selectedStage === 'Cutting') setOperatorName('Carlos Mendez (Cutter #1)');
    else if (selectedStage === 'Stitching') setOperatorName('Amina Khatun (Sewing Lead)');
    else if (selectedStage === 'QC') setOperatorName('David Vance (Senior QC)');
    else if (selectedStage === 'Finishing') setOperatorName('Fatima Noor (Finishing Lead)');
    else if (selectedStage === 'Packing') setOperatorName('Samuel Lee (Packing Mgr)');
  }, [selectedStage, batch.batch_no]);

  const numPassed = typeof qtyPassed === 'number' ? qtyPassed : 0;
  const numRejected = typeof qtyRejected === 'number' ? qtyRejected : 0;
  const numRework = typeof qtyRework === 'number' ? qtyRework : 0;

  // Live Calculations
  const totalAccounted = numPassed + numRejected + (selectedStage === 'QC' ? numRework : 0);
  const liveMissing = computeStageMissing(selectedStage, autoReceived, numPassed, numRejected, numRework);
  const liveSurplus = computeStageSurplus(selectedStage, autoReceived, numPassed, numRejected, numRework);
  const variance = totalAccounted - autoReceived;
  const hasDiscrepancy = (qtyPassed !== '' || qtyRejected !== '') && variance !== 0;

  // Auto-generate discrepancy report message
  useEffect(() => {
    if (variance > 0) {
      setDiscrepancyMessage(
        `🚨 SURPLUS HANDOFF DISCREPANCY: Counted ${totalAccounted} pieces (+${variance} surplus) at ${selectedStage}. Previous stage (${prevStageInfo.stage}) operator ${prevStageInfo.operator} recorded sending ${autoReceived} pieces. Please audit bundle tags and scrap bins.`
      );
    } else if (variance < 0) {
      setDiscrepancyMessage(
        `⚠️ SHORTAGE HANDOFF DISCREPANCY: Counted only ${totalAccounted} pieces (${variance} missing) at ${selectedStage}. Previous stage (${prevStageInfo.stage}) operator ${prevStageInfo.operator} recorded sending ${autoReceived} pieces. Shortage investigation initiated.`
      );
    } else {
      setDiscrepancyMessage('');
    }
  }, [variance, totalAccounted, autoReceived, selectedStage, prevStageInfo.stage, prevStageInfo.operator]);

  // Validate form state live
  useEffect(() => {
    if (!touched) return;
    const { errors } = validateStageInput(
      selectedStage,
      autoReceived,
      numPassed,
      numRejected,
      numRework,
      rejectionReason,
      missingReason,
      surplusReason,
      isDiscrepancyReportSent
    );

    if (selectedStage === 'Packing' && numPassed > 0) {
      const sumSizes = Object.values(sizeBreakdown).reduce((a, b) => a + b, 0);
      if (sumSizes > 0 && sumSizes !== numPassed) {
        errors.push(`Final Packed Qty by Size sum (${sumSizes}) does not match Passed quantity (${numPassed}).`);
      }
    }

    setValidationErrors(errors);
  }, [selectedStage, autoReceived, numPassed, numRejected, numRework, rejectionReason, missingReason, surplusReason, isDiscrepancyReportSent, sizeBreakdown, touched]);

  // Check role permission
  const isViewer = currentRole === 'Viewer';
  const isQCOnly = currentRole === 'QC Inspector' && selectedStage !== 'QC';
  const isOperatorOnly = currentRole === 'Operator' && selectedStage !== batch.current_stage;
  const isSaveBlockedByRole = isViewer || isQCOnly || isOperatorOnly;

  // Handle manual explicit "Send Discrepancy Report to Admin" button
  const handleSendReportToAdmin = () => {
    if (!hasDiscrepancy) return;
    onSendDiscrepancyReport({
      batch_no: batch.batch_no,
      stage_name: selectedStage,
      current_operator: operatorName,
      previous_stage: prevStageInfo.stage,
      previous_operator: prevStageInfo.operator,
      type: variance > 0 ? 'Surplus (Received More)' : 'Shortage (Received Less)',
      expected_qty: autoReceived,
      counted_qty: totalAccounted,
      variance_qty: variance,
      message: discrepancyMessage || `Discrepancy of ${variance > 0 ? `+${variance}` : variance} pieces detected between ${prevStageInfo.stage} (${prevStageInfo.operator}) and ${selectedStage} (${operatorName}).`,
      status: 'Reported to Admin'
    });
    setIsDiscrepancyReportSent(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const { valid, errors } = validateStageInput(
      selectedStage,
      autoReceived,
      numPassed,
      numRejected,
      numRework,
      rejectionReason,
      missingReason,
      surplusReason,
      isDiscrepancyReportSent || autoFileDiscrepancy
    );

    if (selectedStage === 'Packing' && numPassed > 0) {
      const sumSizes = Object.values(sizeBreakdown).reduce((a, b) => a + b, 0);
      if (sumSizes > 0 && sumSizes !== numPassed) {
        errors.push(`Final Packed Qty by Size sum (${sumSizes}) must equal Passed quantity (${numPassed}).`);
      }
    }

    if (!valid || errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Optional Discrepancy Report object to auto-file
    let discrepancyToLog: Omit<DiscrepancyReport, 'id' | 'reported_at'> | undefined = undefined;
    if (hasDiscrepancy && (autoFileDiscrepancy || !isDiscrepancyReportSent)) {
      discrepancyToLog = {
        batch_no: batch.batch_no,
        stage_name: selectedStage,
        current_operator: operatorName,
        previous_stage: prevStageInfo.stage,
        previous_operator: prevStageInfo.operator,
        type: variance > 0 ? 'Surplus (Received More)' : 'Shortage (Received Less)',
        expected_qty: autoReceived,
        counted_qty: totalAccounted,
        variance_qty: variance,
        message: discrepancyMessage || `Auto-filed: Discrepancy of ${variance > 0 ? `+${variance}` : variance} pieces against previous stage operator ${prevStageInfo.operator}.`,
        status: 'Reported to Admin'
      };
    }

    // Submit valid record
    onSaveRecord({
      batch_no: batch.batch_no,
      stage_name: selectedStage,
      date,
      time_in: timeIn,
      operator_name: operatorName,
      qty_received: autoReceived,
      qty_passed: numPassed,
      qty_rejected: numRejected,
      qty_missing: liveMissing,
      qty_surplus: liveSurplus > 0 ? liveSurplus : undefined,
      rejection_reason: numRejected > 0 ? rejectionReason : undefined,
      missing_reason: liveMissing > 0 ? missingReason : undefined,
      surplus_reason: liveSurplus > 0 ? (surplusReason || discrepancyMessage) : undefined,
      remarks: remarks || undefined,
      fabric_rolls_used: selectedStage === 'Cutting' ? Number(fabricRolls) || 1 : undefined,
      defect_type: defectType || undefined,
      qty_rework: selectedStage === 'QC' ? numRework : undefined,
      damage_reason: selectedStage === 'Finishing' && numRejected > 0 ? rejectionReason : undefined,
      packed_by_size: selectedStage === 'Packing' ? sizeBreakdown : undefined,
      packed_by_color: selectedStage === 'Packing' ? { [batch.color]: numPassed } : undefined,
      created_by: operatorName
    }, discrepancyToLog);

    if (selectedStage === 'Packing') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 5-Stage Stepper Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Production Pipeline Stages</span>
              <span className="text-xs font-normal text-slate-400">
                (Click any completed stage to view its locked audit trail)
              </span>
            </h2>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Batch: {batch.batch_no}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {STAGES_LIST.map((stage, idx) => {
            const stageRec = activeBatchRecords.find((r) => r.stage_name === stage);
            const isDone = !!stageRec;
            const isCurrent = batch.current_stage === stage;
            const isSelected = selectedStage === stage;

            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`relative flex flex-col p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-950/50'
                    : isDone
                    ? 'border-emerald-700/50 bg-emerald-950/20 hover:bg-emerald-950/30 text-emerald-300'
                    : isCurrent
                    ? 'border-amber-500/60 bg-amber-950/20 hover:bg-amber-950/30 text-amber-300'
                    : 'border-slate-800 bg-slate-950/50 opacity-60 hover:opacity-80 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Stage {idx + 1}
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/80">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80 animate-pulse">
                      <Clock className="w-3 h-3" /> In Progress
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <div className={`p-1.5 rounded-lg ${
                    isSelected ? 'bg-indigo-600 text-white' : isDone ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {STAGE_ICONS[stage]}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100">{stage}</h3>
                    {stageRec ? (
                      <p className="text-[11px] text-emerald-400 font-semibold">
                        Out: {stageRec.qty_passed} pcs
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        {isCurrent ? 'Ready for Entry' : 'Pending'}
                      </p>
                    )}
                  </div>
                </div>

                {stageRec && (stageRec.qty_rejected > 0 || stageRec.qty_missing > 0 || (stageRec.qty_surplus && stageRec.qty_surplus > 0)) && (
                  <div className="mt-2 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-amber-400">Defect: -{stageRec.qty_rejected}</span>
                    {stageRec.qty_surplus ? (
                      <span className="text-cyan-400 font-bold">Surplus: +{stageRec.qty_surplus}</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">Missing: -{stageRec.qty_missing}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {isStageCompleted && existingRecord ? (
        /* READ-ONLY IMMUTABLE AUDIT LOG */
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Locked Audit Record (Immutable)
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
              {STAGE_ICONS[selectedStage]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {selectedStage} Stage Completed Record
              </h3>
              <p className="text-xs text-slate-400">
                Submitted on {new Date(existingRecord.submitted_at).toLocaleString()} by{' '}
                <span className="text-slate-200 font-semibold">{existingRecord.operator_name}</span>
              </p>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Pieces Received (IN)</span>
              <span className="text-2xl font-bold text-slate-100">{existingRecord.qty_received}</span>
              <span className="text-[11px] text-slate-500 block mt-1">From previous stage</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40">
              <span className="text-xs text-emerald-400 font-medium block mb-1">Pieces Passed (OUT)</span>
              <span className="text-2xl font-bold text-emerald-400">{existingRecord.qty_passed}</span>
              <span className="text-[11px] text-emerald-500/80 block mt-1">Moved to next stage</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/40">
              <span className="text-xs text-amber-400 font-medium block mb-1">Defective / Rejected</span>
              <span className="text-2xl font-bold text-amber-400">{existingRecord.qty_rejected}</span>
              <span className="text-[11px] text-amber-500/80 block mt-1">Scrapped or failed</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/40">
              <span className="text-xs text-rose-400 font-medium block mb-1">
                {existingRecord.qty_surplus ? 'Surplus / Excess' : 'Missing / Lost'}
              </span>
              <span className={`text-2xl font-bold ${
                existingRecord.qty_surplus 
                  ? 'text-cyan-400' 
                  : existingRecord.qty_missing > 0 ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {existingRecord.qty_surplus ? `+${existingRecord.qty_surplus}` : existingRecord.qty_missing}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                {existingRecord.qty_surplus ? 'Discrepancy reported to Admin' : existingRecord.qty_missing === 0 ? '0 pieces lost' : 'Unaccounted'}
              </span>
            </div>
          </div>

          {/* Defect & Missing Discrepancy details */}
          <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-sm">
            {existingRecord.rejection_reason && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-slate-300">
                <span className="font-semibold text-amber-400 min-w-[150px]">Rejection Reason:</span>
                <span className="bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-900/50 text-amber-200">
                  {existingRecord.rejection_reason}
                </span>
                {existingRecord.defect_type && (
                  <span className="text-xs text-slate-400">({existingRecord.defect_type})</span>
                )}
              </div>
            )}

            {existingRecord.missing_reason && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-slate-300">
                <span className="font-semibold text-rose-400 min-w-[150px]">Missing Explanation:</span>
                <span className="bg-rose-950/40 px-3 py-1 rounded-lg border border-rose-900/50 text-rose-200">
                  {existingRecord.missing_reason}
                </span>
              </div>
            )}

            {existingRecord.surplus_reason && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-slate-300">
                <span className="font-semibold text-cyan-400 min-w-[150px]">Surplus Audit Reason:</span>
                <span className="bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-900/50 text-cyan-200">
                  {existingRecord.surplus_reason}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* INTERACTIVE STAGE ENTRY FORM */
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
                {STAGE_ICONS[selectedStage]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Record {selectedStage} Production Stage</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    Live Session
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pieces received are auto-filled from previous stage (<strong className="text-indigo-300">{prevStageInfo.stage}</strong> by <strong className="text-slate-200">{prevStageInfo.operator}</strong>).
                </p>
              </div>
            </div>

            {/* Read-Only Auto-Fed Received Banner */}
            <div className="bg-slate-950 border border-indigo-500/30 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                  {selectedStage === 'Cutting' ? 'Pieces Planned (Master)' : `Auto-Received from ${prevStageInfo.stage}`}
                </span>
                <div className="text-xl font-extrabold text-indigo-400">
                  {autoReceived} <span className="text-xs font-normal text-slate-400">pieces</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Operator: {prevStageInfo.operator}
                </span>
              </div>
              <Info className="w-5 h-5 text-indigo-400/80" />
            </div>
          </div>

          {/* LIVE METRIC BAR (Interactively reflects Surplus or Shortage) */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Qty Received
              </span>
              <span className="text-xl font-bold text-slate-100">{autoReceived}</span>
              <span className="text-[10px] text-slate-500 block truncate">From {prevStageInfo.operator}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Qty Passed (OK)
              </span>
              <span className="text-xl font-bold text-emerald-400">{numPassed || 0}</span>
              <span className="text-[10px] text-emerald-500/70 block">Completed OK</span>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                Qty Defective
              </span>
              <span className="text-xl font-bold text-amber-400">{numRejected || 0}</span>
              <span className="text-[10px] text-amber-500/70 block">Failed / scrap</span>
            </div>

            {/* DYNAMIC 4TH BOX: SHOWS SURPLUS (EXCESS) OR MISSING (SHORTAGE) */}
            {liveSurplus > 0 ? (
              <div className="p-2.5 rounded-lg border bg-cyan-950/50 border-cyan-500/80 text-cyan-300 ring-2 ring-cyan-500/40 animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider block">
                    Qty Surplus (Excess)
                  </span>
                  <AlertTriangle className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-xl font-extrabold text-cyan-300">+{liveSurplus} pcs</span>
                <span className="text-[10px] text-cyan-200 block">Exceeds received count!</span>
              </div>
            ) : (
              <div className={`p-2.5 rounded-lg border transition-all ${
                liveMissing > 0 
                  ? 'bg-rose-950/50 border-rose-600/80 text-rose-300 ring-2 ring-rose-600/40 animate-pulse' 
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider block">
                    Qty Missing (Shortage)
                  </span>
                  {liveMissing > 0 && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                </div>
                <span className={`text-xl font-extrabold ${liveMissing > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {liveMissing > 0 ? `-${liveMissing}` : '0'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {liveMissing > 0 ? 'Shortage from previous stage' : 'Balanced count'}
                </span>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Operator Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. David Vance"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Time In <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="time"
                  required
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Quantity Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* QTY PASSED */}
            <div className="p-4 bg-emerald-950/10 border border-emerald-900/40 rounded-xl">
              <label className="block text-xs font-bold text-emerald-400 mb-1.5">
                Pieces Passed / Completed OK <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={qtyPassed}
                onChange={(e) => {
                  setTouched(true);
                  setQtyPassed(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-emerald-700/60 rounded-xl text-lg font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
              />
              <span className="text-[11px] text-emerald-500/80 mt-1 block">
                Actual count that passed OK
              </span>
            </div>

            {/* QTY REJECTED */}
            <div className="p-4 bg-amber-950/10 border border-amber-900/40 rounded-xl">
              <label className="block text-xs font-bold text-amber-400 mb-1.5">
                Pieces Rejected / Defective <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={qtyRejected}
                onChange={(e) => {
                  setTouched(true);
                  setQtyRejected(e.target.value === '' ? '' : Number(e.target.value));
                }}
                className="w-full px-3 py-2.5 bg-slate-950 border border-amber-700/60 rounded-xl text-lg font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="0"
              />
              <span className="text-[11px] text-amber-500/80 mt-1 block">
                Scrapped or defective pieces
              </span>
            </div>

            {/* QC REWORK */}
            {selectedStage === 'QC' && (
              <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl">
                <label className="block text-xs font-bold text-indigo-300 mb-1.5">
                  Pieces for Rework (Fixable)
                </label>
                <input
                  type="number"
                  min="0"
                  value={qtyRework}
                  onChange={(e) => {
                    setTouched(true);
                    setQtyRework(e.target.value === '' ? '' : Number(e.target.value));
                  }}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-indigo-700/60 rounded-xl text-lg font-bold text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
                <span className="text-[11px] text-indigo-400/80 mt-1 block">
                  Pieces sent back for alteration
                </span>
              </div>
            )}
          </div>

          {/* 🚨 THE CRITICAL DISCREPANCY SECTION: SENDS REPORT MESSAGE TO ADMIN REGARDING PREVIOUS OPERATOR */}
          {hasDiscrepancy && (
            <div className={`mb-6 p-5 rounded-2xl border transition-all ${
              variance > 0 
                ? 'bg-cyan-950/30 border-cyan-500/70' 
                : 'bg-rose-950/30 border-rose-600/70'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${variance > 0 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    <BellRing className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>
                        {variance > 0 
                          ? `🚨 Surplus Discrepancy: Received +${variance} pieces MORE than expected!`
                          : `⚠️ Shortage Discrepancy: Received ${Math.abs(variance)} pieces LESS than expected!`}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      Discrepancy regarding previous stage: <strong className="text-indigo-300">{prevStageInfo.stage}</strong> operator <strong className="text-amber-300">{prevStageInfo.operator}</strong>.
                    </p>
                  </div>
                </div>

                {isDiscrepancyReportSent ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Report Message Sent to Admin
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendReportToAdmin}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950 transition-all hover:scale-[1.02]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Incident Message to Admin</span>
                  </button>
                )}
              </div>

              {/* Breakdown comparison pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Previous Operator ({prevStageInfo.stage}):</span>
                  <span className="font-bold text-slate-200">{prevStageInfo.operator}</span>
                  <span className="text-slate-400 block text-[11px]">Sent: <strong>{autoReceived} pcs</strong></span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Operator ({selectedStage}):</span>
                  <span className="font-bold text-indigo-300">{operatorName}</span>
                  <span className="text-slate-400 block text-[11px]">Counted: <strong>{totalAccounted} pcs</strong></span>
                </div>
                <div>
                  <span className="text-slate-500 block">Net Handoff Variance:</span>
                  <span className={`font-extrabold text-sm ${variance > 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    {variance > 0 ? `+${variance} pieces (SURPLUS)` : `${variance} pieces (SHORTAGE)`}
                  </span>
                </div>
              </div>

              {/* Editable Discrepancy Report Message */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Incident Report Message to Admin:
                </label>
                <textarea
                  rows={2}
                  value={discrepancyMessage}
                  onChange={(e) => setDiscrepancyMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Detailed discrepancy report to factory administrator..."
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={autoFileDiscrepancy}
                      onChange={(e) => setAutoFileDiscrepancy(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Automatically log this Incident Report in Admin's Inbox upon saving stage</span>
                  </label>

                  {variance > 0 && (
                    <span className="text-[11px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-900/60">
                      Surplus will be officially recorded in batch audit
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Defect Reasons if qtyRejected > 0 */}
          {numRejected > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/30 border border-amber-700/60">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Defects Detected ({numRejected} pieces) — Rejection Reason Required</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Defect Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={defectType}
                    onChange={(e) => {
                      setDefectType(e.target.value);
                      if (!rejectionReason) setRejectionReason(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-800/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Choose defect classification --</option>
                    {DEFECT_OPTIONS[selectedStage]?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Detailed Rejection Reason <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specific defect explanation (e.g. Iron burn on placket)"
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-800/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Missing Explanation if liveMissing > 0 */}
          {liveMissing > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-600/80">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm mb-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                <span>⚠️ {liveMissing} pieces are unaccounted for. You must enter a reason.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-200 mb-1">
                  Missing Reason & Explanation <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={missingReason}
                  onChange={(e) => setMissingReason(e.target.value)}
                  placeholder="Where did the missing pieces go? (e.g. Dropped behind conveyer table, bundle tally mismatch)"
                  className="w-full px-3 py-2 bg-slate-950 border border-rose-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-400"
                />

                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400">Quick Pick:</span>
                  {MISSING_REASONS_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setMissingReason(suggestion)}
                      className="text-[11px] px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PACKING STAGE SPECIFIC BREAKDOWN */}
          {selectedStage === 'Packing' && (
            <div className="mb-6 p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/60">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Final Packed Qty by Size Breakdown (Mandatory at Packing)
                </h4>
                <span className="text-xs text-slate-400">
                  Total Allocated:{' '}
                  <span className="font-bold text-white">
                    {Object.values(sizeBreakdown).reduce((a, b) => a + b, 0)}
                  </span>{' '}
                  / {numPassed || 0} pcs
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <div key={sz} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <label className="block text-xs font-bold text-slate-400 text-center mb-1">
                      Size {sz}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sizeBreakdown[sz] || 0}
                      onChange={(e) =>
                        setSizeBreakdown({
                          ...sizeBreakdown,
                          [sz]: Math.max(0, Number(e.target.value) || 0)
                        })
                      }
                      className="w-full text-center py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-indigo-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Errors Box */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-600 text-rose-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Cannot Save Stage — Please resolve the following errors:</span>
              </div>
              {validationErrors.map((err, i) => (
                <div key={i} className="pl-5 list-disc">
                  • {err}
                </div>
              ))}
            </div>
          )}

          {/* Submit Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaveBlockedByRole}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all ${
                isSaveBlockedByRole
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete & Lock {selectedStage} Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
