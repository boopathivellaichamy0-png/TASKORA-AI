import React, { useState, useEffect } from 'react';
import { Product, ProductionBatch, StageRecord, UserRole, DiscrepancyReport } from './types';
import { 
  getStoredProducts, 
  saveProducts, 
  getStoredBatches, 
  saveBatches, 
  getStoredStageRecords, 
  saveStageRecords, 
  getStoredDiscrepancies,
  saveDiscrepancies,
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
import { SynapseLanding } from './components/SynapseLanding';

export function App() {
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [batches, setBatches] = useState<ProductionBatch[]>(getStoredBatches);
  const [records, setRecords] = useState<StageRecord[]>(getStoredStageRecords);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyReport[]>(getStoredDiscrepancies);
  const [selectedBatchNo, setSelectedBatchNo] = useState<string>(() => batches[0]?.batch_no || 'BATCH-2026-001');
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState<'synapse' | 'tracker' | 'dashboard' | 'master' | 'reports'>('synapse');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
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

  useEffect(() => {
    saveDiscrepancies(discrepancies);
  }, [discrepancies]);

  // Current active batch object
  const currentBatch = batches.find(b => b.batch_no === selectedBatchNo) || batches[0];

  // Count active alerts & discrepancies
  const totalMissingRecords = records.filter(r => r.qty_missing > 0).length;
  const highLossBatchesCount = batches.filter(b => getBatchSummaryMetrics(b, records).isHighLoss).length;
  const openDiscrepanciesCount = discrepancies.filter(d => d.status !== 'Resolved by Admin').length;
  const totalAlertsCount = totalMissingRecords + highLossBatchesCount;

  // Handle explicit or auto-filed discrepancy report to Admin
  const handleSendDiscrepancyReport = (reportData: Omit<DiscrepancyReport, 'id' | 'reported_at'>) => {
    const newReport: DiscrepancyReport = {
      ...reportData,
      id: `DISC-${Date.now().toString().slice(-4)}`,
      reported_at: new Date().toISOString()
    };

    setDiscrepancies(prev => [newReport, ...prev]);
    setNotification({
      message: `📩 Discrepancy Report sent to Admin regarding previous operator ${reportData.previous_operator} (${reportData.previous_stage})!`,
      type: 'alert'
    });

    setTimeout(() => setNotification(null), 6000);
  };

  const handleUpdateDiscrepancyStatus = (
    id: string, 
    status: 'Reported to Admin' | 'Under Investigation' | 'Resolved by Admin'
  ) => {
    setDiscrepancies(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    setNotification({
      message: `Updated Discrepancy Incident status to: ${status}`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Save new stage record & advance batch stage automatically (RULE 4)
  const handleSaveStageRecord = (
    recordData: Omit<StageRecord, 'id' | 'submitted_at'>,
    discrepancyToLog?: Omit<DiscrepancyReport, 'id' | 'reported_at'>
  ) => {
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

    // If an incident discrepancy occurred, log it to Admin
    if (discrepancyToLog) {
      handleSendDiscrepancyReport(discrepancyToLog);
    }

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
      setDiscrepancies(getStoredDiscrepancies());
      setSelectedBatchNo(getStoredBatches()[0]?.batch_no || 'BATCH-2026-001');
      setNotification({
        message: '🔄 Data reset to default factory sample records.',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  if (activeTab === 'synapse') {
    return (
      <SynapseLanding
        onLaunchTracker={() => setActiveTab('tracker')}
        onOpenDashboard={() => setActiveTab('dashboard')}
        onOpenReports={() => setActiveTab('reports')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-stone-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onResetData={handleResetData}
        alertCount={totalAlertsCount}
        discrepancyCount={openDiscrepanciesCount}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-fadeIn">
          <div className="px-4 py-3 rounded-xl bg-stone-900 text-white shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-stone-800">
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Active Batch Selector Strip */}
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

        {/* Tab 1: Stage Tracker (Core Module with Discrepancy Reporting to Admin) */}
        {activeTab === 'tracker' && currentBatch && (
          <ModuleStageTracker
            batch={currentBatch}
            records={records}
            onSaveRecord={handleSaveStageRecord}
            onSendDiscrepancyReport={handleSendDiscrepancyReport}
            currentRole={currentRole}
          />
        )}

        {/* Tab 2: Live Batch Dashboard */}
        {activeTab === 'dashboard' && currentBatch && (
          <ModuleBatchDashboard
            batch={currentBatch}
            records={records}
            onSelectStageTab={() => {
              setActiveTab('tracker');
            }}
          />
        )}

        {/* Tab 3: Reports & Audit */}
        {activeTab === 'reports' && (
          <ModuleReports
            batches={batches}
            records={records}
            selectedBatchNo={selectedBatchNo}
            onSelectBatch={setSelectedBatchNo}
          />
        )}

        {/* Tab 4: Master Data & Batches */}
        {activeTab === 'master' && (
          <ModuleMasterData
            products={products}
            batches={batches}
            records={records}
            selectedBatchNo={selectedBatchNo}
            onSelectBatch={setSelectedBatchNo}
            onNavigateTo={(tab) => setActiveTab(tab)}
            onAddProduct={handleAddProduct}
            onAddBatch={handleAddBatch}
            currentRole={currentRole}
          />
        )}
      </main>

      {/* Alerts & Discrepancies Slideover Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        batches={batches}
        records={records}
        discrepancies={discrepancies}
        onUpdateDiscrepancyStatus={handleUpdateDiscrepancyStatus}
        onSelectBatch={(bNo) => {
          setSelectedBatchNo(bNo);
          setActiveTab('dashboard');
        }}
      />

      {/* Footer (Desktop only) */}
      <footer className="hidden md:block border-t border-stone-200 py-6 mt-12 bg-white text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-stone-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Taskora AI — Garment Production Accountability Engine</span>
          </div>
          <div className="text-stone-400">
            Pipeline: Cutting &rarr; Stitching &rarr; QC &rarr; Finishing &rarr; Packing
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
