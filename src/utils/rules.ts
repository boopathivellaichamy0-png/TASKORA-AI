import { ProductionStage, ProductionBatch, StageRecord } from '../types';
import { STAGES_LIST } from './storage';

export interface StageCalculation {
  qty_received: number;
  qty_passed: number;
  qty_rejected: number;
  qty_rework: number;
  qty_missing: number;
  qty_surplus: number;
  isValidTotal: boolean;
  errorMessage?: string;
}

export function computeStageMissing(
  stage: ProductionStage,
  received: number,
  passed: number,
  rejected: number,
  rework: number = 0
): number {
  const total = passed + rejected + (stage === 'QC' ? rework : 0);
  if (total < received) {
    return received - total;
  }
  return 0;
}

export function computeStageSurplus(
  stage: ProductionStage,
  received: number,
  passed: number,
  rejected: number,
  rework: number = 0
): number {
  const total = passed + rejected + (stage === 'QC' ? rework : 0);
  if (total > received) {
    return total - received;
  }
  return 0;
}

export function getPreviousStageInfo(
  batch: ProductionBatch,
  currentStage: ProductionStage,
  records: StageRecord[]
): { stage: ProductionStage | 'Planning Master'; operator: string; recordedQty: number } {
  if (currentStage === 'Cutting') {
    return {
      stage: 'Planning Master',
      operator: batch.created_by || 'Production Manager',
      recordedQty: batch.total_planned_qty
    };
  }

  const prevStage = getPreviousStage(currentStage);
  if (!prevStage) {
    return {
      stage: 'Planning Master',
      operator: batch.created_by || 'Production Manager',
      recordedQty: batch.total_planned_qty
    };
  }

  const prevRecord = records.find(r => r.batch_no === batch.batch_no && r.stage_name === prevStage);
  return {
    stage: prevStage,
    operator: prevRecord ? prevRecord.operator_name : 'Previous Stage Operator',
    recordedQty: prevRecord ? prevRecord.qty_passed : 0
  };
}

export function validateStageInput(
  stage: ProductionStage,
  received: number,
  passed: number,
  rejected: number,
  rework: number = 0,
  rejectionReason: string = '',
  missingReason: string = '',
  surplusReason: string = '',
  isDiscrepancyReportSent: boolean = false
): { valid: boolean; errors: string[]; isSurplus: boolean; surplusQty: number } {
  const errors: string[] = [];

  const totalAccounted = passed + rejected + (stage === 'QC' ? rework : 0);
  const surplusQty = computeStageSurplus(stage, received, passed, rejected, rework);
  const isSurplus = surplusQty > 0;

  // RULE for Surplus: If counted pieces exceed received from previous stage,
  // operator must document surplus reason and send discrepancy report to Admin!
  if (isSurplus && !isDiscrepancyReportSent && (!surplusReason || surplusReason.trim().length === 0)) {
    errors.push(`⚠️ Surplus Detected: ${totalAccounted} pieces exceed received (${received}) by +${surplusQty} pieces. You must document an explanation and send an Incident Report to Admin regarding the previous stage operator.`);
  }

  const missing = computeStageMissing(stage, received, passed, rejected, rework);

  // RULE 2: Block if Missing and No Reason
  if (missing > 0 && (!missingReason || missingReason.trim().length === 0)) {
    errors.push(`⚠️ Shortage Detected: ${missing} piece${missing > 1 ? 's are' : ' is'} unaccounted for. You must enter a reason.`);
  }

  // RULE 3: Block if Rejected and No Reason
  if (rejected > 0 && (!rejectionReason || rejectionReason.trim().length === 0)) {
    errors.push('⚠️ You have rejected pieces. You must select or provide a rejection reason.');
  }

  if (passed < 0 || rejected < 0 || (stage === 'QC' && rework < 0)) {
    errors.push('Quantities cannot be negative.');
  }

  return {
    valid: errors.length === 0,
    errors,
    isSurplus,
    surplusQty
  };
}

export function getStatusColor(missing: number, received: number): 'green' | 'yellow' | 'red' {
  if (received <= 0) return 'green';
  if (missing === 0) return 'green';
  const ratio = missing / received;
  if (ratio <= 0.02) return 'yellow';
  return 'red';
}

export function getBatchSummaryMetrics(batch: ProductionBatch, records: StageRecord[]) {
  const batchRecords = records.filter(r => r.batch_no === batch.batch_no);
  
  let totalRejected = 0;
  let totalMissing = 0;
  let totalSurplus = 0;
  let finalPassedOutput = 0;

  STAGES_LIST.forEach(stageName => {
    const rec = batchRecords.find(r => r.stage_name === stageName);
    if (rec) {
      totalRejected += rec.qty_rejected;
      totalMissing += rec.qty_missing;
      if (rec.qty_surplus) {
        totalSurplus += rec.qty_surplus;
      }
      if (stageName === 'Packing') {
        finalPassedOutput = rec.qty_passed;
      }
    }
  });

  // If not packed yet, take the latest completed stage passed qty as current progress
  if (finalPassedOutput === 0 && batchRecords.length > 0) {
    const lastRecord = [...batchRecords].sort((a, b) => 
      STAGES_LIST.indexOf(b.stage_name) - STAGES_LIST.indexOf(a.stage_name)
    )[0];
    finalPassedOutput = lastRecord.qty_passed;
  }

  const totalLoss = Math.max(0, totalRejected + totalMissing - totalSurplus);
  const planned = batch.total_planned_qty;
  const efficiency = planned > 0 ? ((finalPassedOutput / planned) * 100).toFixed(1) : '0';
  const lossPercentage = planned > 0 ? ((totalLoss / planned) * 100).toFixed(1) : '0';

  const isHighLoss = Number(lossPercentage) > 5;

  return {
    planned,
    finalPassedOutput,
    totalRejected,
    totalMissing,
    totalSurplus,
    totalLoss,
    efficiency: Number(efficiency),
    lossPercentage: Number(lossPercentage),
    isHighLoss,
    completedStagesCount: batchRecords.length
  };
}

export function getNextStage(current: ProductionStage): ProductionStage | 'Completed' {
  const idx = STAGES_LIST.indexOf(current);
  if (idx === -1 || idx === STAGES_LIST.length - 1) {
    return 'Completed';
  }
  return STAGES_LIST[idx + 1];
}

export function getPreviousStage(current: ProductionStage): ProductionStage | null {
  const idx = STAGES_LIST.indexOf(current);
  if (idx <= 0) return null;
  return STAGES_LIST[idx - 1];
}

export function getAutoQtyReceivedForStage(
  batch: ProductionBatch,
  stage: ProductionStage,
  records: StageRecord[]
): number {
  if (stage === 'Cutting') {
    return batch.total_planned_qty;
  }
  const prevStage = getPreviousStage(stage);
  if (!prevStage) return 0;
  const prevRecord = records.find(r => r.batch_no === batch.batch_no && r.stage_name === prevStage);
  return prevRecord ? prevRecord.qty_passed : 0;
}
