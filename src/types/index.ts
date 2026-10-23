export type ProductionStage = 'Cutting' | 'Stitching' | 'QC' | 'Finishing' | 'Packing';

export type BatchStatus = 'Active' | 'Completed' | 'On Hold';

export type UserRole = 'Admin' | 'Stage Supervisor' | 'Operator' | 'QC Inspector' | 'Viewer';

export interface Product {
  product_code: string;
  product_name: string;
  category: string;
  sizes_available: string[];
  colors_available: string[];
  description?: string;
  created_at: string;
}

export interface ProductionBatch {
  batch_no: string;
  product_code: string;
  product_name: string;
  size: string;
  color: string;
  date_created: string;
  total_planned_qty: number;
  current_stage: ProductionStage | 'Completed';
  status: BatchStatus;
  created_by: string;
  target_delivery_date?: string;
  notes?: string;
}

export interface StageRecord {
  id: string;
  batch_no: string;
  stage_name: ProductionStage;
  date: string;
  time_in: string;
  operator_name: string;
  qty_received: number;
  qty_passed: number;
  qty_rejected: number;
  qty_missing: number;
  rejection_reason?: string;
  missing_reason?: string;
  remarks?: string;

  // Stage-specific fields
  fabric_rolls_used?: number; // Cutting
  defect_type?: string; // Stitching, QC, Finishing
  qty_rework?: number; // QC: Pieces that can be fixed
  damage_reason?: string; // Finishing
  packed_by_size?: Record<string, number>; // Packing
  packed_by_color?: Record<string, number>; // Packing

  submitted_at: string;
  created_by: string;
}

export interface DefectOption {
  stage: ProductionStage;
  category: string;
  reasons: string[];
}
