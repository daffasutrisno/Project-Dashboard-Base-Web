# KPI Monitoring Dashboard - Implementation Guide

## 📁 Struktur Project

```
src/
├── components/
│   └── kpi/
│       ├── KPILineChart.tsx       # ✅ Reusable line chart component
│       ├── KPIAreaChart.tsx       # ✅ Reusable area chart component
│       ├── KPIBarChart.tsx        # ✅ Reusable bar chart component
│       ├── KPIDualAxisChart.tsx   # ⏳ TODO: Dual Y-axis (line + bar)
│       └── KPIStackedChart.tsx    # ⏳ TODO: Stacked bar (100% & absolute)
├── pages/
│   └── KPI/
│       ├── FourG/                 # 12 pages for 4G charts
│       │   ├── Availability4G.tsx       # ✅ Chart 1
│       │   ├── S1Failure4G.tsx          # ⏳ Chart 2
│       │   ├── RRCConn4G.tsx            # ⏳ Chart 3
│       │   ├── Traffic4G.tsx            # ✅ Chart 4
│       │   ├── EUTCells4G.tsx           # ⏳ Chart 5 (dual-axis)
│       │   ├── DLPRBUtil4G.tsx          # ⏳ Chart 6 (dual-axis)
│       │   ├── CQICells4G.tsx           # ⏳ Chart 7 (dual-axis)
│       │   ├── DLUserThp4G.tsx          # ⏳ Chart 8
│       │   ├── TrafficStacked.tsx       # ⏳ Chart 9 (stacked bar)
│       │   ├── TrafficRatio.tsx         # ⏳ Chart 10 (100% stacked)
│       │   ├── RRCStacked.tsx           # ⏳ Chart 11 (stacked bar)
│       │   └── RRCRatio.tsx             # ⏳ Chart 12 (100% stacked)
│       ├── FiveG/                 # 12 pages for 5G charts
│       │   ├── Availability5G.tsx       # ✅ Chart 1
│       │   ├── Accessibility5G.tsx      # ✅ Chart 2
│       │   ├── CDR5G.tsx                # ✅ Chart 3 (area)
│       │   ├── SgnbAddition5G.tsx       # ⏳ Chart 4 (bar)
│       │   ├── Traffic5G.tsx            # ⏳ Chart 5 (area)
│       │   ├── EUTvsDLThp5G.tsx         # ⏳ Chart 6 (dual-line)
│       │   ├── User5G.tsx               # ⏳ Chart 7 (bar)
│       │   ├── DLPRBUtil5G.tsx          # ⏳ Chart 8 (dual-axis)
│       │   ├── InterESGNB.tsx           # ⏳ Chart 9 (line)
│       │   ├── IntraESGNB.tsx           # ⏳ Chart 10 (line)
│       │   ├── IntraSGNBIntrafreq.tsx   # ⏳ Chart 11 (line)
│       │   └── InterSGNBIntrafreq.tsx   # ⏳ Chart 12 (line)
│       ├── FourG.tsx              # Landing page 4G
│       └── FiveG.tsx              # Landing page 5G

public/
└── kpi_data/
    ├── data_4g.csv                # ✅ Place your 4G CSV here
    └── data_5g.csv                # ✅ Place your 5G CSV here
```

## ✅ Komponen yang Sudah Dibuat

### 1. KPILineChart (Line Chart)

**Props:**

- `title`: Judul chart
- `csvPath`: Path ke CSV file (e.g., "/kpi_data/data_5g.csv")
- `parameterColumn`: Nama kolom parameter (e.g., "avail_auto_5g")
- `transformPercent`: Boolean - kalikan 100 jika true
- `intervalDays`: Interval sampling dari END (default: 1 = all days)
- `showAllDays`: Override interval, tampilkan semua hari
- `filterPositive`: Filter hanya nilai > 0
- `yAxisFormat`: "percent" | "number" | "comma"
- `yAxisPadding`: Padding % untuk Y-axis (default: 20)
- `fixedYRange`: [min, max] untuk fixed range
- `color`: Warna garis (default: "#1f77b4")

**Contoh Penggunaan:**

```tsx
<KPILineChart
  title="Availability (%)"
  csvPath="/kpi_data/data_5g.csv"
  parameterColumn="avail_auto_5g"
  transformPercent={true}
  showAllDays={true}
  yAxisFormat="percent"
  fixedYRange={[96, 105]}
/>
```

### 2. KPIAreaChart (Area Chart)

**Props:** Similar dengan Line Chart, tanpa `fixedYRange`

**Contoh Penggunaan:**

```tsx
<KPIAreaChart
  title="Call Drop Rate (%)"
  csvPath="/kpi_data/data_5g.csv"
  parameterColumn="g5_cdr"
  intervalDays={2}
  yAxisFormat="percent"
  color="#2ca02c"
/>
```

