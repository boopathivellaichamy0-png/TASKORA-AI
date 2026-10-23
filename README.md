# Taskora-AI — Garment Production Quantity Tracking System

> **A mission-critical accountability engine designed exclusively for garment manufacturing facilities.**
> Tracks every single garment piece moving through each production stage: **Cutting &rarr; Stitching &rarr; QC &rarr; Finishing &rarr; Packing**, detects missing or failed pieces in real-time, and enforces operator accountability.

---

## 🎯 Core Purpose

> **"At every production stage, record how many pieces came IN, how many went OUT (passed), how many were rejected/defective, and automatically flag any missing pieces — and force the operator to explain why."**

---

## 🚀 Key Modules & System Features

### 1. 📦 Product & Production Batch Master
* **Garment Master Data:** Style codes, garment names, categories, available size ranges, and colorways.
* **Production Batch Setup:** Batch ID generator (`BATCH-2026-001`), planned master quantity baseline, assigned delivery target, and creator.
* Master baseline tracking: All losses throughout the factory floor are reconciled against `total_planned_qty`.

### 2. 🏭 Strict Stage-Wise Tracking & The 5 Critical Rules
Sequentially tracks:
`Cutting` &rarr; `Stitching` &rarr; `Quality Check (QC)` &rarr; `Finishing / Ironing` &rarr; `Packing`

* **RULE 1 — Live Missing Calculation:**
  $$\text{qty\_missing} = \text{qty\_received} - \text{qty\_passed} - \text{qty\_rejected} - (\text{qty\_rework})$$
  Updates interactively as the operator types.
* **RULE 2 — Enforced Missing Reason:**
  If `qty_missing > 0`, the system blocks submission until a concrete explanation is provided.
* **RULE 3 — Mandatory Defect Classification:**
  If `qty_rejected > 0`, the system blocks submission until a defect category and explanation are provided.
* **RULE 4 — Automated Stage Handoff:**
  Previous stage's `qty_passed` becomes the next stage's `qty_received` automatically.
* **RULE 5 — Physical Input Ceiling:**
  $(\text{qty\_passed} + \text{qty\_rejected}) \le \text{qty\_received}$ is strictly enforced.
* **Immutable Audit Trail:**
  Past completed stage records are permanently locked to preserve inspection integrity.

### 3. 📊 Live Batch Summary Dashboard
* Summary table showing **Stage | Qty In | Qty Passed | Qty Rejected | Qty Missing | Status**.
* Color-coded loss indicators:
  * 🟢 **Green:** $0$ missing pieces.
  * 🟡 **Yellow:** $\le 2\%$ input loss.
  * 🔴 **Red:** $> 2\%$ input loss.
* Comprehensive batch totals: Master Planned vs. Final Passed Output, Total Rejected, Total Missing, Total Loss, and Overall Factory Yield Efficiency $\%$.

### 4. 🚨 Real-time Loss Alerts & Notifications
* **Shortage Detected:** Flags any stage with unaccounted missing units.
* **High Loss Alert:** Emits high-priority warnings if total batch loss exceeds the 5% threshold.
* **Celebration:** Triggers celebratory feedback upon successful completion of the final Packing run.

### 5. 📈 6 Specialized Exportable Reports (CSV + Print)
1. **Batch Progress Report:** Full stage-by-stage pipeline handoff status.
2. **Missing Pieces Report:** Audit log of missing pieces with reasons, operator names, and dates.
3. **Rejection & Scrap Report:** Defect categorization and root cause descriptions.
4. **Production Efficiency Report:** Planned master vs. final passed output and efficiency percentages.
5. **Operator Performance Report:** Accountability tracking per operator across all workstations.
6. **Daily Stage Throughput:** Aggregate volume and pass-rates across all stages.

### 6. 🔐 Role-Based Access Control
* **Admin:** Full control across all batches, stages, and master data.
* **Stage Supervisor:** Operational entry and batch creation.
* **Operator:** Stage data entry for their assigned station.
* **QC Inspector:** Dedicated quality inspection and rework sorting.
* **Viewer:** Read-only access to batch summaries and reports.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS v4, Lucide Icons
* **Persistence:** Client-side LocalStorage engine with factory seed data and one-click demo reset
* **Animation & Visuals:** Canvas Confetti

---

## 💻 Local Development Setup

To run the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open your browser at `http://localhost:5173` (or the URL printed in your terminal).

---

## 📝 License
Proprietary — Developed for Garment Manufacturing Production Operations.
