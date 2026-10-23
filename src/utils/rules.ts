import { ProductionStage, ProductionBatch, StageRecord } from '../types';
import { STAGES_LIST } from './storage';

export interface StageCalculation {
  qty_received: number;
  qty_passed: number;
  qty_rejected: number;
  qty_rework: number;
  qty_missing: number;
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
  if (stage === 'QC') {
    return Math.max(0, received - (passed + rework + rejected));
  }
  return Math.max(0, received - (passed + rejected));
}

export function validateStageInput(
  stage: ProductionStage,
  received: number,
  passed: number,
  rejected: number,
  rework: number = 0,
  rejectionReason: string = '',
  missingReason: string = ''
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const totalAccounted = passed + rejected + (stage === 'QC' ? rework : 0);
  
  if (totalAccounted > received) {
    errors.push(`Total pieces (${totalAccounted}) exceed what was received (${received}).`);
  }

  const missing = computeStageMissing(stage, received, passed, rejected, rework);

  // RULE 2: Block if Missing and No Reason
  if (missing > 0 && (!missingReason || missingReason.trim().length === 0)) {
    errors.push(`⚠️ ${missing} piece${missing > 1 ? 's are' : ' is'} unaccounted for. You must enter a reason.`);
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
    errors
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
  let finalPassedOutput = 0;

  STAGES_LIST.forEach(stageName => {
    const rec = batchRecords.find(r => r.stage_name === stageName);
    if (rec) {
      totalRejected += rec.qty_rejected;
      totalMissing += rec.qty_missing;
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

  const totalLoss = totalRejected + totalMissing;
  const planned = batch.total_planned_qty;
  const efficiency = planned > 0 ? ((finalPassedOutput / planned) * 100).toFixed(1) : '0';
  const lossPercentage = planned > 0 ? ((totalLoss / planned) * 100).toFixed(1) : '0';

  const isHighLoss = Number(lossPercentage) > 5;

  return {
    planned,
    finalPassedOutput,
    totalRejected,
    totalMissing,
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