### 3. KPIBarChart (Bar Chart)

**Props:** Similar dengan Line Chart

**Contoh Penggunaan:**

```tsx
<KPIBarChart
  title="Sgnb Addition SR (%)"
  csvPath="/kpi_data/data_5g.csv"
  parameterColumn="sgnb_addition_sr"
  transformPercent={true}
  intervalDays={2}
  yAxisFormat="percent"
/>
```

## ⏳ TODO: Komponen Lanjutan yang Perlu Dibuat

### 4. KPIDualAxisChart (Dual Y-Axis: Line + Bar)

Untuk chart seperti:

- **5G Chart 8**: DL PRB Util (line) + Count cells (bar)
- **4G Chart 5**: EUT (line) + Cells count (bar)
- **4G Chart 6**: DL PRB Util (line) + Cells count (bar)
- **4G Chart 7**: CQI (line) + Cells count (bar)

**Props yang diperlukan:**

```tsx
interface KPIDualAxisChartProps {
  title: string;
  csvPath: string;
  leftParameter: string; // Line chart column
  rightParameter: string; // Bar chart column
  leftLabel: string; // Legend text for line
  rightLabel: string; // Legend text for bar
  leftTransformPercent?: boolean;
  intervalDays?: number;
  leftColor?: string; // Default: "#1f77b4"
  rightColor?: string; // Default: "#ff7f0e"
}
```

### 5. KPIStackedChart (Stacked Bar - Absolute Values)

Untuk chart seperti:

- **4G Chart 9**: Traffic 4G + 5G (stacked)
- **4G Chart 11**: RRC 4G + 5G (stacked)

**Props yang diperlukan:**

```tsx
interface KPIStackedChartProps {
  title: string;
  csvPath: string;
  bottomParameter: string; // Bottom stack
  topParameter: string; // Top stack
  bottomLabel: string;
  topLabel: string;
  yAxisFormat?: "comma" | "number";
  bottomColor?: string; // Default: "#1f77b4"
  topColor?: string; // Default: "#ff7f0e"
}
```

### 6. KPIStackedPercentChart (100% Stacked Bar)

Untuk chart seperti:

- **4G Chart 10**: Ratio Traffic 4G - 5G
- **4G Chart 12**: Ratio RRC 4G - 5G

**Props yang diperlukan:**

```tsx
interface KPIStackedPercentChartProps {
  title: string;
  csvPath: string;
  bottomParameter: string;
  topParameter: string;
  bottomLabel: string;
  topLabel: string;
  bottomColor?: string;
  topColor?: string;
}
```

### 7. KPIDualLineChart (2 Lines in One Chart)

Untuk chart seperti:

- **5G Chart 6**: EUT vs DL User Thp

**Props yang diperlukan:**

```tsx
interface KPIDualLineChartProps {
  title: string;
  csvPath: string;
  line1Parameter: string;
  line2Parameter: string;
  line1Label: string;
  line2Label: string;
  line1Color?: string;
  line2Color?: string;
}
```

## 🚀 Cara Implementasi Chart Baru

### Step 1: Buat Page Baru

Contoh untuk **5G Chart 4 - Sgnb Addition SR**:

```tsx
// src/pages/KPI/FiveG/SgnbAddition5G.tsx
import PageMeta from "../../../components/common/PageMeta";
import KPIBarChart from "../../../components/kpi/KPIBarChart";

export default function SgnbAddition5G() {
  return (
    <>
      <PageMeta
        title="5G Sgnb Addition SR | KPI Monitoring"
        description="5G Sgnb Addition SR KPI Chart"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            5G KPI Monitoring - Sgnb Addition SR
          </h1>
          <KPIBarChart
            title="Sgnb Addition SR (%)"
            csvPath="/kpi_data/data_5g.csv"
            parameterColumn="sgnb_addition_sr"
            transformPercent={true}
            intervalDays={2}
            yAxisFormat="percent"
            color="#1f77b4"
          />
        </div>
      </div>
    </>
  );
}
```

### Step 2: Update Routing di App.tsx

```tsx
// Import
import SgnbAddition5G from "./pages/KPI/FiveG/SgnbAddition5G";

// Tambah route
<Route path="/kpi-monitoring/5g/sgnb-addition" element={<SgnbAddition5G />} />;
```

### Step 3: Update Sidebar (Opsional - untuk sub-menu)

Jika ingin submenu per chart, update `AppSidebar.tsx`:

