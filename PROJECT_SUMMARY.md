# JASPEL - Enterprise Incentive & KPI System
## Project Summary & Architecture

### 🎯 Tujuan Proyek

Membangun sistem manajemen insentif dan KPI enterprise yang:
- Mendukung struktur KPI kompleks (P1, P2, P3)
- Memiliki isolasi data ketat dengan Row Level Security (RLS)
- Menggunakan kalkulasi finansial presisi tinggi
- Menyediakan dashboard modern untuk 3 role berbeda

### 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Superadmin │  │ Unit Manager │  │   Employee   │      │
│  │   Dashboard  │  │   Dashboard  │  │   Dashboard  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         Next.js 15 App Router + Shadcn UI + Tailwind        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Server Actions (Next.js 15)                │   │
│  │  • Calculation Service (P1, P2, P3 Logic)           │   │
│  │  • KPI Calculator (Decimal.js - High Precision)     │   │
│  │  • Export Services (Excel, PDF)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Supabase Client (SSR + Browser)             │   │
│  │  • Authentication (Email/Password)                  │   │
│  │  • Row Level Security (RLS Policies)                │   │
│  │  • Real-time Subscriptions (Optional)               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│                   Supabase (PostgreSQL)                      │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  Master Tables   │  │    Transaction Tables        │    │
│  │  • m_units       │  │    • t_pool                  │    │
│  │  • m_employees   │  │    • t_realization           │    │
│  │  • m_kpi_*       │  │    • t_individual_scores     │    │
│  │                  │  │    • t_calculation_results   │    │
│  └──────────────────┘  └──────────────────────────────┘    │
│                                                              │
│  RLS Policies: Superadmin | Unit Manager | Employee         │
└─────────────────────────────────────────────────────────────┘
```

### 📊 Data Flow: Kalkulasi KPI

```
1. INPUT REALISASI (Unit Manager)
   ↓
   t_realization (Raw data per indicator)
   
2. CALCULATE INDIVIDUAL SCORES (System)
   ↓
   • Group by category (P1, P2, P3)
   • Calculate achievement % per indicator
   • Calculate weighted score per indicator
   • Aggregate per category
   • Apply category weights
   ↓
   t_individual_scores (P1, P2, P3 breakdown)
   
3. CALCULATE FINAL DISTRIBUTION (System)
   ↓
   • Get pool allocation
   • Calculate unit allocation (by proportion)
   • Calculate individual proportion (score-based)
   • Calculate gross incentive
   • Calculate tax (PPh 21 TER)
   • Calculate net incentive
   ↓
   t_calculation_results (Final audit trail)
   
4. OUTPUT (Employee)
   ↓
   • Dashboard view
   • PDF slip download
   • Excel export
```

### 🔐 Security Model

#### Role-Based Access Control (RBAC)

| Role          | Permissions                                    |
|---------------|------------------------------------------------|
| Superadmin    | Full access to all data and configurations     |
| Unit Manager  | Manage KPI realization for their unit only    |
| Employee      | View personal dashboard and download slip      |

#### Row Level Security (RLS) Implementation

```sql
-- Example: Employees table
CREATE POLICY "Unit managers can view employees in their unit"
  ON m_employees FOR SELECT
  USING (unit_id = get_user_unit_id());

CREATE POLICY "Employees can view their own record"
  ON m_employees FOR SELECT
  USING (id = get_current_employee());
```

### 📐 Formula Breakdown

#### 1. Individual Score Calculation
```
Skor P1 = Σ(Achievement_i × Weight_i) untuk semua indikator P1
Skor P2 = Σ(Achievement_i × Weight_i) untuk semua indikator P2
Skor P3 = Σ(Achievement_i × Weight_i) untuk semua indikator P3

