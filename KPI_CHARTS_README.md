# KPI Monitoring Dashboard

Dashboard monitoring KPI untuk jaringan 4G dan 5G dengan 24 chart individual yang menampilkan berbagai metrik performa.

## 📊 Struktur Chart

### 5G Charts (12 Charts)

1. **Availability** - Line chart, transform percent, fixed Y-axis 96-105, all days
2. **Accessibility** - Line chart, transform percent, interval 2 days from END
3. **Call Drop Rate (CDR)** - Area chart, interval 2 days, include zero values
4. **Sgnb Addition SR** - Bar chart, transform percent, interval 2 days
5. **Total Traffic** - Area chart, interval 2 days, comma format
6. **EUT vs DL User Thp** - Dual line chart, all days, with legend
7. **User 5G** - Bar chart, interval 2 days, comma format
8. **DL PRB Utilization** - Dual axis (line + bar), interval 2 days
9. **Inter esgNB Handover** - Line chart, transform percent, interval 2 days
10. **Intra esgNB Handover** - Line chart, transform percent, interval 2 days
11. **Intra sgNB Intrafreq** - Line chart, transform percent, interval 2 days
12. **Inter sgNB Intrafreq** - Line chart, transform percent, interval 2 days

### 4G Charts (12 Charts)

1. **Availability** - Line chart, no transform, interval 3 days
2. **S1 Failure** - Line chart, interval 3 days
3. **RRC Connection** - Line chart, interval 3 days, comma format
4. **Traffic 4G** - Area chart, interval 3 days, comma format
5. **EUT vs #Cells** - Dual axis (line + bar), interval 3 days
6. **DL PRB Utilization** - Dual axis (line + bar), all days
7. **CQI** - Dual axis (line + bar), all days
8. **DL User Throughput** - Line chart, all days
9. **Traffic Stacked** - Stacked bar (4G + 5G absolute values), comma format
10. **Traffic Ratio** - 100% stacked bar (4G vs 5G percentage)
11. **RRC Stacked** - Stacked bar (4G + 5G absolute values), comma format
12. **RRC Ratio** - 100% stacked bar (4G vs 5G percentage)

## 🗂️ Struktur File

```
src/
├── components/kpi/
│   ├── KPILineChart.tsx           # Line chart dasar
│   ├── KPIAreaChart.tsx           # Area chart dengan gradient
│   ├── KPIBarChart.tsx            # Bar chart
│   ├── KPIDualLineChart.tsx       # Dual line chart (2 metrics)
│   ├── KPIDualAxisChart.tsx       # Dual Y-axis (line + bar)
│   ├── KPIStackedChart.tsx        # Stacked bar (absolute)
│   └── KPIStackedPercentChart.tsx # 100% stacked bar
├── pages/KPI/
│   ├── FiveG/                     # 12 chart pages untuk 5G
│   └── FourG/                     # 12 chart pages untuk 4G
public/
└── kpi_data/
    ├── data_4g.csv                # Data 4G (15 columns)
    └── data_5g.csv                # Data 5G (16 columns)
```

## 📁 Format Data CSV

### data_5g.csv (16 kolom)

- `date_column` - Tanggal
- `avail_auto_5g` - Availability (0-1, perlu transform ×100)
- `da_5g` - Accessibility (0-1, perlu transform ×100)
- `g5_cdr` - Call Drop Rate
- `sgnb_addition_sr` - Sgnb Addition Success Rate (0-1)
- `traffic_5g` - Total Traffic (GB)
- `g5_eut_bhv` - EUT BH Value
- `g5_userdl_thp` - DL User Throughput
- `sum_en_dc_user_5g_wd` - Total EN-DC Users
- `g5_dlprb_util` - DL PRB Utilization (0-1)
- `dl_prb_util_5g_count_gt_085` - #Cells with PRB >85%
- `inter_esgnb` - Inter esgNB Handover SR (0-1)
- `intra_esgnb` - Intra esgNB Handover SR (0-1)
- `intra_sgnb_intrafreq` - Intra sgNB Intrafreq HO SR (0-1)
- `inter_sgnb_intrafreq` - Inter sgNB Intrafreq HO SR (0-1)

### data_4g.csv (15 kolom)

- `date_column` - Tanggal
- `g4_avail_auto` - Availability 4G (sudah dalam %)
- `s1_failure` - S1 Failure Rate
- `rrc_ue` - RRC Connection Users
- `traffic_4g` - Total Traffic 4G (GB)
- `eut_4g_bh` - EUT BH Value
- `eut_4g_bh_count_less_31` - #Cells <31 Mbps
- `dl_prb_util` - DL PRB Utilization (0-1)
- `dl_prb_util_count_gt_09` - #Cells >90%
- `cqi_bh` - CQI BH Value
- `cqi_less_than_7` - #Cells CQI <7
- `dl_user_thp_bhv` - DL User Throughput
- `traffic_5g` - Traffic 5G (untuk stacked chart)

## 🔧 Komponen & Props

### KPILineChart

```tsx
<KPILineChart
  title="Chart Title"
  csvPath="/kpi_data/data_5g.csv"
  parameterColumn="column_name"
  transformPercent={true} // Multiply by 100
  intervalDays={2} // Sample from END
  showAllDays={false} // Override interval
  fixedYRange={[96, 105]} // Optional fixed Y-axis
  yAxisFormat="percent" // "percent" | "comma" | "number"
  color="#1f77b4"
/>
```

