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
  BellRing
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
  Cutting: <Scissors className="w-4 h-4" />,
  Stitching: <Layers className="w-4 h-4" />,
  QC: <CheckCircle2 className="w-4 h-4" />,
  Finishing: <Sparkles className="w-4 h-4" />,
  Packing: <Package className="w-4 h-4" />
};

export const ModuleStageTracker: React.FC<ModuleStageTrackerProps> = ({
  batch,
  records,
  onSaveRecord,
  onSendDiscrepancyReport,
  currentRole
}) => {
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
        `SURPLUS HANDOFF DISCREPANCY: Counted ${totalAccounted} pieces (+${variance} surplus) at ${selectedStage}. Previous stage (${prevStageInfo.stage}) operator ${prevStageInfo.operator} recorded sending ${autoReceived} pieces. Audit requested.`
      );
    } else if (variance < 0) {
      setDiscrepancyMessage(
        `SHORTAGE HANDOFF DISCREPANCY: Counted only ${totalAccounted} pieces (${variance} missing) at ${selectedStage}. Previous stage (${prevStageInfo.stage}) operator ${prevStageInfo.operator} recorded sending ${autoReceived} pieces. Shortage investigation initiated.`
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
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 5-Stage Stepper Navigation */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Production Pipeline Stages</span>
              <span className="text-xs font-normal text-stone-500">
                (Click any completed stage to inspect locked audit trail)
              </span>
            </h2>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
            Batch: {batch.batch_no}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {STAGES_LIST.map((stage, idx) => {
            const stageRec = activeBatchRecords.find((r) => r.stage_name === stage);
            const isDone = !!stageRec;
            const isCurrent = batch.current_stage === stage;
            const isSelected = selectedStage === stage;

            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`relative flex flex-col p-3 rounded-lg border text-left transition-all duration-150 cursor-pointer ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/30 shadow-xs'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 text-stone-800'
                    : isCurrent
                    ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/70 text-stone-900'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-500'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Stage {idx + 1}
                  </span>
                  {isDone ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Done
                    </span>
                  ) : isCurrent ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-amber-600" /> Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <div className={`p-1.5 rounded-md ${
                    isSelected ? 'bg-indigo-700 text-white' : isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200/80 text-stone-600'
                  }`}>
                    {STAGE_ICONS[stage]}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900">{stage}</h3>
                    {stageRec ? (
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Out: {stageRec.qty_passed} pcs
                      </p>
                    ) : (
                      <p className="text-[11px] text-stone-500">
                        {isCurrent ? 'Ready for Entry' : 'Pending'}
                      </p>
                    )}
                  </div>
                </div>

                {stageRec && (stageRec.qty_rejected > 0 || stageRec.qty_missing > 0 || (stageRec.qty_surplus && stageRec.qty_surplus > 0)) && (
                  <div className="mt-2 pt-1 border-t border-stone-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-amber-700">Defect: -{stageRec.qty_rejected}</span>
                    {stageRec.qty_surplus ? (
                      <span className="text-cyan-700 font-bold">Surplus: +{stageRec.qty_surplus}</span>
                    ) : (
                      <span className="text-rose-700 font-semibold">Missing: -{stageRec.qty_missing}</span>
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
        <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Locked Audit Record (Immutable)
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700">
              {STAGE_ICONS[selectedStage]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {selectedStage} Stage Completed Record
              </h3>
              <p className="text-xs text-stone-500">
                Logged on {new Date(existingRecord.submitted_at).toLocaleString()} by{' '}
                <span className="text-stone-800 font-semibold">{existingRecord.operator_name}</span>
              </p>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
              <span className="text-xs text-stone-500 block mb-1">Pieces Received (IN)</span>
              <span className="text-2xl font-bold text-stone-900">{existingRecord.qty_received}</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">From previous stage</span>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200">
              <span className="text-xs text-emerald-800 font-medium block mb-1">Pieces Passed (OUT)</span>
              <span className="text-2xl font-bold text-emerald-700">{existingRecord.qty_passed}</span>
              <span className="text-[11px] text-emerald-700/80 block mt-0.5">Moved to next stage</span>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200">
              <span className="text-xs text-amber-800 font-medium block mb-1">Defective / Rejected</span>
              <span className="text-2xl font-bold text-amber-700">{existingRecord.qty_rejected}</span>
              <span className="text-[11px] text-amber-700/80 block mt-0.5">Scrapped or failed</span>
            </div>

            <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-200">
              <span className="text-xs text-rose-800 font-medium block mb-1">
                {existingRecord.qty_surplus ? 'Surplus / Excess' : 'Missing / Lost'}
              </span>
              <span className={`text-2xl font-bold ${
                existingRecord.qty_surplus ? 'text-cyan-700' : existingRecord.qty_missing > 0 ? 'text-rose-700' : 'text-stone-400'
              }`}>
                {existingRecord.qty_surplus ? `+${existingRecord.qty_surplus}` : existingRecord.qty_missing}
              </span>
              <span className="text-[11px] text-stone-500 block mt-0.5">
                {existingRecord.qty_surplus ? 'Reported to Admin' : existingRecord.qty_missing === 0 ? '0 pieces lost' : 'Unaccounted'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-lg border border-stone-200 text-xs">
            {existingRecord.rejection_reason && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-semibold text-amber-900 min-w-[150px]">Rejection Reason:</span>
                <span className="bg-amber-100/70 px-2.5 py-1 rounded text-amber-900 border border-amber-200">
                  {existingRecord.rejection_reason}
                </span>
                {existingRecord.defect_type && (
                  <span className="text-stone-500">({existingRecord.defect_type})</span>
                )}
              </div>
            )}

            {existingRecord.missing_reason && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-semibold text-rose-900 min-w-[150px]">Missing Explanation:</span>
                <span className="bg-rose-100/70 px-2.5 py-1 rounded text-rose-900 border border-rose-200">
                  {existingRecord.missing_reason}
                </span>
              </div>
            )}

            {existingRecord.surplus_reason && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-semibold text-cyan-900 min-w-[150px]">Surplus Audit Reason:</span>
                <span className="bg-cyan-100/70 px-2.5 py-1 rounded text-cyan-900 border border-cyan-200">
                  {existingRecord.surplus_reason}
                </span>
              </div>
            )}

            {existingRecord.remarks && (
              <div className="flex items-start gap-3 pt-1">
                <span className="font-semibold text-stone-600 min-w-[150px]">Remarks:</span>
                <span className="italic text-stone-700">{existingRecord.remarks}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* INTERACTIVE STAGE ENTRY FORM */
        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-200 gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">
                {STAGE_ICONS[selectedStage]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span>Record {selectedStage} Production Stage</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    Active Session
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  Pieces received are auto-filled from previous stage (<strong className="text-indigo-700">{prevStageInfo.stage}</strong> by <strong className="text-stone-800">{prevStageInfo.operator}</strong>).
                </p>
              </div>
            </div>

            {/* Read-Only Auto-Fed Received Banner */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2 flex items-center gap-3">
              <div>
                <span className="text-[10px] font-semibold text-stone-500 block uppercase tracking-wider">
                  {selectedStage === 'Cutting' ? 'Pieces Planned (Master)' : `Auto-Received from ${prevStageInfo.stage}`}
                </span>
                <div className="text-lg font-bold text-indigo-700">
                  {autoReceived} <span className="text-xs font-normal text-stone-500">pieces</span>
                </div>
                <span className="text-[10px] text-stone-500">
                  Logged by: {prevStageInfo.operator}
                </span>
              </div>
              <Info className="w-4 h-4 text-stone-400" />
            </div>
          </div>

          {/* LIVE METRIC BAR */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
            <div className="p-2.5 rounded-md bg-white border border-stone-200/80 shadow-xs">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                Qty Received
              </span>
              <span className="text-xl font-bold text-stone-900">{autoReceived}</span>
              <span className="text-[10px] text-stone-500 block truncate">From {prevStageInfo.operator}</span>
            </div>

            <div className="p-2.5 rounded-md bg-emerald-50/60 border border-emerald-200">
              <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Qty Passed (OK)
              </span>
              <span className="text-xl font-bold text-emerald-700">{numPassed || 0}</span>
              <span className="text-[10px] text-emerald-700/80 block">Completed OK</span>
            </div>

            <div className="p-2.5 rounded-md bg-amber-50/60 border border-amber-200">
              <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
                Qty Defective
              </span>
              <span className="text-xl font-bold text-amber-700">{numRejected || 0}</span>
              <span className="text-[10px] text-amber-700/80 block">Failed / scrap</span>
            </div>

            {/* DYNAMIC 4TH BOX: SHOWS SURPLUS (EXCESS) OR MISSING (SHORTAGE) */}
            {liveSurplus > 0 ? (
              <div className="p-2.5 rounded-md border bg-cyan-50 border-cyan-300 text-cyan-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-cyan-800">
                    Qty Surplus (Excess)
                  </span>
                  <AlertTriangle className="w-3.5 h-3.5 text-cyan-700" />
                </div>
                <span className="text-xl font-extrabold text-cyan-800">+{liveSurplus} pcs</span>
                <span className="text-[10px] text-cyan-700 block">Exceeds received count!</span>
              </div>
            ) : (
              <div className={`p-2.5 rounded-md border transition-all ${
                liveMissing > 0 
                  ? 'bg-rose-50 border-rose-300 text-rose-900' 
                  : 'bg-white border-stone-200/80 text-stone-600'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider block">
                    Qty Missing (Shortage)
                  </span>
                  {liveMissing > 0 && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                </div>
                <span className={`text-xl font-extrabold ${liveMissing > 0 ? 'text-rose-700' : 'text-stone-400'}`}>
                  {liveMissing > 0 ? `-${liveMissing}` : '0'}
                </span>
                <span className="text-[10px] text-stone-500 block">
                  {liveMissing > 0 ? 'Shortage from previous stage' : 'Balanced count'}
                </span>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Current Operator Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-base sm:text-xs text-stone-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                  placeholder="e.g. David Vance"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-base sm:text-xs text-stone-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Time In <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="time"
                  required
                  value={timeIn}
                  onChange={(e) => setTimeIn(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-base sm:text-xs text-stone-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Quantity Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* QTY PASSED */}
            <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg">
              <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                Pieces Passed / Completed OK <span className="text-rose-600">*</span>
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
                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-lg font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                placeholder="0"
              />
              <span className="text-[11px] text-emerald-700/80 mt-1 block">
                Actual count that passed OK
              </span>
            </div>

            {/* QTY REJECTED */}
            <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-lg">
              <label className="block text-xs font-bold text-amber-900 mb-1.5">
                Pieces Rejected / Defective <span className="text-rose-600">*</span>
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
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-lg font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                placeholder="0"
              />
              <span className="text-[11px] text-amber-700/80 mt-1 block">
                Scrapped or defective pieces
              </span>
            </div>

            {/* QC REWORK */}
            {selectedStage === 'QC' && (
              <div className="p-4 bg-indigo-50/40 border border-indigo-200 rounded-lg">
                <label className="block text-xs font-bold text-indigo-900 mb-1.5">
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
                  className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-lg font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  placeholder="0"
                />
                <span className="text-[11px] text-indigo-700/80 mt-1 block">
                  Pieces sent back for alteration
                </span>
              </div>
            )}
          </div>

          {/* DISCREPANCY SECTION: SENDS REPORT MESSAGE TO ADMIN REGARDING PREVIOUS OPERATOR */}
          {hasDiscrepancy && (
            <div className={`mb-6 p-4 rounded-xl border transition-all ${
              variance > 0 
                ? 'bg-cyan-50/70 border-cyan-300' 
                : 'bg-rose-50/70 border-rose-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-stone-200/80">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${variance > 0 ? 'bg-cyan-100 text-cyan-800' : 'bg-rose-100 text-rose-800'}`}>
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <span>
                        {variance > 0 
                          ? `Surplus Discrepancy: Received +${variance} pieces MORE than expected`
                          : `Shortage Discrepancy: Received ${Math.abs(variance)} pieces LESS than expected`}
                      </span>
                    </h4>
                    <p className="text-[11px] text-stone-600">
                      Discrepancy regarding previous stage: <strong className="text-indigo-800">{prevStageInfo.stage}</strong> operator <strong className="text-stone-900">{prevStageInfo.operator}</strong>.
                    </p>
                  </div>
                </div>

                {isDiscrepancyReportSent ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Report Message Sent to Admin
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendReportToAdmin}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Incident Message to Admin</span>
                  </button>
                )}
              </div>

              {/* Comparison chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3 text-xs bg-white p-3 rounded-lg border border-stone-200">
                <div>
                  <span className="text-stone-500 block text-[11px]">Previous Operator ({prevStageInfo.stage}):</span>
                  <span className="font-bold text-stone-900">{prevStageInfo.operator}</span>
                  <span className="text-stone-500 block text-[10px]">Sent: <strong>{autoReceived} pcs</strong></span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Current Operator ({selectedStage}):</span>
                  <span className="font-bold text-indigo-700">{operatorName}</span>
                  <span className="text-stone-500 block text-[10px]">Counted: <strong>{totalAccounted} pcs</strong></span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Net Handoff Variance:</span>
                  <span className={`font-extrabold text-xs ${variance > 0 ? 'text-cyan-800' : 'text-rose-700'}`}>
                    {variance > 0 ? `+${variance} pieces (SURPLUS)` : `${variance} pieces (SHORTAGE)`}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Incident Report Message to Factory Admin:
                </label>
                <textarea
                  rows={2}
                  value={discrepancyMessage}
                  onChange={(e) => setDiscrepancyMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-indigo-600 font-mono shadow-xs"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-700">
                    <input
                      type="checkbox"
                      checked={autoFileDiscrepancy}
                      onChange={(e) => setAutoFileDiscrepancy(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Automatically log this Incident in Admin Inbox upon completing stage</span>
                  </label>

                  {variance > 0 && (
                    <span className="text-[11px] text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded font-medium">
                      Surplus logged in batch audit
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Defect Reasons */}
          {numRejected > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-amber-50/60 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-2">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Defects Detected ({numRejected} pieces) — Rejection Reason Required</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select Defect Type <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={defectType}
                    onChange={(e) => {
                      setDefectType(e.target.value);
                      if (!rejectionReason) setRejectionReason(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-indigo-600 cursor-pointer shadow-xs"
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Detailed Rejection Reason <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Specific defect explanation (e.g. Iron burn on placket)"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Missing Explanation */}
          {liveMissing > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50/60 border border-rose-200">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{liveMissing} pieces unaccounted for — Explanation Required</span>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={missingReason}
                  onChange={(e) => setMissingReason(e.target.value)}
                  placeholder="Where did the missing pieces go? (e.g. Dropped behind table, bundle tally mismatch)"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-rose-600 shadow-xs"
                />

                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-stone-500">Suggestions:</span>
                  {MISSING_REASONS_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setMissingReason(suggestion)}
                      className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 cursor-pointer shadow-xs"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PACKING BREAKDOWN */}
          {selectedStage === 'Packing' && (
            <div className="mb-6 p-4 rounded-lg bg-indigo-50/50 border border-indigo-200">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-700" />
                  Final Packed Qty by Size Breakdown (Mandatory at Packing)
                </h4>
                <span className="text-xs text-stone-500">
                  Total Allocated: <strong className="text-stone-900">{Object.values(sizeBreakdown).reduce((a, b) => a + b, 0)}</strong> / {numPassed || 0} pcs
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <div key={sz} className="bg-white p-2 rounded-lg border border-stone-200 shadow-xs">
                    <label className="block text-[11px] font-bold text-stone-500 text-center mb-1">
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
                      className="w-full text-center py-1 bg-stone-50 border border-stone-200 rounded text-xs font-bold text-indigo-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors Box */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Cannot Save Stage — Resolve the following:</span>
              </div>
              {validationErrors.map((err, i) => (
                <div key={i} className="pl-5 list-disc text-rose-700">
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
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-lg font-bold sm:font-semibold text-sm sm:text-xs shadow-md sm:shadow-sm transition-all cursor-pointer ${
                isSaveBlockedByRole
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-indigo-700 hover:bg-indigo-800 active:scale-[0.98] text-white'
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