Skor Individual = (W_p1 × Skor_P1) + (W_p2 × Skor_P2) + (W_p3 × Skor_P3)
```

#### 2. Achievement Calculation
```
Achievement % = (Realisasi / Target) × 100%
```

#### 3. Pool Distribution
```
Net Pool = Total Revenue - Total Deductions
Allocated Amount = Net Pool × Global Allocation %
Unit Allocation = Allocated Amount × Unit Proportion %
```

#### 4. Individual Incentive
```
Individual Proportion = Employee Score / Total Unit Scores
Gross Incentive = Unit Allocation × Individual Proportion
Tax Amount = Gross Incentive × TER Rate (based on tax status)
Net Incentive = Gross Incentive - Tax Amount
```

### 🗂️ File Structure

```
jaspel-kpi-system/
├── app/                          # Next.js App Router
│   ├── admin/                    # Superadmin pages
│   │   └── dashboard/
│   ├── manager/                  # Unit Manager pages
│   │   └── dashboard/
│   ├── employee/                 # Employee pages
│   │   └── dashboard/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                   # React components
│   └── ui/                       # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── tabs.tsx
│
├── lib/                          # Core libraries
│   ├── formulas/
│   │   └── kpi-calculator.ts    # Decimal.js calculations
│   ├── export/
│   │   ├── excel-export.ts      # XLSX export
│   │   └── pdf-export.ts        # jsPDF export
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   └── server.ts            # Server client
│   ├── types/
│   │   └── database.types.ts    # TypeScript types
│   └── utils.ts
│
├── services/                     # Business logic
│   └── calculation.service.ts   # Main calculation engine
│
├── supabase/                     # Database
│   ├── schema.sql               # Full schema + RLS
│   └── seed.sql                 # Sample data
│
├── middleware.ts                 # Supabase auth middleware
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
│
└── Documentation/
    ├── README.md                # Main documentation
    ├── DEPLOYMENT.md            # Deployment guide
    ├── API.md                   # API documentation
    ├── USAGE_EXAMPLES.md        # Usage examples
    └── PROJECT_SUMMARY.md       # This file
```

### 🔧 Technology Stack

| Layer              | Technology                    | Purpose                          |
|--------------------|-------------------------------|----------------------------------|
| Frontend           | Next.js 15 (App Router)       | React framework with SSR         |
| UI Components      | Shadcn UI + Tailwind CSS      | Modern, accessible components    |
| Backend            | Next.js Server Actions        | Server-side business logic       |
| Database           | Supabase (PostgreSQL)         | Database + Auth + RLS            |
| Calculations       | Decimal.js                    | High-precision math              |
| PDF Generation     | jsPDF + jsPDF-AutoTable       | PDF export                       |
| Excel Export       | XLSX                          | Excel import/export              |
| Type Safety        | TypeScript                    | Static typing                    |
| Deployment         | Vercel                        | Hosting & CI/CD                  |

### 📈 Performance Considerations

1. **Database Indexes**: All foreign keys and frequently queried columns indexed
2. **RLS Optimization**: Policies use indexed columns for filtering
3. **Server-Side Rendering**: Dashboard data fetched on server
4. **Decimal.js Configuration**: Precision set to 20 digits, ROUND_HALF_UP
5. **Batch Operations**: Bulk insert/update for realization data

### 🔄 Workflow Summary

#### Monthly Cycle

1. **Setup Phase** (Superadmin)
   - Configure KPI indicators if needed
   - Create pool for new period
   - Input revenue and deductions

2. **Input Phase** (Unit Managers)
   - Download KPI template
   - Input realization data (manual or bulk)
   - Verify data completeness

3. **Calculation Phase** (Superadmin)
   - Run calculation engine
   - Review results
   - Approve distribution

4. **Distribution Phase** (All)
   - Employees view dashboard
   - Download incentive slips
   - Export reports for accounting

### 🎯 Key Features Implemented

✅ Row Level Security (RLS) for data isolation
✅ P1, P2, P3 KPI framework with flexible weights
✅ High-precision financial calculations (Decimal.js)
✅ PPh 21 tax calculation (TER method)
✅ Excel template download & bulk import
✅ PDF slip generation with detailed breakdown
✅ Role-based dashboards (3 roles)
✅ Audit trail (t_calculation_results)
✅ Server-side business logic (secure)
✅ Modern UI with Shadcn components

### 🚀 Deployment Checklist

- [ ] Create Supabase project
- [ ] Run schema.sql
- [ ] Run seed.sql (optional)
- [ ] Configure Auth providers
- [ ] Create superadmin user
- [ ] Set environment variables
- [ ] Deploy to Vercel
- [ ] Configure custom domain (optional)
- [ ] Test RLS policies
- [ ] Run sample calculation
- [ ] Generate test reports

### 📞 Support & Maintenance

**Regular Tasks:**
- Monthly pool creation
- Quarterly KPI review
- Annual tax rate updates
- Database backup verification

**Monitoring:**
- Supabase dashboard (API usage, DB connections)
- Vercel analytics (performance, errors)
- User feedback collection

**Updates:**
- Next.js version updates
- Supabase client updates
- Security patches
- Feature enhancements based on feedback

---

**Project Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2024-03-05