### KPIAreaChart

```tsx
<KPIAreaChart
  title="Chart Title"
  csvPath="/kpi_data/data_5g.csv"
  parameterColumn="column_name"
  intervalDays={2}
  filterPositive={true} // Filter out zero values
  yAxisFormat="comma"
  color="#1f77b4"
/>
```

### KPIBarChart

```tsx
<KPIBarChart
  title="Chart Title"
  csvPath="/kpi_data/data_5g.csv"
  parameterColumn="column_name"
  transformPercent={true}
  intervalDays={2}
  yAxisFormat="percent"
  color="#1f77b4"
/>
```

### KPIDualLineChart

```tsx
<KPIDualLineChart
  title="Chart Title"
  csvPath="/kpi_data/data_5g.csv"
  line1Parameter="metric1"
  line2Parameter="metric2"
  line1Label="Label 1"
  line2Label="Label 2"
  showAllDays={true}
  line1Color="#1f77b4"
  line2Color="#ff7f0e"
/>
```

### KPIDualAxisChart

```tsx
<KPIDualAxisChart
  title="Chart Title"
  csvPath="/kpi_data/data_5g.csv"
  leftParameter="metric1" // Line (left Y-axis)
  rightParameter="metric2" // Bar (right Y-axis)
  leftLabel="Label 1"
  rightLabel="Label 2"
  leftTransformPercent={true}
  intervalDays={2}
  showAllDays={false}
  leftColor="#1f77b4"
  rightColor="#ff7f0e"
/>
```

### KPIStackedChart

```tsx
<KPIStackedChart
  title="Chart Title"
  csvPath="/kpi_data/data_4g.csv"
  bottomParameter="traffic_4g"
  topParameter="traffic_5g"
  bottomLabel="4G"
  topLabel="5G"
  yAxisFormat="comma"
  bottomColor="#1f77b4"
  topColor="#ff7f0e"
/>
```

### KPIStackedPercentChart

```tsx
<KPIStackedPercentChart
  title="Chart Title"
  csvPath="/kpi_data/data_4g.csv"
  bottomParameter="traffic_4g"
  topParameter="traffic_5g"
  bottomLabel="4G"
  topLabel="5G"
  bottomColor="#1f77b4"
  topColor="#ff7f0e"
/>
```

## 🎨 Styling Guidelines

Semua chart mengikuti universal guidelines:

- **Font**: Outfit
- **Primary Color**: #1f77b4 (blue)
- **Secondary Color**: #ff7f0e (orange)
- **Tertiary Color**: #2ca02c (green)
- **Grid Alpha**: 0.15
- **Date Format**: dd/mm/yyyy
- **Label Rotation**: 90° jika >20 data points, 45° jika ≤20

## 🔄 Data Processing

### MAX Aggregation

Setiap tanggal di-aggregate menggunakan MAX value:

```typescript
const dataMap = new Map<string, number>();
// For each row with same date:
dataMap.set(date, Math.max(current, newValue));
```

### Interval Sampling (dari END)

```typescript
// Reverse array, ambil setiap N-th item, reverse kembali
const reversed = [...sortedData].reverse();
const sampled = reversed.filter((_, idx) => idx % intervalDays === 0);
const result = sampled.reverse();
```

### Percent Transform

```typescript
const transformed = value * 100; // 0.95 → 95
```

## 🚀 Routing

Semua 24 chart dapat diakses via:

- `/kpi-monitoring/5g/availability`
- `/kpi-monitoring/5g/accessibility`
- `/kpi-monitoring/5g/cdr`
- `/kpi-monitoring/5g/sgnb-addition`
- `/kpi-monitoring/5g/traffic`
- `/kpi-monitoring/5g/eut-dl-thp`
- `/kpi-monitoring/5g/user`
- `/kpi-monitoring/5g/dl-prb-util`
- `/kpi-monitoring/5g/inter-esgnb`
- `/kpi-monitoring/5g/intra-esgnb`
- `/kpi-monitoring/5g/intra-sgnb-intrafreq`
- `/kpi-monitoring/5g/inter-sgnb-intrafreq`
- `/kpi-monitoring/4g/availability`
- `/kpi-monitoring/4g/s1-failure`
- `/kpi-monitoring/4g/rrc-conn`
- `/kpi-monitoring/4g/traffic`
- `/kpi-monitoring/4g/eut-cells`
- `/kpi-monitoring/4g/dl-prb-util`
- `/kpi-monitoring/4g/cqi`
- `/kpi-monitoring/4g/dl-user-thp`
- `/kpi-monitoring/4g/traffic-stacked`
- `/kpi-monitoring/4g/traffic-ratio`
- `/kpi-monitoring/4g/rrc-stacked`
- `/kpi-monitoring/4g/rrc-ratio`

## ✅ Status

- ✅ 7 reusable components created
- ✅ 12 chart pages untuk 5G
- ✅ 12 chart pages untuk 4G
- ✅ Routing configured
- ✅ Sidebar menu updated
- ✅ CSV data uploaded
- ✅ No TypeScript errors