```tsx
{
  icon: <GridIcon />,
  name: "KPI Monitoring",
  subItems: [
    {
      name: "5G",
      path: "/kpi-monitoring/5g",
      subItems: [  // Nested submenu
        { name: "Availability", path: "/kpi-monitoring/5g/availability" },
        { name: "Accessibility", path: "/kpi-monitoring/5g/accessibility" },
        // ... 10 more charts
      ]
    },
    { name: "4G", path: "/kpi-monitoring/4g" },
  ],
}
```

## 📊 Mapping Chart → Component

### 5G Charts:

1. ✅ Availability → `KPILineChart` (transformPercent, fixedYRange)
2. ✅ Accessibility → `KPILineChart` (transformPercent, interval=2)
3. ✅ CDR → `KPIAreaChart` (interval=2, include 0)
4. ⏳ Sgnb Addition SR → `KPIBarChart` (transformPercent, interval=2)
5. ⏳ Traffic → `KPIAreaChart` (interval=2, comma format)
6. ⏳ EUT vs DL Thp → `KPIDualLineChart` (2 lines, legend)
7. ⏳ User 5G → `KPIBarChart` (interval=2, comma)
8. ⏳ DL PRB Util → `KPIDualAxisChart` (line + bar, dual y-axis)
   9-12. ⏳ Inter/Intra esgNB/sgNB → `KPILineChart` (transformPercent, interval=2)

### 4G Charts:

1. ✅ Availability → `KPILineChart` (no transform, interval=3)
2. ⏳ S1 Failure → `KPILineChart` (interval=3, comma)
3. ⏳ RRC Conn → `KPILineChart` (interval=3, comma)
4. ✅ Traffic → `KPIAreaChart` (interval=3, comma)
5. ⏳ EUT vs Cells → `KPIDualAxisChart` (line + bar)
6. ⏳ DL PRB Util → `KPIDualAxisChart` (all days)
7. ⏳ CQI → `KPIDualAxisChart` (all days)
8. ⏳ DL User Thp → `KPILineChart` (all days)
9. ⏳ Traffic Stacked → `KPIStackedChart` (absolute)
10. ⏳ Traffic Ratio → `KPIStackedPercentChart` (100%)
11. ⏳ RRC Stacked → `KPIStackedChart` (absolute)
12. ⏳ RRC Ratio → `KPIStackedPercentChart` (100%)

## 📂 Data CSV Format

### data_5g.csv (16 columns):

```
date_column,nc_5g,avail_auto_5g,da_5g,g5_cdr,sgnb_addition_sr,traffic_5g,g5_eut_bhv,g5_userdl_thp,sum_en_dc_user_5g_wd,g5_dlprb_util,dl_prb_util_5g_count_gt_085,inter_esgnb,intra_esgnb,intra_sgnb_intrafreq,inter_sgnb_intrafreq
2024-01-01,100,99.5,98.3,0.5,95.2,1500,45.3,38.2,1200,0.75,5,92.1,94.3,96.5,88.7
...
```

### data_4g.csv (15 columns):

```
date_column,nc_5g,g4_avail_auto,s1_failure,rrc_ue,traffic_4g,eut_4g_bh,eut_4g_bh_count_less_31,dl_prb_util,dl_prb_util_count_gt_09,cqi_bh,cqi_less_than_7,dl_user_thp_bhv,traffic_5g,da_5g
2024-01-01,100,99.2,3,5000,8500,3.5,12,0.88,8,0.75,5,4.2,1500,98.3
...
```

## 🎨 Styling Guidelines

Semua chart sudah mengikuti universal styling:

- ✅ Font: Outfit, sans-serif
- ✅ Grid: Alpha 0.15, dashed, gray
- ✅ X-axis: dd/mm/yyyy, rotate based on data points
- ✅ Y-axis: Auto-scale dengan padding
- ✅ Colors: #1f77b4 (biru), #ff7f0e (oranye), #2ca02c (hijau)
- ✅ Border: Gray, rounded corners
- ✅ Dark mode support

## 🔄 Next Steps

1. **Place CSV files** di `public/kpi_data/`:
   - `data_4g.csv`
   - `data_5g.csv`

2. **Buat komponen advanced** (dual-axis, stacked):
   - Copy pattern dari existing components
   - Sesuaikan dengan ApexCharts syntax untuk stacked/dual-axis

3. **Create remaining pages** (18 pages):
   - Gunakan existing components untuk simple charts
   - Tunggu advanced components untuk complex charts

4. **Test dengan data real**:
   - Verify agregasi MAX() per date
   - Verify interval sampling dari END
   - Verify transformasi percent

5. **Update sidebar** (opsional):
   - Buat nested submenu untuk 24 charts
   - Atau buat landing page dengan grid navigation

**Status:** 8 contoh pages sudah dibuat (5 untuk 5G, 3 untuk 4G). Tinggal implement 16 pages lagi mengikuti pattern yang sama!
