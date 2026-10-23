import React, { useState, useEffect } from 'react';
import { Product, ProductionBatch, StageRecord, UserRole, ProductionStage } from './types';
import { 
  getStoredProducts, 
  saveProducts, 
  getStoredBatches, 
  saveBatches, 
  getStoredStageRecords, 
  saveStageRecords, 
  resetStorageToDefaults 
} from './utils/storage';
import { getNextStage, getBatchSummaryMetrics } from './utils/rules';
import { Navbar } from './components/Navbar';
import { BatchSelector } from './components/BatchSelector';
import { ModuleStageTracker } from './components/ModuleStageTracker';
import { ModuleBatchDashboard } from './components/ModuleBatchDashboard';
import { ModuleReports } from './components/ModuleReports';
import { ModuleMasterData } from './components/ModuleMasterData';
import { AlertsDrawer } from './components/AlertsDrawer';
import { Scissors, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export function App() {
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [batches, setBatches] = useState<ProductionBatch[]>(getStoredBatches);
  const [records, setRecords] = useState<StageRecord[]>(getStoredStageRecords);
  const [selectedBatchNo, setSelectedBatchNo] = useState<string>(() => batches[0]?.batch_no || 'BATCH-2026-001');
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState<'tracker' | 'dashboard' | 'master' | 'reports'>('tracker');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveBatches(batches);
  }, [batches]);

  useEffect(() => {
    saveStageRecords(records);
  }, [records]);

  // Current active batch object
  const currentBatch = batches.find(b => b.batch_no === selectedBatchNo) || batches[0];

  // Count active alerts
  const totalMissingRecords = records.filter(r => r.qty_missing > 0).length;
  const highLossBatchesCount = batches.filter(b => getBatchSummaryMetrics(b, records).isHighLoss).length;
  const totalAlertsCount = totalMissingRecords + highLossBatchesCount;

  // Save new stage record & advance batch stage automatically (RULE 4)
  const handleSaveStageRecord = (recordData: Omit<StageRecord, 'id' | 'submitted_at'>) => {
    const newRecordId = `REC-${Date.now().toString().slice(-6)}-${recordData.stage_name.toUpperCase()}`;
    const newRecord: StageRecord = {
      ...recordData,
      id: newRecordId,
      submitted_at: new Date().toISOString()
    };

    const nextStageName = getNextStage(recordData.stage_name);
    const isCompleted = recordData.stage_name === 'Packing';

    // Update batch stage & status
    const updatedBatches = batches.map(b => {
      if (b.batch_no === recordData.batch_no) {
        return {
          ...b,
          current_stage: isCompleted ? 'Completed' : nextStageName,
          status: isCompleted ? ('Completed' as const) : b.status
        };
      }
      return b;
    });

    const updatedRecords = [...records, newRecord];

    setRecords(updatedRecords);
    setBatches(updatedBatches);

    setNotification({
      message: `✅ ${recordData.stage_name} stage logged successfully! ${
        isCompleted ? '🎉 Batch completed.' : `Next stage is ${nextStageName}.`
      }`,
      type: 'success'
    });

    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddBatch = (newBatch: ProductionBatch) => {
    setBatches(prev => [newBatch, ...prev]);
    setSelectedBatchNo(newBatch.batch_no);
    setActiveTab('tracker');
    setNotification({
      message: `🚀 Batch ${newBatch.batch_no} created with ${newBatch.total_planned_qty} planned pieces!`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    setNotification({
      message: `✨ Product ${newProduct.product_code} registered in Master Data!`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all production batches, products, and stage records to demo data?')) {
      resetStorageToDefaults();
      setProducts(getStoredProducts());
      setBatches(getStoredBatches());
      setRecords(getStoredStageRecords());
      setSelectedBatchNo(getStoredBatches()[0]?.batch_no || 'BATCH-2026-001');
      setNotification({
        message: '🔄 Data reset to default factory sample records.',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onResetData={handleResetData}
        alertCount={totalAlertsCount}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="px-4 py-3 rounded-xl bg-slate-900 border border-indigo-500 shadow-2xl text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active Batch Selector Strip (Always visible except master data tab) */}
        {activeTab !== 'master' && currentBatch && (
          <BatchSelector
            batches={batches}
            selectedBatchNo={selectedBatchNo}
            onSelectBatch={setSelectedBatchNo}
            onNewBatchClick={() => {
              setActiveTab('master');
            }}
            currentRole={currentRole}
          />
        )}

        {/* Tab 1: Stage Tracker (Core Module) */}
        {activeTab === 'tracker' && currentBatch && (
          <ModuleStageTracker
            batch={currentBatch}
            records={records}
            onSaveRecord={handleSaveStageRecord}
            currentRole={currentRole}
          />
        )}

        {/* Tab 2: Live Batch Dashboard */}
        {activeTab === 'dashboard' && currentBatch && (
          <ModuleBatchDashboard
            batch={currentBatch}
            records={records}
            onSelectStageTab={(stage) => {
              setActiveTab('tracker');
            }}
          />
        )}

        {/* Tab 3: Reports & Audit */}
        {activeTab === 'reports' && (
          <ModuleReports batches={batches} records={records} />
        )}

        {/* Tab 4: Master Data & Batches */}
        {activeTab === 'master' && (
          <ModuleMasterData
            products={products}
            batches={batches}
            onAddProduct={handleAddProduct}
            onAddBatch={handleAddBatch}
            currentRole={currentRole}
          />
        )}
      </main>

      {/* Alerts Slideover Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        batches={batches}
        records={records}
        onSelectBatch={(bNo) => {
          setSelectedBatchNo(bNo);
          setActiveTab('dashboard');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 mt-12 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Taskora-AI Garment Production Quantity & Loss Tracking Engine</span>
          </div>
          <div>
            Sequence: Cutting &rarr; Stitching &rarr; QC &rarr; Finishing &rarr; Packing
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
